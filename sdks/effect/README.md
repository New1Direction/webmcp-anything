# WebMCP browser SDK

Choose the integration by how your page uses tools.

| Use case | Entry point or build |
| --- | --- |
| Smallest download for imperative tools on one page | Standalone `dist/webmcp.min.js` or the ESM `@wmcp/browser/auto` import |
| Application controls installation | Call `installWebMCP()` from `@wmcp/browser` |
| Effect 4 application | Import scoped registration and interruptible calls from `@wmcp/browser/effect`. Install the optional `effect@4.1.5` peer in the app. |
| Compare Wasm registries on your workload | Build the experimental Zig or Rust standalone variant below |
| Discover tools across frames | Use the [W3C polyfill](https://github.com/w3c-oss/webmcp-polyfill) with its frame permission and origin options |

## Automatic selection

Call the selector before registering tools in each participating document:

```ts
import { selectWebMCP } from "@wmcp/browser/select";

const { runtime, context } = await selectWebMCP();
console.log(runtime); // "existing", "core", or "w3c"
```

A context with registration, discovery, and execution takes priority. Otherwise,
a plain document loads the small core. A document inside a frame, or one that
already contains a frame element, loads the W3C implementation. The selector
imports the chosen fallback on demand. Frame detection is a heuristic: set
`scope: "document"` for pages with unrelated embeds, or `scope: "frames"` if
the page will create tool-bearing frames later. Pass the scope in the options
object, e.g. `await selectWebMCP({ scope: "frames" })`. Cross-origin use still
requires the W3C polyfill's frame permissions and origin settings.

For self-hosting, copy the whole generated `dist/selector/` directory and
import `selectWebMCP` from its `select.js` in a module script. Use the selector
as the first WebMCP entry point. Effect helpers can use the returned context.
Zig and Rust remain opt-in benchmark builds.

## Build and use

From this directory run `npm ci && npm run build`. Copy `dist/webmcp.min.js` to
your site's assets and load it before the page registers tools:

```html
<script src="/assets/webmcp.min.js"></script>
```

Serve over HTTPS or localhost. The installer preserves an existing
`document.modelContext`. The fallback implements imperative registration,
discovery, and execution within the current document. Native browser-agent
integration and declarative forms require browser support.

For a bundler project, run `npm pack` after building, then install the resulting
tarball in the consuming project. Import `@wmcp/browser/auto` before registering
tools or use the explicit installer. The root and auto entry points have no
runtime JavaScript dependencies.

## Experimental Wasm builds

Run `npm run build:zig` with Zig 0.14.1 or `npm run build:rust` with Rust 1.95
and the wasm32-unknown-unknown target installed. Copy the resulting
`dist/webmcp-zig.min.js` or `dist/webmcp-rust.min.js` in place of the default
script. Each embeds its Wasm module. Build optional variants before packing
if consumers need the scripts in their tarball.

In the initial build comparison, the default, Zig, and Rust builds measured 1,106, 7,303, and 14,344 gzip bytes,
respectively, with the pinned compiler and bundler versions. To measure your
local builds in Chrome, install Python Playwright and run:

```sh
python3 test/benchmark.py dist/webmcp.min.js /path/to/w3c/polyfill.js /path/to/chrome dist/webmcp-zig.min.js dist/webmcp-rust.min.js
```

## Effect 4 usage

```ts
import { Effect } from "effect";
import { connect, executeTool, getTools, registerTool } from "@wmcp/browser/effect";

const readTitle = Effect.scoped(Effect.gen(function* () {
  const context = yield* connect;
  yield* registerTool(context, {
    name: "page_title",
    description: "Read this page's title",
    execute: () => Effect.sync(() => ({ title: document.title })),
  });
  const tools = yield* getTools(context);
  const title = tools.find(tool => tool.name === "page_title");
  if (!title) throw new Error("Missing page_title registration");
  return yield* executeTool(context, title);
}));

console.log(await Effect.runPromise(readTitle));
```

The result is a JSON string. Registration lasts for the enclosing scope. For a
long-lived tool, keep that scope open for the lifetime of the page component.
Interrupting execution forwards an AbortSignal to the browser. Tool handlers
should validate caller input before using it.
