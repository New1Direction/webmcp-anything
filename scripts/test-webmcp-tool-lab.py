#!/usr/bin/env python3
"""Check the guide finder and its native tool contracts in Chrome."""

import argparse
import json
import subprocess
import tempfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
DEMO = ROOT / "examples" / "browser-demo"
FLAGS = ["--enable-features=WebMCP,WebMCPTesting,DevToolsWebMCPSupport"]
EXPECTED_TOOLS = ["get_guide_results", "search_guides"]


def check_behavior(chromium, executable, origin):
    with chromium.launch(executable_path=executable, args=FLAGS) as browser:
        context = browser.new_context(viewport={"width": 375, "height": 790})
        context.route("**/*", lambda route: route.continue_()
                      if route.request.url.startswith(origin + "/") else route.abort())
        page = context.new_page()
        page.set_default_timeout(5000)
        page.goto(origin + "/tool-lab.html")
        expect(page.get_by_role("status")).to_have_text("3 guides found")

        page.get_by_label("Topic", exact=True).select_option("testing")
        page.get_by_role("button", name="Find guides").click()
        expect(page.get_by_role("status")).to_have_text("1 guide found")
        expect(page.locator("#guide-results li")).to_have_attribute("data-guide", "doctor")
        assert page.evaluate("document.documentElement.scrollWidth === document.documentElement.clientWidth")

        proof = page.evaluate("""async () => {
          const context = document.modelContext;
          const available = await context.getTools({ fromOrigins: [location.origin] });
          const find = (name) => available.find((tool) => tool.name === name);
          const invoke = async (tool, args) => {
            const reply = await context.executeTool(tool, args, { signal: AbortSignal.timeout(5000) });
            return typeof reply === "string" ? JSON.parse(reply) : reply;
          };
          const search = find("search_guides");
          const read = find("get_guide_results");
          return {
            names: available.map(({ name }) => name).sort(),
            searchInput: search.inputSchema,
            readerOutput: read.outputSchema,
            search: await invoke(search, { topic: "forms", query: "" }),
            read: await invoke(read, {}),
          };
        }""")
        assert proof["names"] == EXPECTED_TOOLS, proof
        schema = proof["searchInput"]
        assert "topic" in schema["required"], schema
        assert "forms" in schema["properties"]["topic"]["enum"], schema
        output = proof["readerOutput"]
        assert set(output["required"]) == {"topic", "query", "guideIds"}, output
        expected = {"topic": "forms", "query": "", "guideIds": ["declarative-api"]}
        assert proof["search"] == expected, proof["search"]
        assert proof["read"] == expected, proof["read"]
        expect(page.locator("#guide-results li")).to_have_attribute("data-guide", "declarative-api")
        print(f"Chrome {browser.version} synthesized the form schema, ran both tools, and updated the visible results.")


def check_doctor(executable, origin, assets):
    with tempfile.TemporaryDirectory(prefix="wmcp-tool-lab-") as directory:
        baseline_path = Path(directory) / "baseline.json"

        def scan(*args, expect_code=0):
            run = subprocess.run(
                ["node", str(ROOT / "cli" / "wmcp.mjs"), "doctor", "web", origin + "/tool-lab.html",
                 "--chrome", executable, "--json", "--strict", "--wait-ms", "150", *args],
                capture_output=True, text=True, timeout=35,
            )
            assert run.returncode == expect_code, (run.returncode, run.stdout, run.stderr)
            return json.loads(run.stdout)

        baseline = scan()
        assert [tool["name"] for tool in baseline["toolFingerprints"]] == EXPECTED_TOOLS, baseline
        baseline_path.write_text(json.dumps(baseline), encoding="utf-8")
        variants = [
            ("/tool-lab.html", 'value="forms"', 'value="html-forms"', "search_guides", "inputSchema"),
            ("/tool-lab.html", "toolautosubmit", "", "search_guides", "annotations"),
            ("/tool-lab.js", 'items: { type: "string" }', 'items: { type: "number" }',
             "get_guide_results", "outputSchema"),
        ]
        for path, before, after, name, field in variants:
            original = assets[path]
            assert original.count(before) == 1, (path, before)
            assets[path] = original.replace(before, after)
            try:
                preview = scan("--baseline", str(baseline_path), expect_code=2)
                assert preview["drift"]["added"] == [], preview
                assert preview["drift"]["removed"] == [], preview
                assert preview["contractChanges"] == [{"name": name, "fields": [field]}], preview
                print(f"Doctor exited 2 for {name} ({field}) with the tool still registered.")
            finally:
                assets[path] = original
        assert scan("--baseline", str(baseline_path))["status"] == "pass"
        print("Restoring the declarations returned Doctor to exit 0.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--chrome", required=True, help="Path to Chrome for Testing 160 or compatible Chromium")
    args = parser.parse_args()
    assets = {"/" + name: (DEMO / name).read_text(encoding="utf-8")
              for name in ("tool-lab.html", "tool-lab.js")}

    class FixtureHandler(BaseHTTPRequestHandler):
        def log_message(self, *_):
            pass

        def do_GET(self):
            body = assets.get(self.path)
            if body is None:
                self.send_error(404)
                return
            self.send_response(200)
            content_type = "text/html" if self.path.endswith(".html") else "text/javascript"
            self.send_header("Content-Type", content_type + "; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body.encode())

    with ThreadingHTTPServer(("127.0.0.1", 0), FixtureHandler) as server:
        worker = Thread(target=server.serve_forever, daemon=True)
        worker.start()
        origin = f"http://127.0.0.1:{server.server_port}"
        try:
            with sync_playwright() as playwright:
                check_behavior(playwright.chromium, args.chrome, origin)
            check_doctor(args.chrome, origin, assets)
        finally:
            server.shutdown()
            worker.join()


if __name__ == "__main__":
    main()
