"""Build first, then run with Python Playwright and a Chrome executable argument."""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright

assets = Path(__file__).resolve().parents[1] / "dist"
select = """async (scope) => {
  const { selectWebMCP } = await import('/selector/select.js');
  return (await selectWebMCP({scope})).runtime;
}"""

with ThreadingHTTPServer(("127.0.0.1", 0), partial(SimpleHTTPRequestHandler, directory=assets)) as server:
    Thread(target=server.serve_forever, daemon=True).start()
    origin = f"http://127.0.0.1:{server.server_port}/"
    with sync_playwright() as pw:
        with pw.chromium.launch(executable_path=sys.argv[1], args=["--disable-features=WebMCP"]) as browser:
            page = browser.new_page()
            requests = []
            page.on("request", lambda request: requests.append(request.url))
            page.goto(origin)
            page.evaluate("""Object.defineProperty(document, 'modelContext', {value: {
                registerTool() {}, getTools() {}, executeTool() {}
            }})""")
            assert page.evaluate(select, "auto") == "existing"
            assert [u for u in requests if "/selector/" in u] == [origin + "selector/select.js"]
            page.goto(origin)
            assert page.evaluate(select, "auto") == "core"
            page.goto(origin)
            page.evaluate("""() => new Promise(resolve => {
              const frame = document.createElement('iframe');
              frame.onload = () => resolve();
              frame.src = '/';
              document.body.append(frame);
            })""")
            assert page.evaluate(select, "auto") == "w3c"
            child = page.frames[1]
            assert child.evaluate(select, "auto") == "w3c"
            child.evaluate("""document.modelContext.registerTool({
              name:'child', description:'Read child title', execute:() => 'hello'
            })""")
            page.wait_for_function("async () => (await document.modelContext.getTools()).some(t => t.name === 'child')")
            assert page.evaluate("""async () => {
              const ctx = document.modelContext;
              return JSON.parse(await ctx.executeTool((await ctx.getTools()).find(t => t.name === 'child')));
            }""") == "hello"
            print("PASS existing, single document, and cross-frame discovery and execution")
    server.shutdown()
