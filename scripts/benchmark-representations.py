#!/usr/bin/env python3
"""Compare page representations on a deterministic browser task suite."""

import argparse
import json
import math
import shutil
import statistics
import subprocess
from pathlib import Path
from time import perf_counter_ns
from urllib.parse import urljoin, urlsplit

from playwright.sync_api import Error as BrowserError, sync_playwright

from representation_context import (
    ax_view, dom_view, encoded_size, enrich, lookup, parse_metadata, project,
    screenshot_view, targeted_href, targeted_semantics, targeted_value,
)

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "examples" / "representations"
MODES = (
    "dom", "dom-only", "accessibility", "metadata", "json-ld", "tool-contract-json", "semantic-json",
    "screenshot", "all-sources", "compact",
    "compact-targeted", "compact-markup", "compact-live-dom", "compact-no-ax", "compact-no-metadata", "compact-no-visual", "compact-no-dom-fallback",
)
VIEWPORT = {"width": 1024, "height": 720}
FIXTURE_ORIGIN = "https://wmcp-fixtures.test"
METADATA_SELECTORS = {
    "metadata": "script[type='application/ld+json'], script#wmcp-context",
    "json-ld": "script[type='application/ld+json']",
    "tool-contract-json": "script#wmcp-context",
}
VISUAL_MODES = {
    "screenshot", "all-sources", "compact", "compact-targeted", "compact-markup",
    "compact-live-dom", "compact-no-ax", "compact-no-metadata", "compact-no-dom-fallback",
}


def load_fixture_routes(context):
    assets = {"/" + path.name: path for path in FIXTURES.iterdir() if path.suffix in {".html", ".css"}}

    def handle(route):
        url = route.request.url
        if not url.startswith(FIXTURE_ORIGIN + "/"):
            route.abort()
            return
        path = assets.get(urlsplit(url).path)
        if path is None or route.request.method != "GET":
            route.fulfill(status=404, body="Fixture not found")
        else:
            route.fulfill(path=path)

    context.route("**/*", handle)


def same(actual, expected):
    return type(actual) is type(expected) and actual == expected


def acquire(page, cdp, mode, request):
    sources = {}
    colors = [request["color"]] if request.get("kind") == "visual" else []

    def take(kind):
        if kind in {"dom", "dom-only"}:
            serialized = page.content()
            sources[kind] = len(serialized.encode("utf-8"))
            return dom_view(serialized, include_metadata=kind == "dom")
        if kind == "accessibility":
            raw = cdp.send("Accessibility.getFullAXTree")
            sources[kind] = encoded_size(raw)
            address = urlsplit(page.url)
            return [ax_view(raw, address.scheme + "://" + address.netloc)]
        if kind in METADATA_SELECTORS:
            raw = page.evaluate("""selector => Array.from(
                document.querySelectorAll(selector), (node) => node.textContent)""", METADATA_SELECTORS[kind])
            sources[kind] = encoded_size(raw)
            return [parse_metadata(raw)]
        if kind == "semantic-json":
            view, sources[kind] = targeted_semantics(page, request)
            return [view]
        png = page.screenshot(animations="disabled", scale="css")
        sources[kind] = len(png)
        return [screenshot_view(png, colors)]

    if not mode.startswith("compact"):
        kinds = ("accessibility", "dom", "screenshot", "metadata") if mode == "all-sources" else (mode,)
        return [view for kind in kinds for view in take(kind)], sources

    if colors:
        views = [] if mode == "compact-no-visual" else take("screenshot")
    elif request.get("kind") == "tool" or request["intent"] == "guard":
        views = [] if mode == "compact-no-metadata" else take("metadata")
    else:
        target = request.get("target")
        if mode == "compact-targeted":
            views = take("semantic-json")
        elif mode in {"compact-markup", "compact-live-dom"}:
            views = take("dom-only")
            if mode == "compact-live-dom" and target and target.get("role") == "textbox" and request.get("field") == "value":
                live, size = targeted_value(page, target, views)
                if size:
                    sources["targeted-dom"] = size
                    enrich(views[0], live)
        else:
            views = [] if mode == "compact-no-ax" else take("accessibility")
            needs_href = request.get("field") == "href" or request["intent"] == "navigate"
            if target and needs_href and mode != "compact-no-dom-fallback":
                criteria = {"kind": "node", "target": target, "field": "href"}
                if lookup(views, criteria) is None:
                    fallback, size = targeted_href(cdp, target, views)
                    if size:
                        sources["targeted-dom"] = size
                    if fallback:
                        enrich(views[0], fallback)
    return [project(view, request) for view in views], sources


