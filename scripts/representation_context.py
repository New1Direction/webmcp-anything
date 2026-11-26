"""Browser-backed evidence extraction for the WMCP representation benchmark."""

import csv
import io
import json
import os
import re
import subprocess
from collections import defaultdict
from urllib.parse import urlsplit

import numpy as np
from lxml import html
from PIL import Image


def encoded_size(value):
    return len(json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8"))


def clean(text):
    return " ".join(text.split())


def key(text):
    return clean(text).casefold()


def parse_metadata(documents):
    nodes, tools = [], []
    for raw in documents:
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            continue
        if not isinstance(data, dict):
            continue
        if data.get("schemaVersion") == "wmcp-capabilities/v1":
            tools.extend(data.get("tools", []))
        if data.get("@context") != "https://schema.org":
            continue
        action = data.get("potentialAction", {})
        if action.get("@type") == "ViewAction" and isinstance(action.get("target"), str):
            nodes.append({"role": "link", "name": action["name"], "href": action["target"],
                          "ref": {"href": action["target"]}})
        for prop in data.get("additionalProperty", []):
            if prop.get("@type") == "PropertyValue":
                nodes.append({"name": prop["name"], "value": prop["value"]})
    return {"nodes": nodes, "tools": tools}


def status_value(name, text):
    prefix = name + ":"
    return clean(text[len(prefix):]) if text.startswith(prefix) else clean(text)


def dom_view(markup, *, include_metadata=True):
    root = html.fromstring(markup)
    ids = root.xpath("//*[@id]")
    labels = {element.get("id"): clean(element.text_content()) for element in ids}
    form_labels = {label.get("for"): clean(label.text_content()) for label in root.xpath("//label[@for]")}
    nodes = []
    for item in root.xpath("//a[@href]|//button|//input|//*[@role='status' or @role='alert']"):
        parents = list(item.iterancestors())
        if any(p.get("hidden") is not None or p.get("aria-hidden") == "true" or p.tag == "template"
               for p in [item, *parents]):
            continue
        identifier = item.get("id")
        role = item.get("role") or {"a": "link", "button": "button", "input": "textbox"}.get(item.tag)
        rendered = clean(item.text_content())
        referenced = " ".join(labels.get(value, "") for value in item.get("aria-labelledby", "").split())
        name = item.get("aria-label") or clean(referenced) or form_labels.get(identifier) or rendered
        if not name:
            continue
        node = {"role": role, "name": name}
        scope = next((p.get("aria-label") for p in parents
                      if (p.tag == "section" or p.get("role") == "region") and p.get("aria-label")), None)
        if scope:
            node["scope"] = scope
        if identifier:
            node["ref"] = {"id": identifier}
        if role == "link":
            node["href"] = item.get("href")
        if role in {"button", "textbox", "link"}:
            node["disabled"] = item.get("disabled") is not None or item.get("aria-disabled") == "true"
        if role == "textbox":
            node["required"] = item.get("required") is not None or item.get("aria-required") == "true"
            node["value"] = item.get("value", "")
        if item.get("aria-pressed") in {"true", "false"}:
            node["pressed"] = item.get("aria-pressed") == "true"
        if role in {"status", "alert"}:
            node["value"] = status_value(name, rendered)
        nodes.append(node)
    views = [{"nodes": nodes}]
    if include_metadata:
        data = root.xpath("//script[@type='application/ld+json' or @id='wmcp-context']/text()")
        views.append(parse_metadata(data))
    return views


def prop(node, name, default=None):
    return node.get(name, {}).get("value", default)


def ax_view(raw, origin=None):
    by_id = {node["nodeId"]: node for node in raw["nodes"]}

    def ancestor_scope(node):
        while node.get("parentId") in by_id:
            node = by_id[node["parentId"]]
            if prop(node, "role") == "region" and prop(node, "name"):
                return prop(node, "name")
        return None

    def text_of(node):
        if prop(node, "role") == "StaticText":
            return prop(node, "name", "")
        return " ".join(text_of(by_id[child]) for child in node.get("childIds", []) if child in by_id)

    nodes = []
    for raw_node in raw["nodes"]:
        role, name = prop(raw_node, "role"), prop(raw_node, "name")
        if raw_node.get("ignored") or not name or role not in {"button", "textbox", "link", "status", "alert"}:
            continue
        state = {p["name"]: prop(p, "value") for p in raw_node.get("properties", [])}
        node = {"role": role, "name": name}
        scope = ancestor_scope(raw_node)
        if scope:
            node["scope"] = scope
        if "backendDOMNodeId" in raw_node:
            node["ref"] = {"ax": raw_node["backendDOMNodeId"]}
        if role == "link" and isinstance(state.get("url"), str):
            url = urlsplit(state["url"])
            same_origin = url.scheme + "://" + url.netloc == origin
            node["href"] = (url.path + ("?" + url.query if url.query else "") +
                            ("#" + url.fragment if url.fragment else "")) if same_origin else state["url"]
        if role in {"button", "textbox", "link"}:
            node["disabled"] = state.get("disabled") in (True, "true")
        if role == "textbox":
            node["required"] = state.get("required") in (True, "true")
            if isinstance(prop(raw_node, "value"), str):
                node["value"] = prop(raw_node, "value")
        if state.get("pressed") in (True, False, "true", "false"):
            node["pressed"] = state["pressed"] in (True, "true")
        if role in {"status", "alert"}:
            node["value"] = status_value(name, clean(text_of(raw_node)))
        nodes.append(node)
    return {"nodes": nodes}


def ocr_lines(png, segmentation="11"):
    data = subprocess.run(
        ["tesseract", "stdin", "stdout", "-l", "eng", "--psm", segmentation, "tsv"], input=png,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True, timeout=15,
        env={**os.environ, "OMP_THREAD_LIMIT": "1"},
    ).stdout.decode("utf-8")
    lines = defaultdict(list)
    for row in csv.DictReader(io.StringIO(data), delimiter="\t", quoting=csv.QUOTE_NONE):
        text = row.get("text", "").strip()
        if row.get("level") != "5" or not text:
            continue
        x, y, width, height = (int(row[dimension]) for dimension in ("left", "top", "width", "height"))
        lines[(row["block_num"], row["par_num"], row["line_num"])].append(
            {"text": text, "box": [x, y, x + width, y + height]})
    return list(lines.values())


def color_masks(pixels):
    red, green, blue = pixels[:, :, 0], pixels[:, :, 1], pixels[:, :, 2]
    return {
        "red": (red >= 145) & (green <= 100) & (blue <= 110),
        "blue": (blue >= 145) & (green <= 160) & (red <= 110),
    }


def pixel_labels(masks, lines, colors):
    observations = {}
    for color in colors:
        mask = masks.get(color)
        if mask is None:
            continue
        hits = []
        for line in lines:
            left = min(word["box"][0] for word in line)
            top = min(word["box"][1] for word in line)
            bottom = max(word["box"][3] for word in line)
            if np.any(mask[max(0, top - 3):bottom + 3, max(0, left - 170):left].sum(axis=1) >= 25):
                hits.append(" ".join(word["text"] for word in line))
        if len(hits) == 1:
            observations[color] = hits[0]
    return observations


def screenshot_view(png, colors):
    visual = {}
    if colors:
        pixels = np.array(Image.open(io.BytesIO(png)).convert("RGB"))
        masks = color_masks(pixels)
        for mask in masks.values():
            pixels[mask] = 255
        text_image = io.BytesIO()
        Image.fromarray(pixels).save(text_image, format="PNG")
        lines = ocr_lines(text_image.getvalue(), segmentation="6")
        visual = pixel_labels(masks, lines, colors)
    else:
        lines = ocr_lines(png)
    nodes = []
    for line in lines:
        phrase = " ".join(word["text"] for word in line)
        label, separator, value = phrase.partition(": ")
        if separator:
            nodes.append({"name": label, "value": value})
    return {"nodes": nodes, "lines": lines, "visual": visual}


def matches_target(node, target):
    return (key(node["name"]) == key(target["name"])
            and (not target.get("scope") or node.get("scope") == target["scope"])
            and (not target.get("role") or "role" not in node or node["role"] == target["role"]))


def matching_nodes(view, target):
    return [node for node in view.get("nodes", []) if matches_target(node, target)]


def ocr_handle(view, target):
    if target.get("scope"):
        return None
    words = key(target["name"]).split()
    candidates = []
    for line in view.get("lines", []):
        for start in range(len(line) - len(words) + 1):
            part = line[start:start + len(words)]
            if [key(word["text"]) for word in part] == words:
                xs = [point for word in part for point in (word["box"][0], word["box"][2])]
                ys = [point for word in part for point in (word["box"][1], word["box"][3])]
                candidates.append({"xy": [(min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2]})
    return candidates[0] if len(candidates) == 1 else None


def lookup(views, request):
    kind = request["kind"]
    for view in views:
        if kind == "tool":
            tool = next((tool for tool in view.get("tools", []) if tool["name"] == request["tool"]), {})
            if request["field"] in tool:
                return tool[request["field"]]
        elif kind == "visual":
            if request["color"] in view.get("visual", {}):
                return view["visual"][request["color"]]
        else:
            nodes = matching_nodes(view, request["target"])
            if len(nodes) == 1 and request["field"] in nodes[0]:
                return nodes[0][request["field"]]
            if not nodes and request["field"] == "ref":
                if handle := ocr_handle(view, request["target"]):
                    return handle
    return None


def collect_targets(request):
    for field in ("target", "submit"):
        if field in request:
            yield request[field]
    yield from request.get("options", [])


def task_fields(request):
    fields = {"name", "role", "scope"}
    if request["intent"] == "answer" and "field" in request:
        fields.add(request["field"])
    if request["intent"] == "navigate":
        fields.update({"ref", "href", "disabled"})
    if request["intent"] in {"reserve", "submit"}:
        fields.update({"ref", "disabled", "required"})
    return fields


def project(view, request):
    """Keep task targets and the evidence needed to disambiguate them."""
    targets = list(collect_targets(request))
    contract_fields = ("name", "effect", "interface", "inputSchema", "outputSchema", "preconditions", "postconditions", "sideEffect")
    fields = task_fields(request)
    return {
        "nodes": [{field: value for field, value in node.items() if field in fields}
                  for node in view.get("nodes", []) if any(matches_target(node, target) for target in targets)],
        "tools": [{field: tool[field] for field in contract_fields if field in tool}
                  for tool in view.get("tools", []) if tool["name"] == request.get("tool")],
        "visual": {color: label for color, label in view.get("visual", {}).items() if color == request.get("color")},
    }


def enrich(view, supplement):
    supplements = supplement.get("nodes", [])
    for patch in supplements:
        matches = [node for node in view["nodes"] if node.get("ref") == patch["ref"]]
        if len(matches) == 1:
            matches[0].update(patch)


def targeted_href(cdp, target, views):
    handle = lookup(views, {"kind": "node", "target": target, "field": "ref"})
    if not handle or "ax" not in handle:
        return {}, 0
    root = cdp.send("DOM.getDocument", {"depth": 0})
    ids = cdp.send("DOM.pushNodesByBackendIdsToFrontend", {"backendNodeIds": [handle["ax"]]})
    node_id = ids["nodeIds"][0]
    size = encoded_size(root) + encoded_size(ids)
    if not node_id:
        return {}, size
    raw = cdp.send("DOM.getAttributes", {"nodeId": node_id})
    values = raw["attributes"]
    attributes = dict(zip(values[::2], values[1::2], strict=True))
    view = {"nodes": [{**target, "href": attributes["href"], "ref": handle}]} if "href" in attributes else {}
    return view, size + encoded_size(raw)


def targeted_value(page, target, views):
    handle = lookup(views, {"kind": "node", "target": target, "field": "ref"})
    if not handle or "id" not in handle:
        return {}, 0
    selector = "[id=" + json.dumps(handle["id"]) + "]"
    value = page.locator(selector).input_value(timeout=500)
    return {"nodes": [{**target, "value": value, "ref": handle}]}, encoded_size(value)


def targeted_semantics(page, request):
    """Query named affordances and return only task-relevant live fields."""
    result = {"nodes": []}
    size = 0
    fields = sorted(task_fields(request))
    for target in collect_targets(request):
        locator = page.get_by_role("region", name=target["scope"], exact=True) if target.get("scope") else page
        locator = locator.get_by_role(target["role"], name=target["name"], exact=True)
        hits = locator.evaluate_all("""(elements, fields) => elements.map(node => {
            const properties = {};
            if (fields.includes("ref") && node.id) properties.ref = {id: node.id};
            if (fields.includes("disabled")) properties.disabled =
                node.matches(":disabled") || !!node.closest('[aria-disabled="true"]');
            if (fields.includes("required")) properties.required =
                node.required === true || node.getAttribute("aria-required") === "true";
            if (fields.includes("href") && node.hasAttribute("href")) properties.href = node.getAttribute("href");
            if (fields.includes("pressed") && node.hasAttribute("aria-pressed"))
                properties.pressed = node.getAttribute("aria-pressed") === "true";
            if (fields.includes("value")) properties.value =
                typeof node.value === "string" ? node.value : node.innerText;
            return properties;
        })""", fields)
        size += encoded_size(hits)
        for properties in hits:
            if target["role"] in {"status", "alert"} and "value" in properties:
                properties["value"] = status_value(target["name"], clean(properties["value"]))
            result["nodes"].append({**target, **properties})
    return result, size
