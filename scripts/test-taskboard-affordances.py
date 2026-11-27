#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["playwright==1.62.0"]
# ///
"""Exercise the demo through keyboard input, Chromium AX, and native WebMCP."""

import argparse
import json
import os
from contextlib import contextmanager, nullcontext
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlsplit

from playwright.sync_api import Error as PlaywrightError, expect, sync_playwright

DEMO = Path(__file__).resolve().parents[1] / "examples" / "browser-demo"


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


def focus(page, selector):
    active = page.locator(selector)
    expect(active).to_be_focused()
    indicator = active.evaluate("""node => {
      const style = getComputedStyle(node);
      return node.matches(':focus-visible') && style.outlineStyle !== 'none'
        && parseFloat(style.outlineWidth) >= 2;
    }""")
    assert indicator, f"Expected visible focus on {selector}"


def keyboard_checks(page, origin):
    page.goto(origin)
    page.keyboard.press("Tab")
    focus(page, "#task")
    page.keyboard.press("Enter")
    expect(page.get_by_role("alert")).to_have_text("Enter a task name.")
    expect(page.get_by_role("textbox", name="Task name")).to_have_attribute("aria-invalid", "true")
    focus(page, "#task")
    page.keyboard.insert_text("Keyboard task")
    page.keyboard.press("Enter")
    expect(page.get_by_role("status")).to_have_text("Added task #3, Keyboard task.")
    focus(page, "#task")

    page.keyboard.press("Tab")
    focus(page, "#add-task")
    page.keyboard.press("Tab")
    focus(page, "#complete-1")
    page.keyboard.press("Space")
    expect(page.get_by_role("status")).to_have_text("Completed task #1, Explore the WebMCP API.")
    expect(page.locator("#complete-1")).to_have_count(0)
    focus(page, "#complete-2")
    page.keyboard.press("Enter")
    focus(page, "#complete-3")
    page.keyboard.press("Space")
    focus(page, "#task")
    expect(page.locator("#list .state")).to_have_text(["Completed", "Completed", "Completed"])

    page.set_viewport_size({"width": 360, "height": 740})
    page.keyboard.insert_text("W" * 120)
    page.keyboard.press("Enter")
    assert page.evaluate("document.documentElement.scrollWidth === document.documentElement.clientWidth")
    expect(page.locator("#list .state")).to_have_text(["Completed", "Completed", "Completed", "Open"])


def ax_checks(page, origin):
    page.goto(origin)
    session = page.context.new_cdp_session(page)

    def observed(role):
        return [node for node in session.send("Accessibility.getFullAXTree")["nodes"]
                if not node.get("ignored") and node.get("role", {}).get("value") == role]

    def value(node, key):
        return node.get(key, {}).get("value")

    regions = [value(node, "name") for node in observed("region")]
    assert set(regions) == {"New task", "Tasks"}, regions
    field, = observed("textbox")
    assert value(field, "name") == "Task name"
    assert value(field, "description") == "Use 1 to 120 characters on one line."
    assert any(prop["name"] == "required" and value(prop, "value") is True for prop in field["properties"])
    assert [value(node, "name") for node in observed("list")] == ["Tasks"]

    buttons = [value(node, "name") for node in observed("button")]
    assert buttons == ["Add task", "Mark complete Explore the WebMCP API #1", "Mark complete Try an agent tool call #2"], buttons

    page.keyboard.press("Tab")
    page.keyboard.press("Enter")
    expect(page.get_by_role("alert")).to_have_text("Enter a task name.")
    assert observed("alert")
    assert any(value(node, "name") == "Enter a task name." for node in observed("StaticText"))
    page.keyboard.insert_text("Accessibility task")
    page.keyboard.press("Enter")
    expect(page.get_by_role("status")).to_have_text("Added task #3, Accessibility task.")
    status, = observed("status")
    assert any(prop["name"] == "live" and value(prop, "value") == "polite" for prop in status["properties"]), status
    assert "Mark complete Accessibility task #3" in [value(node, "name") for node in observed("button")]
    session.detach()


