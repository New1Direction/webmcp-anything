#!/usr/bin/env python3
"""Exercise the local MCP inspector through its browser controls."""

import argparse
import json
import re
import subprocess
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "examples" / "mcp-inspector"


def verify(page, origin, screenshot):
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(origin)
    expect(page.get_by_text("Tool lifecycle ·", exact=False)).to_be_visible()
    expect(page.locator(".trace-row")).to_have_count(7)
    expect(page.locator("#details .event").filter(has_text="Progress update")).to_have_count(3)
    expect(page.get_by_role("heading", name="Schema validation", exact=True)).to_be_visible()
    expect(page.locator(".span").first).to_be_visible()
    if screenshot:
        page.screenshot(path=screenshot)

    page.get_by_role("searchbox", name="Filter requests").fill("summary")
    expect(page.locator(".trace-row")).to_have_count(0)
    page.get_by_role("searchbox", name="Filter requests").fill("get_runbook")
    expect(page.locator(".trace-row")).to_have_count(1)
    page.locator(".trace-row").click()
    expect(page.locator("#details h3").first).to_have_text("get_runbook")
    page.get_by_role("searchbox", name="Filter requests").clear()
    page.get_by_role("tab", name="Timeline").focus()
    page.keyboard.press("ArrowRight")
    expect(page.get_by_role("tab", name="Dependency graph")).to_have_attribute("aria-selected", "true")
    expect(page.locator(".relations")).to_contain_text("recorded dependency")
    expect(page.locator(".relations")).to_contain_text("validates output")
    assert page.locator(".graph canvas").evaluate("el => el.width > 0 && el.height > 0")
    page.get_by_role("button", name=re.compile("Tool declaration.*get_runbook")).click()
    expect(page.get_by_role("heading", name="Schema declarations")).to_be_visible()

    page.get_by_role("tab", name="Tools").click()
    expect(page.locator(".tool-row")).to_have_count(4)
    page.get_by_role("button", name=re.compile("search_runbooks.*Input and output schemas")).click()
    page.get_by_text("Output schema", exact=True).last.click()
    expect(page.locator(".payload[open] pre")).to_contain_text("matches")

    page.get_by_role("tab", name="Timeline").click()
    page.get_by_role("button", name=re.compile("Replay")).click()
    expect(page.get_by_role("button", name=re.compile("Pause"))).to_be_visible()
    page.get_by_role("slider", name="Playback position").focus()
    page.keyboard.press("Home")
    expect(page.get_by_role("button", name=re.compile("Replay"))).to_be_visible()
    expect(page.locator(".trace-row")).to_have_count(1)
    page.keyboard.press("End")
    expect(page.locator(".trace-row")).to_have_count(7)

    page.get_by_label("Protocol fixture").select_option("failures")
    page.get_by_role("button", name=re.compile("Run fixture")).click()
    expect(page.get_by_text("Failure states ·", exact=False)).to_be_visible()
    page.get_by_label("Request type").select_option("failures")
    expect(page.locator(".trace-row")).to_have_count(4)
    expect(page.locator(".trace-row").last).to_contain_text("Timed out")
    page.locator(".trace-row").last.click()
    expect(page.locator("#details")).to_contain_text("Client deadline elapsed")

    page.locator("#file").set_input_files(FIXTURES / "traces" / "schema-mismatch.json")
    expect(page.get_by_text("Imported trace ·", exact=False)).to_be_visible()
    expect(page.locator("#details")).to_contain_text("The tool reported success. The schema check failed.")
    expect(page.locator("#details")).to_contain_text("Expected integer.")
    with page.expect_download() as download:
        page.get_by_role("button", name=re.compile("Export redacted")).click()
    text = Path(download.value.path()).read_text(encoding="utf-8")
    assert json.loads(text)["schemaVersion"] == "wmcp-inspector-report/v1"
    assert "example-placeholder" not in text and "synthetic-local-session" not in text

    page.set_viewport_size({"width": 375, "height": 780})
    page.get_by_role("tab", name="Dependency graph").click()
    assert page.evaluate("document.documentElement.scrollWidth === document.documentElement.clientWidth")
    assert not errors, errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--chrome", help="Chrome executable")
    parser.add_argument("--screenshot", type=Path)
    args = parser.parse_args()
    server = subprocess.Popen(["node", str(FIXTURES / "server.mjs"), "0"],
                              stdout=subprocess.PIPE, text=True)
    try:
        origin = server.stdout.readline().split(" · ")[-1].strip()
        assert origin.startswith("http://127.0.0.1:"), origin
        with sync_playwright() as p:
            with p.chromium.launch(executable_path=args.chrome) as browser:
                page = browser.new_page(viewport={"width": 1440, "height": 1000})
                page.set_default_timeout(4000)
                verify(page, origin, args.screenshot)
                print(f"PASS inspector UI ({browser.version})")
    finally:
        server.terminate()
        server.wait(timeout=8)


if __name__ == "__main__":
    main()
