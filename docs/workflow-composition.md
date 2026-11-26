# Compose authorized WebMCP tools

WMCP can identify compatible tool pairs, compile a reusable workflow, and replay its behavior against recorded or synthetic observations. The CLI works offline. It checks the contract and policy supplied to it and performs no browser actions.

```sh
catalog=examples/capability-discovery/catalog.json
policy=examples/workflows/queue-policy.json
workflow=examples/workflows/complete-by-title.json
fixture=examples/workflows/complete-by-title-fixture.json

# Find verified two-step connections in the authorized tool set.
node cli/wmcp.mjs compose "$catalog" --policy "$policy"

# Verify the complete reusable workflow.
node cli/wmcp.mjs compose "$catalog" "$workflow" --policy "$policy"

# Check each step and its observed outcome against a fixture.
node cli/wmcp.mjs replay "$catalog" "$workflow" "$fixture" --policy "$policy"
```

The example opens the work queue, looks up a task by title, and uses the resulting task ID to mark that exact task complete. A successful replay exports `completedItem: 42`. The navigation, lookup, and write each have their own schema, authorization requirements and success observations.

## Compatibility

A `wmcp-workflow/v1` document defines its starting state, typed inputs, ordered steps, and named outputs. Each value binding selects a workflow input or a documented typed output from a previous step. The supported transformation is `identity`. It can project and rename a field by binding to a different JSON Pointer and can assemble an argument object from multiple fields. It preserves each value and its nested structure.

| Check | Requirement |
| --- | --- |
| Data type | The semantic type IDs match. A task ID and a different integer ID stay distinct. |
| Schema | Every value allowed by the producer's supported schema is accepted by the consumer. Undocumented coercions and narrower targets fail. |
| Input coverage | Every required field has a binding. Duplicate, overlapping and forward bindings fail. |
| State | The next step's required state matches the previous step's documented destination or unchanged state. |
| Authority | A separate policy covers the exact tool, origin, access mode, permissions, and side effect. |

The schema profile supports primitive types with safe integers, required object fields with boolean `additionalProperties`, homogeneous arrays, inclusive numeric and length bounds, constants, enumerations, and nonrecursive local references. Unsupported keywords and schemas are rejected. The compiler keeps the original preconditions and postconditions and checks the projected argument structure separately.

A `wmcp-workflow-policy/v1` file names one site source and origin, selects public or session access, and lists the allowed tools with their exact permissions and effect. Discovery plans remain candidates until checked against this policy. The pair finder starts from individually validated primitives, connects them through a documented transition or an unambiguous typed field, and returns reusable drafts with any inputs still needed from the caller. It reports excluded primitives and marks the report truncated if it reaches 50 pairs.

## Document and verify each side effect

Site action authors opt a primitive into composition with a `sideEffect` declaration. The policy must grant the entire declaration.

| Tool effect | Required declaration and evidence |
| --- | --- |
| Read | `{"kind":"none"}` declares no operational side effect. |
| Navigation | `kind: "navigate"` names a destination that must match a documented state postcondition. |
| Write | `kind: "write"` names one operation, a typed input target, the matching typed result target, and an exact outcome value. A result must establish both the target and the outcome. |

The write in the example declares `operation: "complete-queue-item"`, `target: "/itemId"`, `resultTarget: "/itemId"`, `outcome: "/completed"`, and `value: true`. Its site contract includes the matching `result-matches-input` and `result-equals` postconditions. A tool with an unspecified side effect or a write with insufficient evidence cannot become a workflow primitive. These checks rely on the accuracy of the site's documentation and its actual observations.

Each primitive can be tested as a one-step workflow with typed fixture inputs and outputs. The same contract is evaluated when the primitive appears in a longer workflow.

## Failure semantics

The replay stops at the first failure and returns the already confirmed trace. It skips remaining steps and performs zero retries or rollbacks.

| Point of failure | Report |
| --- | --- |
| Invalid workflow, unsupported permission or undocumented effect | Composition fails with a coded error and no plan. |
| Missing observation, invalid binding, precondition failure or absent approval | The step stops with `not-attempted`. |
| Tool error, missing outcome or failed postcondition after a declared write or navigation | The affected step reports `unknown`. A prior effect may have occurred. |
| Satisfied postconditions | A write or navigation is marked `confirmed`. A documented read is marked `none-declared`. |

Public steps require a public context. Session steps check the same session subject and their documented permissions. Writes and session steps require an approval record for the exact workflow, step, capability, origin, subject and bound arguments. The fixture models evidence a trusted runtime must supply. Fixture data does not authorize any live tool call.

A successful replay exits `0`. A stopped replay emits JSON and exits `2`. An invalid document or rejected composition exits `1`.