def native_checks(page, origin):
    observed = []
    cdp = page.context.new_cdp_session(page)
    cdp.on("WebMCP.toolsAdded", lambda event: observed.extend(event["tools"]))
    cdp.send("WebMCP.enable")
    page.goto(origin)
    expect(page.locator("#status")).to_have_text("3 of 3 agent tools available.")
    actions = json.loads((DEMO / "capabilities.json").read_text(encoding="utf-8"))["actions"]
    assert len(observed) == len(actions), observed
    by_signifier = {}
    for action in actions:
        tool, = [candidate for candidate in observed if candidate["name"] == action["name"]]
        title = tool.get("title") or tool["description"].partition(".")[0]
        assert title == action["title"], tool
        assert tool["description"] == action["description"]
        schema = tool["inputSchema"]
        assert (json.loads(schema) if isinstance(schema, str) else schema) == action["inputSchema"]
        by_signifier[title] = tool["name"]

    def begin(title, arguments):
        page.evaluate("""({name, input}) => {
          window.pendingInvocation = navigator.modelContextTesting.executeTool(name, JSON.stringify(input))
            .then(result => ({result}), error => ({error: String(error)}));
        }""", {"name": by_signifier[title], "input": arguments})

    def result():
        handle = page.evaluate("() => window.pendingInvocation")
        if "error" in handle:
            return handle
        return json.loads(json.loads(handle["result"])["content"][0]["text"])

    def review(title, detail):
        dialog = page.get_by_role("dialog", name="Review agent request")
        expect(dialog).to_be_visible()
        expect(dialog).to_have_accessible_description(detail)
        expect(dialog.get_by_role("button", name=title, exact=True)).to_be_visible()
        expect(dialog.get_by_role("button", name="Cancel")).to_be_focused()
        return dialog

    def approve(dialog, title):
        page.keyboard.press("Tab")
        expect(dialog.get_by_role("button", name=title, exact=True)).to_be_focused()
        page.keyboard.press("Enter")
        expect(dialog).to_have_count(0)

    begin("Tasks", {})
    assert len(result()) == 2
    expect(page.get_by_role("dialog")).to_have_count(0)

    begin("Add task", {"text": "Review this task"})
    dialog = review("Add task", "Add task “Review this task”?")
    expect(page.locator("#list li")).to_have_count(2)
    page.evaluate("document.getElementById('review-approve').click()")
    expect(dialog).to_be_visible()
    page.keyboard.press("Escape")
    assert "error" in result()
    expect(page.locator("#list li")).to_have_count(2)

    begin("Add task", {"text": "Review this task"})
    approve(review("Add task", "Add task “Review this task”?"), "Add task")
    created = result()
    assert created == {"text": "Review this task", "id": 3, "done": False}, created
    expect(page.get_by_role("status")).to_have_text("Added task #3, Review this task.")

    begin("Mark complete", {"id": created["id"]})
    dialog = review("Mark complete", "Mark complete for task #3, “Review this task”?")
    expect(page.locator("#complete-3")).to_have_count(1)
    approve(dialog, "Mark complete")
    assert result() == {**created, "done": True}
    expect(page.locator("#complete-3")).to_have_count(0)
    expect(page.get_by_role("status")).to_have_text("Completed task #3, Review this task.")

    begin("Mark complete", {"id": created["id"]})
    assert "error" in result()
    expect(page.get_by_role("dialog")).to_have_count(0)
    cdp.detach()


def polyfill_checks(page, origin):
    page.goto(origin)
    expect(page.locator("#status")).to_have_text("3 of 3 agent tools available.")
    tasks = page.evaluate("""async () => {
      const ctx = document.modelContext;
      const tools = await ctx.getTools();
      const names = tools.map(tool => tool.name).sort();
      if (names.join() !== "add_task,complete_task,list_tasks") {
        throw Error("Unexpected tools: " + names.join());
      }
      const list = tools.find(tool => tool.name === "list_tasks");
      const response = JSON.parse(await ctx.executeTool(list));
      return JSON.parse(response.content[0].text);
    }""")
    assert [task["id"] for task in tasks] == [1, 2], tasks


@contextmanager
def journey_report(name, runtime):
    report = [f"{name} | {runtime}"]

    @contextmanager
    def step(label):
        try:
            yield
        except Exception as error:
            report.append(f"FAIL  {label}\n      {error}")
            raise SystemExit(1) from error
        report.append(f"PASS  {label}")

    try:
        yield step
    finally:
        print("\n".join(report), flush=True)
        if summary := os.environ.get("GITHUB_STEP_SUMMARY"):
            with open(summary, "a", encoding="utf-8") as stream:
                stream.write("### WebMCP journey\n\n```text\n" + "\n".join(report) + "\n```\n\n")


