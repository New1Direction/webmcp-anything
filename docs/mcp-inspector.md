# MCP Inspector

Run the inspector from the repository root with Node.js 18 or later.

```sh
node examples/mcp-inspector/server.mjs
```

Open [http://127.0.0.1:8788/](http://127.0.0.1:8788/). The server binds to loopback. Pass a port as the first argument to use a different local port.

## Inspect a trace

| View | What it shows |
| --- | --- |
| Timeline | Request offsets, durations, unfinished calls, and terminal states. Filter by method, tool, or outcome, then select a row for the message lifecycle. Replay or scrub the observed timestamps without repeating the calls. |
| Dependency graph | Typed edges for session setup, paginated discovery, tool declarations, input and output checks, and receipts. It also shows dependencies explicitly recorded by the trace producer. Select a node or use the focus menu to explore a request. |
| Tools | Discovered tool declarations and their schema checks. Historical declarations stay inspectable after a tool-list change. Subsequent calls use the current observed declarations. |
| Details | Request and response timing, correlated progress, schema findings with paths, HTTP and RPC status, redacted wire shapes, and the execution receipt. |

An execution receipt summarizes observed protocol evidence. For example, an HTTP 200 response can carry a tool error or a tool-reported success whose structured output fails its schema. A deadline describes when the client stopped waiting. A subsequent response stays in the lifecycle as a late event. [MCP tools and results](https://modelcontextprotocol.io/specification/2025-11-25/server/tools) · [Progress notifications](https://modelcontextprotocol.io/specification/2025-11-25/basic/utilities/progress)

## Reproduce protocol cases locally

| Fixture | Traffic |
| --- | --- |
| Tool lifecycle | Initialization, the initialized notification, two discovery pages, three SSE progress notifications, successful structured results, a recorded chain between requests, and an execution error |
| Failure states | Invalid parameters reported by JSON-RPC, a tool-level error, HTTP 503, and a client timeout |
| Schema validation | Valid input and output, a wrong input type, a successful response with invalid structured output, and a schema keyword outside the inspector's supported profile |

The fixture runner captures real loopback Streamable HTTP requests and SSE messages against synthetic tools. Run a fixture again to collect a fresh sample. The same protocol endpoint is available at `/fixtures/lifecycle/mcp`, `/fixtures/failures/mcp`, or `/fixtures/schemas/mcp`. The fixture protocol version matches WMCP's current read-only CLI negotiation. Import can also correlate already-recorded JSON-RPC from other transports. [MCP Streamable HTTP](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports)

## Import recorded traffic

Choose **Import trace** and select [schema-mismatch.json](../examples/mcp-inspector/traces/schema-mismatch.json) for a deterministic example. Supply one session's JSON-RPC frames in the `wmcp-mcp-trace/v1` envelope. The file stays in the browser. A trace can contain up to 1,000 events and occupy up to 2 MB.

```json
{
  "schemaVersion": "wmcp-mcp-trace/v1",
  "events": [
    {
      "atMs": 0,
      "direction": "send",
      "message": { "jsonrpc": "2.0", "id": 1, "method": "tools/list" }
    },
    {
      "atMs": 35,
      "direction": "receive",
      "httpStatus": 200,
      "message": { "jsonrpc": "2.0", "id": 1, "result": { "tools": [] } }
    }
  ]
}
```

Use `send` for client-to-server and `receive` for server-to-client frames. Correlation uses both direction and exact ID type. Optional `headers` and `httpStatus` attach transport metadata. Record transport failures with `direction: "local"`, a `kind` of `timeout`, `transport`, `http`, or `malformed`, and the original `requestId`. Set `requestDirection: "receive"` for a failed server-initiated request. Set `dependsOn` on a request event to a list of earlier same-direction successful request IDs when your recorder knows that relationship.

The inspector validates against the schema observed before the call. The supported JSON Schema profile includes object properties, required fields, arrays and items, value types, length and numeric bounds, enums, constants, combinators, and local JSON Pointer references. It marks unknown keywords and remote references **Unsupported** and performs no reference fetches. **Export redacted** saves the analysis report with the validation results and typed edges.

## Redaction

Payload values, free-text content and errors, cursors, progress tokens, and wire request IDs are withheld from the view and export. Credentials in recognized headers or payload fields are explicitly redacted. The report retains allowlisted transport facts, bounded structural shapes, schema constraints, and ordinary method, tool, and field identifiers. Known token formats in those identifiers are masked. Review the remaining labels if your recorder places private data in identifiers.

## Tests

```sh
node --test cli/mcp-inspector.test.mjs
python3 scripts/test-mcp-inspector.py --chrome /path/to/chrome-headless-shell
```

The browser test requires Playwright Python. It checks tab navigation, filtering, replay and scrubbing, graph navigation, discovery schemas, failure details, file import, redacted export, and the narrow layout.