def interact(page, cdp, ref, origin, value=None):
    if ref is None:
        return False
    if "id" in ref:
        element = page.locator("[id=" + json.dumps(ref["id"]) + "]")
        if value is None:
            element.click(timeout=550)
        else:
            element.fill(value, timeout=550)
        return True
    if value is not None and "href" in ref:
        return False
    if "href" in ref:
        target = urljoin(page.url, ref["href"])
        parsed = urlsplit(target)
        if parsed.scheme + "://" + parsed.netloc != origin:
            return False
        page.goto(target, wait_until="load")
        return True
    if "ax" in ref:
        cdp.send("DOM.scrollIntoViewIfNeeded", {"backendNodeId": ref["ax"]})
        quads = cdp.send("DOM.getContentQuads", {"backendNodeId": ref["ax"]})["quads"]
        if not quads:
            return False
        quad = quads[0]
        point = [sum(quad[axis::2]) / 4 for axis in (0, 1)]
    else:
        point = ref["xy"]
    page.mouse.click(*point)
    if value is not None:
        page.keyboard.insert_text(value)
    return True


def decide(views, request):
    def field(target, name):
        return lookup(views, {"kind": "node", "target": target, "field": name})

    intent = request["intent"]
    if intent == "answer":
        return lookup(views, request)
    if intent == "guard":
        preconditions = lookup(views, {"kind": "tool", "tool": request["tool"], "field": "preconditions"}) or []
        if any(check.get("kind") == "user-authorization" and check.get("when") == "always" for check in preconditions):
            return "approval-required"
        return "missing-contract"
    if intent == "navigate":
        return field(request["target"], "ref")
    if not request.get("authorized"):
        return None
    if intent == "reserve":
        return next((field(option, "ref") for option in request["options"]
                     if field(option, "disabled") is False), None)
    if intent == "submit":
        field_ref, submit_ref = field(request["target"], "ref"), field(request["submit"], "ref")
        return (field_ref, submit_ref) if field_ref and submit_ref else None
    raise ValueError("Unknown fixture intent: " + intent)


def execute(page, cdp, request, decision, origin):
    intent = request["intent"]
    if intent in {"answer", "guard"} or decision is None:
        return decision
    if intent == "navigate":
        previous = page.url
        if interact(page, cdp, decision, origin):
            if page.url == previous:
                page.wait_for_url(lambda url: url != previous, timeout=550)
            return urlsplit(page.url).path
    if intent == "reserve" and interact(page, cdp, decision, origin):
        return page.locator("#receipt").text_content()
    if intent == "submit":
        field, submit = decision
        if interact(page, cdp, field, origin, request["value"]) and interact(page, cdp, submit, origin):
            return page.locator("#ticket-receipt").text_content()
    return None


def ms(since):
    return (perf_counter_ns() - since) / 1_000_000


