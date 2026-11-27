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
            page.evaluate("""async () => {
              const ctx = document.modelContext;
              const registration = new AbortController();
              const schema = {type: 'object', properties: {n: {type: 'number'}}};
              const definition = {name: 'echo', description: 'Echo', inputSchema: schema,
                outputSchema: schema, execute: ({n}) => n};
              await ctx.registerTool(definition, {signal: registration.signal});
              const [first] = await ctx.getTools();
              first.inputSchema.properties.n.type = 'string';
              const [second] = await ctx.getTools();
              if (first === second || second.inputSchema.properties.n.type !== 'number' ||
                  second.inputSchema !== second.outputSchema) throw Error('Invalid metadata snapshot');
              registration.abort();
              if ((await ctx.getTools()).length) throw Error('Removed tool still visible');
              await ctx.registerTool(definition);
              const stale = await ctx.executeTool(first, {n: 1}).then(() => '', e => e.name);
              const [replacement] = await ctx.getTools();
              if (stale !== 'NotFoundError' || await ctx.executeTool(replacement, {n: 1}) !== '1')
                throw Error('Incorrect handle after re-registration');
            }""")
            page.evaluate("""async () => {
              const ctx = document.modelContext;
              const schema = JSON.parse('{"__proto__":{"marker":1}}');
              schema.self = schema;
              schema.list = [schema, , schema];
              await ctx.registerTool({name:'graph', description:'Graph', inputSchema:schema, execute() {}});
              const read = async name => (await ctx.getTools()).find(t => t.name === name).inputSchema;
              const graph = await read('graph');
              if (graph.self !== graph || graph.list[2] !== graph || 1 in graph.list ||
                  !Object.hasOwn(graph, '__proto__')) throw Error('Broken graph');
              graph.__proto__.marker = 2;
              if ((await read('graph')).__proto__.marker !== 1) throw Error('Shared snapshot');
              const named = [];
              named.extra = new Map([['a', 1]]);
              await ctx.registerTool({name:'special', description:'Special', inputSchema:named, execute() {}});
              const special = await read('special');
              special.extra.clear();
              if ((await read('special')).extra.get('a') !== 1) throw Error('Invalid fallback copy');
            }""")
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