def taskboard_journey(page, origin, runtime):
    def start_call(name, arguments):
        page.evaluate("""({name, args}) => {
          const context = document.modelContext;
          const tool = window.journeyTools.find(t => t.name === name);
          window.journeyReply = null;
          context.executeTool(tool, args).then(value => {
            window.journeyReply = {value};
          }, error => { window.journeyReply = {error: String(error)}; });
        }""", {"name": name, "args": arguments})

    def reply():
        page.wait_for_function("window.journeyReply !== null", timeout=5000)
        return page.evaluate("window.journeyReply")

    def payload(response):
        if "error" in response:
            raise AssertionError(response["error"])
        value = response["value"]
        envelope = json.loads(value) if isinstance(value, str) else value
        return json.loads(envelope["content"][0]["text"])

    def board(expected):
        observed = page.locator("#list li").evaluate_all("""rows => rows.map(row =>
          [row.querySelector('.id').textContent, row.querySelector('.state').textContent])""")
        if observed != expected:
            def describe(rows):
                return ", ".join(f"{task} {state}" for task, state in rows)
            raise AssertionError(f"Expected {describe(expected)}. Observed {describe(observed)}.")

    initial = [["#1", "Open"], ["#2", "Open"]]
    completed = [["#1", "Completed"], ["#2", "Open"]]
    with journey_report("Complete task 1 after approval", runtime) as step:
        with step("Discover list_tasks and complete_task"):
            page.goto(origin)
            expect(page.locator("#status")).to_have_text("3 of 3 agent tools available.")
            names = page.evaluate("""async () => {
              window.journeyTools = await document.modelContext.getTools();
              return window.journeyTools.map(tool => tool.name);
            }""")
            if not {"list_tasks", "complete_task"}.issubset(names):
                raise AssertionError(f"Observed tools: {names}")
        with step("List both open tasks"):
            start_call("list_tasks", {})
            tasks = payload(reply())
            if [(task["id"], task["done"]) for task in tasks] != [(1, False), (2, False)]:
                raise AssertionError(f"Unexpected tasks: {tasks}")
            board(initial)
        detail = f'Mark complete for task #1, “{tasks[0]["text"]}”?'
        dialog = page.get_by_role("dialog", name="Review agent request")
        for decision in ("Cancel", "Mark complete"):
            with step(f"Review task #1 before choosing {decision}"):
                start_call("complete_task", {"id": 1})
                expect(dialog).to_have_accessible_description(detail)
                expect(dialog).to_be_visible()
                board(initial)
            with step(f"Choose {decision} and check the tool response"):
                dialog.get_by_role("button", name=decision, exact=True).click()
                response = reply()
                if decision == "Cancel":
                    if "error" not in response:
                        raise AssertionError(f"Expected a rejected call. Observed {response}")
                else:
                    result = payload(response)
            with step(f"Verify visible task IDs and states after {decision}"):
                board(initial if decision == "Cancel" else completed)
        with step("Verify the approved tool returned completed task #1"):
            if result != {**tasks[0], "done": True}:
                raise AssertionError(f"Unexpected result: {result}")


def load_config(path):
    config = json.loads(path.read_text(encoding="utf-8"))
    fields = {"name", "tool", "arguments", "before", "approval", "after"}
    if not isinstance(config, dict) or config.keys() - fields:
        raise ValueError(f"{path}: expected a journey object with fields {', '.join(sorted(fields))}")
    for field in ("name", "tool"):
        if not isinstance(config.get(field), str) or not config[field].strip():
            raise ValueError(f"{path}: {field} must be nonempty text")
    if not isinstance(config.get("arguments", {}), dict):
        raise ValueError(f"{path}: arguments must be an object")
    for field in ("before", "after", "approval"):
        if field == "approval" and field not in config:
            continue
        checks = config.get(field)
        if not isinstance(checks, dict) or not checks:
            raise ValueError(f"{path}: {field} requires a nonempty selector map")
        for selector, expected in checks.items():
            value_check = (field != "approval" and isinstance(expected, dict)
                           and set(expected) == {"value"} and isinstance(expected["value"], str))
            if not selector.strip() or not (isinstance(expected, str) or value_check):
                raise ValueError(f"{path}: invalid {field} assertion for {selector!r}")
        if field == "approval" and len(checks) != 1:
            raise ValueError(f"{path}: approval must specify exactly one button")
    return config


def configured_journey(page, url, config, runtime):
    def verify(checks):
        for selector, expected in checks.items():
            element = page.locator("css=" + selector)
            expect(element).to_be_visible()
            if isinstance(expected, dict):
                expect(element).to_have_value(expected["value"])
            else:
                expect(element).to_have_text(expected)

    with journey_report(config["name"], runtime) as step:
        with step("Open page and check starting state"):
            page.goto(url, wait_until="domcontentloaded")
            verify(config["before"])
        with step(f"Discover {config['tool']}"):
            # Keep the discovered handle in the page. Native tool handles cannot
            # be serialized to Python and reconstructed for execution.
            tool = page.wait_for_function("""async name => {
              const ctx = document.modelContext;
              if (!ctx) return false;
              const matches = (await ctx.getTools()).filter(t => t.name === name);
              if (matches.length > 1) throw Error('Ambiguous tool name: ' + name);
              return matches[0] || false;
            }""", arg=config["tool"], timeout=5000)
        with step("Invoke tool"):
            pending = page.evaluate_handle("""([tool, args]) => {
              const signal = AbortSignal.timeout(15000);
              const state = {done:false, error:null};
              document.modelContext.executeTool(tool, args, {signal}).then(
                () => { state.done = true; },
                e => { state.error = String(e); state.done = true; });
              return state;
            }""", [tool, config.get("arguments", {})])
        if "approval" in config:
            with step("Check approval button and approve"):
                verify(config["approval"])
                verify(config["before"])
                selector, = config["approval"]
                page.locator("css=" + selector).click()
        with step("Check tool completed"):
            page.wait_for_function("state => state.done", arg=pending, timeout=15000)
            error = pending.evaluate("state => state.error")
            if error is not None:
                raise AssertionError(error)
        with step("Check visible result"):
            verify(config["after"])


