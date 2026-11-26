#!/usr/bin/env python3
"""Exercise the WMCP ecosystem map in Chromium."""

import argparse
import subprocess
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]


def verify(page, origin, screenshot):
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(origin)
    expect(page.locator("#map-subtitle")).to_have_text("4 clusters · 5 services")
    expect(page.locator("#metrics .metric").first).to_contain_text("26")
    expect(page.locator(".cluster")).to_have_count(4)
    expect(page.locator("#stage .node")).to_have_count(5)
    page.wait_for_function("""() => {
      const canvas = document.querySelector('#stage canvas');
      return canvas?.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data.some((value) => value > 0);
    }""")
    if screenshot:
        page.screenshot(path=screenshot)

    page.get_by_label("Map connections").select_option("gap")
    expect(page.locator("#findings .finding")).to_have_count(2)
    page.locator("#findings").get_by_role("button", name="Find an alert ID", exact=False).click()
    expect(page.locator("#inspect")).to_contain_text("No producer in scope")
    expect(page.locator("#inspect .pill")).to_have_text("Inferred")
    page.get_by_label("Map connections").select_option("documented")
    expect(page.locator("#findings .finding")).to_have_count(0)
    expect(page.locator("#stage .node")).to_have_count(5)

    page.locator("#stage").get_by_role("button", name="Work queue", exact=False).click()
    expect(page.locator("#map-subtitle")).to_contain_text("Work queue")
    expect(page.locator("#stage .node")).to_have_count(7)
    page.get_by_label("Map connections").select_option("composition")
    page.locator("#findings").get_by_role("button", name="find_by_title → complete_queue_item", exact=False).click()
    expect(page.locator("#inspect .pill")).to_have_text("Policy-checked")
    page.get_by_text("Checked workflow", exact=True).click()
    expect(page.locator("#inspect details[open]")).to_contain_text("complete_queue_item")

    page.get_by_label("Search scope").select_option("capabilities")
    page.get_by_label("Search by outcome").fill("cross off a task")
    page.get_by_role("button", name="Search map").click()
    expect(page.get_by_role("heading", name="Search results")).to_be_visible()
    expect(page.locator("#findings .finding").first).to_contain_text("Mark complete")
    expect(page.locator("#inspect .pill")).to_have_text("Documented")
    expect(page.locator("#map-subtitle")).to_contain_text("WMCP browser taskboard")
    page.reload()
    expect(page.locator("#inspect h3")).to_have_text("Mark complete")
    page.get_by_role("button", name="All services").click()
    expect(page.locator(".cluster")).to_have_count(4)

    page.set_viewport_size({"width": 375, "height": 780})
    assert page.evaluate("document.documentElement.scrollWidth === document.documentElement.clientWidth")
    assert not errors, errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--chrome", help="Chrome executable")
    parser.add_argument("--screenshot", type=Path)
    args = parser.parse_args()
    server = subprocess.Popen(["node", str(ROOT / "examples/ecosystem-map/server.mjs"), "--port", "0"],
                              stdout=subprocess.PIPE, text=True)
    try:
        origin = server.stdout.readline().split(" · ")[-1].strip()
        assert origin.startswith("http://127.0.0.1:"), origin
        with sync_playwright() as playwright:
            with playwright.chromium.launch(executable_path=args.chrome) as browser:
                page = browser.new_page(viewport={"width": 1440, "height": 1000})
                page.set_default_timeout(4000)
                verify(page, origin, args.screenshot)
                print(f"PASS ecosystem map UI ({browser.version})")
    finally:
        server.terminate()
        server.wait(timeout=8)


if __name__ == "__main__":
    main()
