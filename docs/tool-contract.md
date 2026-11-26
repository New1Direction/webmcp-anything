# Minimal agent-tool contract

A `wmcp-tool-contract/v1` descriptor gives an agent the facts it needs before choosing a tool, interpreting a result, or deciding how to recover from a failure. The version and name identify the descriptor. Six fields define its semantics.

| Field | Meaning | Why it stays |
| --- | --- | --- |
| `inputSchema` | JSON Schema for the tool's logical input | A filesystem stat accepts a path string, while an inventory publisher accepts a keyed record. |
| `outputSchema` | JSON Schema for the logical success value | A filesystem stat returns an integer, a web read can return an array, and a render can return an artifact reference. |
| `authorization` | Credential alternatives and a separate confirmation rule | Public access to a web tool can coexist with confirmation for an exact write. |
| `sideEffects` | Declared changes and their boundaries | A render with identical bytes can still allocate a new artifact. |
| `idempotency` | The effect guarantee for equivalent repeats | A keyed publisher can recover its receipt only inside its deduplication scope and window. |
| `failures` | Stable failure codes, effect status, and recovery | A refused invocation and a lost receipt can require different decisions. |

The contracts describe logical values and effects. Browser events, shell arguments, query parameters, job handles, artifact storage, MIME negotiation, and streaming remain in their existing adapters or appear as ordinary values when part of the tool's response. A connector may wrap logical values to satisfy its protocol. MCP, for example, has its own object input schema and tool result envelope. [MCP tool definitions](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)

## Encoding the distinctions

- **Schemas.** A JSON Schema can describe a scalar, array, object, or explicit null value. A field value of `null` means the schema is unknown. Use `{"type":"null"}` to declare a null success value. The local verifier checks the same bounded schema profile as the [MCP inspector](mcp-inspector.md) and reports unsupported keywords without treating them as checked.
- **Authorization.** `anyOf` is a list of alternatives. Every `{scheme, boundary, permissions}` in one alternative must be satisfied under the named boundary. `[[]]` declares public access. `null` records unknown credential requirements. `confirmation` is independently `always`, `authenticated-use`, `never`, or `unknown`. When required, it applies to the specific tool and bound input. Credentials, user consent, and trust decisions come from the calling runtime.
- **Effects.** Use `[]` for a declaration of no effects and `null` for unknown effects. Each declared effect has an authored `kind` and a `boundary`. An optional `target` uses `{"inputPointer":"/itemId"}` for an argument-selected resource or `{"resource":"state:queue"}` for a fixed one. An effect whose target is allocated at runtime can declare just its kind and boundary. The descriptor does not impose a taxonomy for effect names or provide a receipt.
- **Idempotency.** `mode` is `idempotent`, `keyed`, `non-idempotent`, or `unknown`. Idempotency concerns the intended effect of repeating an equivalent invocation. A read can return a fresh value and still be idempotent. In keyed mode, `keyPointer` identifies the input string, `boundary` describes the deduplication scope, and `windowSeconds` is a positive guarantee window from the original invocation or `null` for an explicit no-expiry guarantee. A retry needs the same effective input, a usable key inside that window and boundary, and current authority. [HTTP idempotent methods](https://www.rfc-editor.org/rfc/rfc9110.html#name-idempotent-methods)
- **Failure.** Map a stable code to `effects` and `recovery`. Effect status is relative to the failed invocation and can be `not-applied`, `applied`, `partial`, or `unknown`. Recovery is `stop`, `retry`, or `reconcile`. Unknown codes and undeclared failure modes default to unknown effects and reconciliation. Partial effects require a stop or reconciliation in this profile. Retry after applied or unknown effects needs an applicable idempotency guarantee. The descriptor schedules no retry.

## Evaluation

Nine cases passed across four tools. Each fixture kept its own native call shape.

| Tool | Verified behavior | Evidence |
| --- | --- | --- |
| Browser task completion | The input ID and typed result agree, and a separate approval is required. Projection preserves missing retry and failure declarations as unknown. | Replayed WMCP workflow and browser-state evidence |
| Workspace file stat | A scalar path returns an integer. Reading again after an independent edit gives a fresh result. Missing files and denied access create no effects. | Files in a temporary local workspace |
| Inventory snapshot publication | Both grants and approval are required. After a lost receipt, the original key returns the same receipt and creates one snapshot inside the 60-second window. Changed input conflicts and an expired key loses that guarantee. | In-memory data fixture with a controlled clock |
| Dither tile rendering | The same seed yields identical bytes and two separate PBM files. An interrupted render leaves an incomplete artifact and calls for reconciliation. | Actual temporary raster files and digest comparison |

The web and data cases exercise fixture semantics. The data deduplication boundary is one running fixture process. These results evaluate the contract shape and declared recovery decisions with controlled evidence.

## Run the audit and examples

```sh
node cli/wmcp.mjs contract examples/tool-contracts/publish-snapshot.json
node cli/wmcp.mjs contract examples/browser-demo/capabilities.json --tool list_tasks
node examples/tool-contracts/evaluate.mjs
node --test cli/tool-contract.test.mjs
```

Use `--tool` with a WMCP site contract, OpenAPI document, or complete compiled capability specification. Projection keeps an explicitly declared logical result schema and declared side effects. HTTP media response annotations stay in the original specification when the logical tool result shape is unspecified. Repeat guarantees and failure recovery stay unknown unless supplied in a tool contract. The audit exits `2` for malformed or contradictory declarations and lists its unknown or unsupported fields separately.
