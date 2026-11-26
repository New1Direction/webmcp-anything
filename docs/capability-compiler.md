# Website capability compiler

`wmcp compile` converts documented interfaces into a versioned capability specification an agent can inspect before it acts. It reads a local JSON file and prints JSON. It makes no network requests, reads no browser session, and registers or invokes no tools.

```sh
node cli/wmcp.mjs compile examples/browser-demo/capabilities.json > taskboard.capabilities.json
node cli/wmcp.mjs compile ./openapi.json > api.capabilities.json
```

| Source | Compiled contract |
| --- | --- |
| OpenAPI 3.0 or 3.1 JSON | HTTP operations, tags, typed request arguments, authentication alternatives, and documented success responses |
| `wmcp-site/v1` JSON | Semantic landmarks, navigation edges, page states, and declared browser WebMCP actions with their preconditions and postconditions |

The output uses `wmcp-capabilities/v1`. Each tool includes a name, description, input JSON Schema, interface binding, source pointer, effect, preconditions, and postconditions. The document declares `execution: "specification-only"`. Its tool definitions describe what a separate browser or API runtime would have to check. Add these documents to a [discovery catalog](capability-discovery.md) to find and relate tools by outcome.

## Document a website

Add a site contract beside the source for your website. A site action can include a `title` that matches its visible control or read surface. See the [affordance design language](affordance-design-language.md). Give each state its same-origin path, title, and explicit `public` or `session` access. Describe landmarks using semantic roles such as `main`, `navigation`, and `region`. Use labeled links to declare navigation edges between states. Distinct states on one path need distinct CSS markers that are visible only in their respective state.

The following contract describes the public home page and a session-protected board. The tool name corresponds to a registration in the website's WebMCP implementation.

```json
{
  "schemaVersion": "wmcp-site/v1",
  "site": {
    "title": "Taskboard",
    "origin": "https://tasks.example",
    "entryState": "home"
  },
  "states": [
    {
      "id": "home",
      "title": "Home",
      "path": "/",
      "access": "public",
      "landmarks": [{ "role": "main" }],
      "links": [{ "label": "Open taskboard", "to": "board" }]
    },
    {
      "id": "board",
      "title": "Your taskboard",
      "path": "/board",
      "marker": "#taskboard",
      "access": "session"
    }
  ],
  "actions": [
    {
      "name": "open_board",
      "description": "Open the signed-in user's taskboard",
      "state": "home",
      "effect": "navigate",
      "access": "session",
      "permissions": ["tasks:read"],
      "inputSchema": { "type": "object", "additionalProperties": false },
      "preconditions": [{ "kind": "visible", "selector": "#open-board" }],
      "postconditions": [{ "kind": "state", "state": "board" }]
    }
  ]
}
```

| Check | Outcome a runtime would observe |
| --- | --- |
| `state` | The active document matches the declared origin and path, and the marker is visible if one is declared |
| `dom-visible` / `dom-enabled` | The declared selector matches a visible element or an enabled control, respectively |
| `dom-count-increased` | After execution, the selector matches exactly `by` more elements than before |
| `result-schema` | The site's JSON result satisfies the documented JSON Schema |
| `result-equals` | A JSON Pointer into the result equals the documented value |
| `result-matches-input` | A JSON Pointer into the result equals the value at `inputPointer` in the submitted input |
| `http-response` | An HTTP status and any declared body media type and JSON Schema match a documented response |

Browser preconditions specified as `visible` and `enabled` compile to `dom-visible` and `dom-enabled`. Every declared precondition and postcondition applies to its action. Each action needs at least one postcondition. A `navigate` action needs a destination state. A `write` action may also declare a destination. The browser result checks refer to the site's documented JSON result after decoding the response. The [working taskboard contract](../examples/browser-demo/capabilities.json) includes read, write, and DOM checks against its actual native WebMCP demo.

## Compile an HTTP API

HTTP input schemas keep `path`, `query`, `header`, and `body` separate. A body supplies the documented `contentType` and a typed `value`. The compiler resolves supported local JSON Pointer references and bundles referenced schemas into self-contained `$defs`. It retains server URL templates as documented. Consumers need a trusted document URL to resolve relative servers and a trusted origin for every credential-bound invocation.

Only explicit `2xx` response declarations count as success evidence, including the documented `2XX` fallback for statuses with no explicit declaration. A response such as `202` confirms acceptance. If the actual operation completes later, its documentation needs a separate observation to establish that outcome.

The compiler reads up to 2 MB of local JSON. It supports the standard OpenAPI 3.x schema dialects and local `#/` references. External references, unsupported schema scopes, ambiguous tool names, and operations without observable success produce diagnostics when they affect emission. Callbacks and webhooks are outside the agent-initiated surface. OpenAPI documents by themselves carry no browser navigation states.

| Exit status | Result |
| --- | --- |
| `0` | The compiler produced a complete specification for the supported source surface |
| `1` | The source could not be read or the document-level contract was invalid |
| `2` | JSON was emitted with `complete: false` and diagnostics for omitted OpenAPI operations |

## Authentication and authorization

Authentication alternatives come from the source. Each `anyOf` entry is one viable alternative and all its `allOf` entries must be satisfied. An empty `allOf` represents documented public access. OpenAPI operation-level overrides, OAuth scopes, and API key locations are preserved. The compiler keeps OpenAPI security-scheme parameters and credential headers outside the tool input schema. Browser sessions stay bound to their declared origin, and an action entering or leaving a session-protected state must itself declare session access.

All writes require explicit user authorization scoped to the capability and its input. Authenticated reads and navigation require authorization for authenticated use. The compiler records these checks and source claims. Enforcement belongs to the runtime and the site's own authorization layer. A compiled contract establishes neither that a user granted access nor that a site action matched its documented effect.

[WebMCP draft](https://webmachinelearning.github.io/webmcp/) · [OpenAPI specification](https://spec.openapis.org/oas/v3.1)