def trial(context, origin, task, mode):
    page = context.new_page()
    cdp = context.new_cdp_session(page)
    try:
        response = page.goto(origin + "/" + task["page"], wait_until="load")
        if not response or not response.ok:
            raise RuntimeError("Fixture failed to load: " + task["page"])
        start = perf_counter_ns()
        views, sources = acquire(page, cdp, mode, task["request"])
        capture_ms = ms(start)
        agent_bytes = encoded_size({
            "document": {"origin": origin, "path": urlsplit(page.url).path, "viewport": VIEWPORT},
            "evidence": views,
        })
        decision_start = perf_counter_ns()
        decision = decide(views, task["request"])
        decision_ms = ms(decision_start)
        try:
            result = execute(page, cdp, task["request"], decision, origin)
        except BrowserError:
            result = None
        wrong_effect = task["request"]["intent"] == "guard" and bool(page.locator("#export-result").text_content())
        outcome_ms = ms(start)
        seen = [lookup(views, fact) for fact in task["facts"]]
        retained = sum(same(actual, fact["equals"]) for actual, fact in zip(seen, task["facts"], strict=True))
        return {
            "correct": same(result, task["expected"]) and not wrong_effect,
            "answer": result, "factsRetained": retained, "factsTotal": len(seen),
            "factsMissing": sum(actual is None for actual in seen),
            "factsWrong": sum(actual is not None and not same(actual, fact["equals"])
                              for actual, fact in zip(seen, task["facts"], strict=True)),
            "captureMs": round(capture_ms, 3), "decisionMs": round(decision_ms, 3),
            "readyToOutcomeMs": round(outcome_ms, 3),
            "acquiredBytes": sum(sources.values()), "agentBytes": agent_bytes,
            "sources": sources, "unauthorizedWrites": int(wrong_effect),
        }
    finally:
        page.close()


def percentile(values, p):
    return sorted(values)[max(0, math.ceil(p * len(values)) - 1)]


def summary(per_task):
    rows = [run for runs in per_task.values() for run in runs]
    captures = [row["captureMs"] for row in rows]
    return {
        "correctTasks": sum(all(run["correct"] for run in runs) for runs in per_task.values()),
        "tasks": len(per_task), "correctTrials": sum(row["correct"] for row in rows), "trials": len(rows),
        **{key: sum(row[key] for row in rows) for key in ("factsRetained", "factsTotal", "factsWrong", "factsMissing", "unauthorizedWrites")},
        "medianCaptureMs": round(statistics.median(captures), 2), "p95CaptureMs": round(percentile(captures, 0.95), 2),
        "medianDecisionMs": round(statistics.median(row["decisionMs"] for row in rows), 3),
        "medianReadyToOutcomeMs": round(statistics.median(row["readyToOutcomeMs"] for row in rows), 2),
        "meanAcquiredBytes": round(statistics.mean(row["acquiredBytes"] for row in rows)),
        "meanAgentBytes": round(statistics.mean(row["agentBytes"] for row in rows)),
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--chrome", help="Chrome or Chromium executable. Default uses Playwright's installed Chromium.")
    parser.add_argument("--repeats", default=3, type=int)
    parser.add_argument("--methods", nargs="+", choices=MODES, default=MODES,
                        help="Compare only these representation methods. Defaults to the full suite.")
    args = parser.parse_args()
    if args.repeats < 1:
        parser.error("--repeats must be positive")
    selected = tuple(dict.fromkeys(args.methods))
    if VISUAL_MODES.intersection(selected) and not shutil.which("tesseract"):
        parser.error("Tesseract with English language data is required")
    tasks = json.loads((FIXTURES / "tasks.json").read_text(encoding="utf-8"))["tasks"]
    modes = {mode: {task["id"]: [] for task in tasks} for mode in selected}
    with sync_playwright() as playwright:
        with playwright.chromium.launch(executable_path=args.chrome, headless=True) as browser:
            context = browser.new_context(viewport=VIEWPORT, device_scale_factor=1, locale="en-US")
            load_fixture_routes(context)
            for repetition in range(args.repeats):
                for index, task in enumerate(tasks):
                    start = (repetition + index) % len(selected)
                    for mode in selected[start:] + selected[:start]:
                        modes[mode][task["id"]].append(trial(context, FIXTURE_ORIGIN, task, mode))
            version = browser.version
    ocr = (subprocess.check_output(["tesseract", "--version"], text=True).splitlines()[0]
           if VISUAL_MODES.intersection(selected) else None)
    print(json.dumps({
        "schemaVersion": "wmcp-representation-benchmark/v1", "browser": version, "ocr": ocr,
        "viewport": VIEWPORT, "repetitions": args.repeats,
        "methods": {mode: {"summary": summary(per_task), "tasks": per_task} for mode, per_task in modes.items()},
    }, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
