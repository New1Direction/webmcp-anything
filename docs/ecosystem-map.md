# Tool ecosystem map

The map explores WMCP site contracts and OpenAPI capabilities as one local catalog. Click a service to drill into its capabilities. Each finding links back to the source tools and explains the evidence behind the connection.

```sh
node examples/ecosystem-map/server.mjs
```

Open [http://127.0.0.1:8790/](http://127.0.0.1:8790/). Try searching **cross off a task**, **lookup alert ID**, or **workflow for completing a task**.

The default example includes 26 documented capabilities across five sources, including the local taskboard and synthetic service contracts. It groups them into four clusters, detects one service overlap and two integration gaps, and presents three policy-checked pairs and four inferred handoffs.

## Read the evidence

| Label | Evidence |
| --- | --- |
| **Documented** | A capability in a compiled site contract or OpenAPI definition. The map preserves the source pointer, interface, input and output schemas, requirements, and expected outcomes. |
| **Policy-checked** | A two-step workflow passed WMCP's shape, state, side-effect, and policy checks under a supplied local policy. The draft and its policy context are available for inspection. |
| **Inferred** | A cluster, overlap, scoped gap, or field-level composition inferred from the catalog and explicit integration needs. Runtime readiness requires separate evidence. |

Clusters are connected components of services that share a declared top-level outcome, including transitive connections. An overlap requires the same declared outcome and effect in two services. The map compares the payload schemas and preconditions so equal outcome names do not imply substitutable services.

A composition candidate requires a documented producer field and a required consumer field with the same semantic type and compatible supported schemas. Automatic suggestions exclude write prerequisites. A boundary crossing retains the need for a connector, compatible resource identity, and authorization. Other inputs or state may still be required. Checked workflows use the existing [workflow compiler](workflow-composition.md).

A gap is scoped to an explicit integration need. It can identify an absent typed producer, a schema problem, a boundary mapping, a write-only prerequisite, or wiring outside the checked policy. In the sample catalog, the alert acknowledgment input has no typed producer among the operations tools. The work queue and taskboard share a task ID semantic type, but the lookup output is broader than the taskboard accepts and the service-specific IDs still need a mapping.

## Use a different catalog

```sh
node examples/ecosystem-map/server.mjs --catalog ./catalog.json --config ./map-config.json --port 8790
```

The catalog uses `wmcp-discovery-catalog/v1`. The optional map config uses `wmcp-ecosystem-config/v1`, with `policies` as policy paths relative to the config and `needs` as explicit input requirements. Each need names an `id`, a human-readable `label`, a `consumer` capability ID, and an `input` JSON Pointer. An optional `producerSource` limits the search for a producer. See the [sample config](../examples/ecosystem-map/config.json). A custom catalog without a config still shows clusters, overlaps, and typed handoffs.

## Navigate from an agent

Connect a Streamable HTTP MCP client to `http://127.0.0.1:8790/mcp`. The endpoint uses the MCP revision negotiated by the existing WMCP CLI and exposes two read-only tools. [MCP lifecycle](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle) · [MCP tools](https://modelcontextprotocol.io/specification/2025-11-25/server/tools)

| Tool | Input | Result |
| --- | --- | --- |
| `search_ecosystem` | A natural-language `goal`, optional `kind`, and optional `limit` | Ranked nodes, their IDs and evidence, and capability applicability when available |
| `inspect_map_node` | An `id` returned by search or another node | Full node evidence, typed relationships, and IDs of related nodes |

For example, call `search_ecosystem` with `{"goal":"cross off a task","kind":"capabilities","limit":3}`, then inspect the returned ID. Searches combine WMCP's ontology-based discovery with term matching on the findings. The browser uses the same query code through `POST /api/query`. The complete graph is available at `GET /api/map`, and a single node is available at `GET /api/node?id=<node-id>`. The server binds to loopback and only exposes map navigation.

## Verify

```sh
node --test cli/ecosystem.test.mjs
python3 scripts/test-ecosystem-map.py --chrome /path/to/chrome-headless-shell
```

The browser test requires Playwright Python. It verifies the drawn connections, layer filtering, service drill-down, evidence details, semantic search, node links, and mobile layout.
