import { readLocalJson } from "../cli/compile.mjs";
import { loadOntology } from "../cli/capability-ontology.mjs";
import { createDiscovery, METHODS } from "../cli/discover.mjs";

const [catalogPath, tasksPath, embeddingsPath] = process.argv.slice(2);
if (!catalogPath || !tasksPath || !embeddingsPath) {
  process.stderr.write("Usage: node scripts/benchmark-discovery.mjs <catalog.json> <tasks.json> <embeddings.json>\n");
  process.exit(1);
}

const ontology = loadOntology(catalogPath);
const embeddings = readLocalJson(embeddingsPath, "Embeddings", 16_000_000);
const { schemaVersion, tasks } = readLocalJson(tasksPath, "Benchmark tasks");
if (schemaVersion !== "wmcp-discovery-tasks/v1" || !Array.isArray(tasks) || !tasks.length) throw Error("Invalid benchmark task suite");
const ids = new Set(ontology.capabilities.map(({ id }) => id));
const taskIds = new Set();
for (const task of tasks) {
  if (typeof task.id !== "string" || taskIds.has(task.id) || typeof task.suite !== "string" ||
      typeof task.goal !== "string" || !Array.isArray(task.expected) || task.expected.some((id) => !ids.has(id)) ||
      (task.plan !== undefined && (!Array.isArray(task.plan) || task.plan.length !== 2 ||
        task.plan.some((id) => !ids.has(id)) || !task.expected.includes(task.plan.at(-1))))) {
    throw Error("Invalid or duplicate benchmark task");
  }
  taskIds.add(task.id);
}

const search = createDiscovery(ontology, { embeddings });
const count = (rows, test) => rows.filter(test).length;

function summarize(rows) {
  const answerable = rows.filter(({ answerable }) => answerable);
  const blocked = rows.filter(({ answerable }) => !answerable);
  const planning = rows.filter(({ expectedPlan }) => expectedPlan);
  return {
    answerable: answerable.length,
    hitAt1: count(answerable, ({ rank }) => rank === 1),
    hitAt3: count(answerable, ({ rank }) => rank > 0 && rank <= 3),
    mrr: answerable.length ? Number((answerable.reduce((sum, { rank }) => sum + (rank ? 1 / rank : 0), 0) / answerable.length).toFixed(3)) : null,
    plansAt1: count(planning, ({ planCorrect }) => planCorrect),
    planning: planning.length,
    correctlyEmpty: count(blocked, ({ top }) => top.length === 0),
    blocked: blocked.length,
  };
}

const runs = Object.fromEntries(METHODS.map((method) => {
  const rows = tasks.map((task) => {
    const { results } = search(task.goal, { method, context: task.context, limit: 50 });
    const suggestedPlan = results[0]?.plan?.steps.map(({ id }) => id) ?? null;
    const rank = results.findIndex(({ capability }) => task.expected.includes(capability.id)) + 1;
    return {
      id: task.id, suite: task.suite, answerable: task.expected.length > 0, rank, expected: task.expected,
      top: results.slice(0, 3).map(({ capability }) => capability.id),
      expectedPlan: task.plan ?? null, suggestedPlan,
      ...(task.plan ? { planCorrect: JSON.stringify(task.plan) === JSON.stringify(suggestedPlan) } : {}),
    };
  });
  const suites = [...new Set(rows.map(({ suite }) => suite))];
  return [method, {
    overall: summarize(rows),
    bySuite: Object.fromEntries(suites.map((suite) => [suite, summarize(rows.filter((row) => row.suite === suite))])),
    tasks: rows,
  }];
}));

console.log(JSON.stringify({
  schemaVersion: "wmcp-discovery-benchmark/v1", embeddingModel: embeddings.model,
  capabilityCount: ids.size, taskCount: tasks.length, ...runs,
}, null, 2));
