# Browser-native WebMCP taskboard

An intentionally tiny, functioning browser app that exposes three real tools:

- list_tasks — read the taskboard
- add_task — create a task and update the visible UI
- complete_task — mark a task complete and update the visible UI

No backend, payments, LLM API keys, extension, cookies or external services.

## Run it locally

From the repository root:

    cd examples/browser-demo
    python3 -m http.server 8000

Open **http://localhost:8000**. Chrome with WebMCP support / experimental flag may expose the page tools to a compatible browser agent. When the feature is not available, the app works as a regular taskboard and clearly reports that no browser tools are registered.

The demo uses the current draft's document.modelContext.registerTool with an AbortSignal lifecycle. A compatible browser agent can discover the site-owned tools and request changes. Every agent write opens a review dialog for the specific task and requires a separate confirmation. This is different from a remote MCP endpoint: the application code runs in the page's own browser environment.

Useful prompts for a compatible agent:
- "List the tasks on this page."
- "Add a task called Write a WebMCP example."
- "Mark task 1 as complete."

## Compile the taskboard contract

From the repository root, run the compiler to see the documented page state, landmarks, native tool inputs and observable results.

    node cli/wmcp.mjs compile examples/browser-demo/capabilities.json

[Capability compiler guide](../../docs/capability-compiler.md).

## Security notes

This is a demo with in-memory, non-sensitive state. It deliberately never pretends to provide document.modelContext when the browser does not support it. WebMCP tools registered by real sites may perform consequential operations; agents must enforce permissions and user consent. Do not generalize a taskboard's privileges to shopping, payments or authenticated services.

Specification: https://webmachinelearning.github.io/webmcp/

## WebMCP Tool Lab

The Tool Lab ships with the [Worker’s public demos](../../worker/public/demo/). Serve those assets from the repository root and open `http://localhost:8001/demo/tool-lab.html`:

```sh
python3 -m http.server 8001 --bind 127.0.0.1 --directory worker/public
```

**Find guides** filters a small catalog. You can change the topic or keyword in any browser.

- **`search_guides`** comes from the annotated HTML form. Chrome derives its required topic and choices from the native select. Searching changes only the visible filter, so the form can use `toolautosubmit`.
- **`get_guide_results`** is a JavaScript tool with an `outputSchema` for the active topic, keyword, and matching guide IDs. Chrome documents output schemas from version 159. [Declarative API](https://developer.chrome.com/docs/ai/webmcp/declarative-api) · [Imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api#output-schema)

From the repository root, run the behavior and regression checks with Playwright Python and [Chrome for Testing 160](https://googlechromelabs.github.io/chrome-for-testing/):

```sh
python3 -m pip install playwright==1.62.0
python3 scripts/test-webmcp-tool-lab.py --chrome /path/to/chrome-headless-shell
```

The run compares a regular form submission with a native WebMCP call. It then changes a select option, removes automatic submission, and changes an output field type in separate preview variants. Each keeps its tool registration and fails Doctor strict mode with the specific changed field. Restoring the declarations passes. The [Tool Lab workflow](../../.github/workflows/webmcp-tool-lab.yml) runs this check in GitHub Actions.

To check a running Worker, pass `--origin http://127.0.0.1:8787` to the same script. It checks the setup page, traverses the demo links, and calls both local-only tools in the Lab. Use this mode with a preview or production origin to verify a deployment.

## Testing

    cargo build --locked --manifest-path tools/wmcp-stats/Cargo.toml
    node --test cli/*.test.mjs

Run the real-browser checks from the repository root with Playwright Python and a WebMCP-capable Chrome executable.

    python3 scripts/test-taskboard-affordances.py --chrome /path/to/chrome-headless-shell

[Affordance design language and test coverage](../../docs/affordance-design-language.md).

### Test with the WebMCP polyfill

The taskboard also supports the JavaScript registration API provided by
[@w3c/webmcp-polyfill](https://github.com/w3c-oss/webmcp-polyfill).
With Python Playwright installed, run this from the repository root:

```sh
bundle_dir=$(mktemp -d)
npm pack @w3c/webmcp-polyfill@0.2.0 --pack-destination "$bundle_dir"
tar -xzf "$bundle_dir/w3c-webmcp-polyfill-0.2.0.tgz" -C "$bundle_dir"
python3 scripts/test-taskboard-affordances.py --chrome /path/to/chrome \
  --polyfill "$bundle_dir/package/dist/polyfill.js"
```

The check disables native WebMCP, loads the bundle before the taskboard
registers its tools, discovers all three registrations, and reads the two
initial tasks through `executeTool()`. The bundle is only loaded in the test
browser. Run the native checks above for Chrome agent integration and the
Tool Lab’s declarative form.