def launch_browser(chromium, executable, flags):
    if executable:
        return chromium.launch(executable_path=executable, args=flags)
    try:
        return chromium.launch(args=flags)
    except PlaywrightError as error:
        if "Executable doesn't exist" not in str(error):
            raise
    try:
        return chromium.launch(channel="chrome", args=flags)
    except PlaywrightError as error:
        if "not found" not in str(error) and "doesn't exist" not in str(error):
            raise
        raise SystemExit("Install Chrome or pass --chrome /path/to/chrome "
                         "(or set WMCP_CHROME).") from None


@contextmanager
def fixture_origin(directory):
    with ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=directory)) as server:
        thread = Thread(target=server.serve_forever, daemon=True)
        thread.start()
        origin = f"http://127.0.0.1:{server.server_port}/"
        try:
            yield origin
        finally:
            server.shutdown()
            thread.join()


def main():
    parser = argparse.ArgumentParser(description=__doc__, epilog="Example: uv run %(prog)s "
                                     "--journey-config examples/browser-demo/journey.json")
    parser.add_argument("--chrome", default=os.environ.get("WMCP_CHROME"),
                        help="Chrome executable (also accepts WMCP_CHROME)")
    parser.add_argument("--polyfill", type=Path, metavar="BUNDLE",
                        help="Run taskboard interoperability checks with a local polyfill bundle")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--journey-config", type=Path, help="JSON file describing a tool call and UI assertions")
    parser.add_argument("--url", help="Running application page (default: serve --demo-dir locally)")
    mode.add_argument("--journey", action="store_true", help="Run the completion and cancellation journey")
    parser.add_argument("--demo-dir", type=Path, default=DEMO, help="Local taskboard fixture directory")
    args = parser.parse_args()
    if args.url and not args.journey_config:
        parser.error("--url requires --journey-config")
    if args.url:
        target = urlsplit(args.url)
        if target.scheme not in ("http", "https") or not target.hostname:
            parser.error("--url must be an HTTP or HTTPS page")
    config = None
    if args.journey_config:
        try:
            config = load_config(args.journey_config)
        except (OSError, ValueError) as error:
            parser.error(str(error))
    with (nullcontext(args.url) if args.url else fixture_origin(args.demo_dir)) as origin:
        with sync_playwright() as playwright:
            flags = ["--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport"]
            checks = (keyboard_checks, ax_checks, native_checks)
            if args.polyfill:
                flags = ["--disable-features=WebMCP"]
                checks = (polyfill_checks,)
            with launch_browser(playwright.chromium, args.chrome, flags) as browser:
                context = browser.new_context(viewport={"width": 1024, "height": 800})
                if not args.url:
                    context.route("**/*", lambda route: route.continue_()
                              if route.request.url.startswith(origin) else route.abort())
                if args.polyfill:
                    probe = context.new_page()
                    probe.route("**/*", lambda route: route.fulfill(content_type="text/html", body="<title>Probe</title>"))
                    probe.goto(origin)
                    assert not probe.evaluate("'modelContext' in document"), "Native WebMCP still active"
                    probe.close()
                    context.add_init_script(path=args.polyfill)
                if args.journey or config:
                    page = context.new_page()
                    page.set_default_timeout(5000)
                    runtime = args.polyfill.name if args.polyfill else ("Page WebMCP" if args.url or config else "Native WebMCP")
                    label = f"{runtime} (Chrome {browser.version})"
                    if config:
                        configured_journey(page, origin, config, label)
                    else:
                        taskboard_journey(page, origin, label)
                    return
                for check in checks:
                    page = context.new_page()
                    page.set_default_timeout(3000)
                    try:
                        check(page, origin)
                        print(f"PASS {check.__name__} ({browser.version})")
                    finally:
                        page.close()


if __name__ == "__main__":
    main()
