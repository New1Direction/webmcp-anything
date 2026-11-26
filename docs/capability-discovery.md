# Discover tools by intended outcome

WMCP can search documented capabilities with a plain-language goal. Its ontology joins compiled tool contracts with outcome concepts and typed data. Search returns ranked candidates, documented applicability constraints, and any supported prerequisite. It never calls a tool.

```sh
catalog=examples/capability-discovery/catalog.json

node cli/wmcp.mjs ontology "$catalog"

node cli/wmcp.mjs discover "$catalog" 'Cross off the queue entry called Replace modem.' \
  --context examples/capability-discovery/queue-context.json --limit 1
```

The graph result finds `work:complete_queue_item` through the **Complete a task** concept. The context provides a task title and the queue state, so it suggests reading `work:find_by_title` first and binding the returned `/itemId` to the write's `/itemId` input. The write still requires explicit user authorization for its exact input.

The [ecosystem map](ecosystem-map.md) exposes this catalog as an interactive network with read-only agent navigation.

## Ontology and applicability

A `wmcp-discovery-catalog/v1` file names local OpenAPI documents, WMCP site contracts, or complete compiler output. Files are resolved relative to the catalog. The catalog can also declare concepts, semantic data types, and annotations for individual capabilities. Use `sourceId:toolName` to address a capability. Tools without annotations are still indexed from their documented name, description, and tags.

| Part | Representation |
| --- | --- |
| Outcome | A named concept, its aliases, broader concepts, and related concepts |
| Inputs and outputs | Compiled JSON Schemas and optional semantic types bound to JSON Pointers |
| Applicability | Compiled state, DOM, authentication, and authorization preconditions, plus documented postconditions |
| Relationships | `achieves`, `is-a`, `related-to`, `consumes`, `produces`, and documented state edges |

A semantic type distinguishes values with the same JSON type, such as an order ID and a product SKU. Declare a type with `{ "id": "task-id", "jsonType": "integer" }` and bind it in an annotation's `inputs` or `outputs` with `{ "type": "task-id", "pointer": "/itemId" }`. WMCP checks declared bindings against the compiled schemas. An output used in a plan must be present in every documented success shape. The [example catalog](../examples/capability-discovery/catalog.json) shows both browser and HTTP tools.

Each search method accepts the same JSON context. `sourceIds`, `effects`, `publicOnly`, and `outputType` are hard filters. Effects apply to prerequisites as well as targets. `states` maps source IDs to known page states. `availableTypes` lists the semantic types the caller already has. An empty list means none are available. Omitting the list leaves availability unknown. Results distinguish missing typed inputs, required fields that have no semantic binding, and unresolved browser state. Unknown or unsatisfied conditions remain visible so the caller can establish them before invoking a tool.

The graph can propose one read or navigation prerequisite within the same source and documented origin. It checks a declared output-to-input binding or a documented state transition and omits the plan when multiple prerequisites fit. The runtime still needs to verify DOM state, concrete values, credentials, and consent for each step. Search results describe prerequisites and preserve their authorization requirements. To turn a discovery candidate into a reusable workflow, check it against an explicit policy with [workflow composition](workflow-composition.md). The [website representation benchmark](website-representation.md) measures the page and contract evidence used by the agent.

## Measured comparison

The benchmark uses 26 capabilities across a native taskboard and synthetic work, storefront, operations, and documentation sources. The 35 tasks cover direct retrieval, new paraphrases, protected or excluded actions, and typed or stateful prerequisites. Of these, 33 have a valid target and two intentionally have none. The nine new paraphrases were written after the ontology aliases were set.

| Method | Top 1 | Top 3 | MRR | New paraphrases at No. 1 | Exact plan at No. 1 |
| --- | ---: | ---: | ---: | ---: | ---: |
| Lexical BM25 | 13/33 | 18/33 | 0.476 | 3/9 | 0/3 |
| MiniLM cosine similarity | 27/33 | 32/33 | 0.891 | 8/9 | 0/3 |
| Graph with BM25 | 27/33 | 28/33 | 0.833 | 3/9 | 3/3 |

Top 1 and Top 3 measure whether the intended capability appears at those ranks, even when it needs a prerequisite. Mean reciprocal rank (MRR) gives zero to missing targets. Exact plan compares both action IDs in order on the highest-ranked result. All three methods returned no candidates for both hard-filter cases.

BM25 and MiniLM receive the same tool text. The graph method also uses authored outcome aliases, one hop of concept relationships, and documented data and state constraints. MiniLM led on unseen wording and top-three recall. Graph search delivered the tested prerequisites and ranked all 24 answerable curated tasks first. The dataset is small and curated, so the results describe this catalog.

## Reproduce the comparison

The Node CLI requires no dependencies for lexical or graph retrieval, and consumes a local vector file for embedding retrieval. To create a vector file, install the following optional Python dependencies and fetch the pinned [all-MiniLM-L6-v2 model](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2). The encoder checks the model and tokenizer hashes and runs locally.

```sh
python3 -m venv /tmp/wmcp-embeddings
/tmp/wmcp-embeddings/bin/pip install numpy==2.4.2 onnxruntime==1.24.4 tokenizers==0.22.2

mkdir -p /tmp/wmcp-minilm
model_url=https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2/resolve/1110a243fdf4706b3f48f1d95db1a4f5529b4d41
curl -fsSL "$model_url/onnx/model.onnx" -o /tmp/wmcp-minilm/model.onnx
curl -fsSL "$model_url/tokenizer.json" -o /tmp/wmcp-minilm/tokenizer.json

catalog=examples/capability-discovery/catalog.json
tasks=examples/capability-discovery/tasks.json
node cli/wmcp.mjs ontology "$catalog" > /tmp/wmcp-ontology.json
/tmp/wmcp-embeddings/bin/python scripts/embed-discovery.py \
  /tmp/wmcp-ontology.json /tmp/wmcp-vectors.json --model-dir /tmp/wmcp-minilm --tasks "$tasks"
node scripts/benchmark-discovery.mjs "$catalog" "$tasks" /tmp/wmcp-vectors.json
```

The benchmark prints per-task ranks and proposed plans as JSON. To use embedding retrieval for a new goal, generate vectors with `--query "your exact goal"`, then pass `--method embedding --embeddings /tmp/wmcp-vectors.json` when discovering that goal. The vector file keys each embedding by the SHA-256 hash of its exact UTF-8 input.

`createDiscovery` in `cli/discover.mjs` exposes the same behavior to a local agent integration. It builds an index once and returns a search function.
