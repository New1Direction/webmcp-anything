#!/usr/bin/env node
// WMCP read-only developer CLI. No hosted credentials and no dependencies.
import { pathToFileURL } from "node:url";
import { parseArgs as parseOptions } from "node:util";
import { readFileSync, statSync } from "node:fs";
import { inspectMcpEndpoint, validateEndpoint } from "./mcp-read.mjs";
import { doctorMcp, formatDoctor } from "./doctor.mjs";
import { doctorWeb, formatDoctorWeb, validateWebPage } from "./doctor-web.mjs";
import { compileFile, readLocalJson } from "./compile.mjs";
import { loadOntology } from "./capability-ontology.mjs";
import { createDiscovery } from "./discover.mjs";
import { composeWorkflow, findCompositions } from "./compose.mjs";
import { replayWorkflow } from "./replay.mjs";
import { inspectToolContract } from "./tool-contract.mjs";
import { selectToolFiles } from "./select-tool.mjs";
const BASE = "https://wmcp.sh";
const CMDS = ["inspect", "mcp", "grade", "config", "doctor", "compile", "ontology", "discover", "compose", "replay", "contract", "select"];
const HELP = [
  "wmcp — inspect websites and MCP servers without setting up an agent",
  "",
  "Usage:",
  "  node cli/wmcp.mjs inspect <public-url> [--json]",
  "  node cli/wmcp.mjs mcp     <public-url> [--json]",
  "  node cli/wmcp.mjs grade   <mcp-endpoint-url> [--json]",
  "  node cli/wmcp.mjs config  <public-url>",
  "  node cli/wmcp.mjs doctor  <mcp-endpoint-url> [--json] [--strict] [--baseline path]",
  "  node cli/wmcp.mjs doctor web <page-url> [--json] [--strict] [--baseline path]",
  "  node cli/wmcp.mjs compile <source.json> [--json]",
  "  node cli/wmcp.mjs contract <contract.json>",
  "  node cli/wmcp.mjs contract <capability-source.json> --tool <name>",
  "  node cli/wmcp.mjs select <task.json> <evidence.json>",
  "  node cli/wmcp.mjs ontology <catalog.json>",
  "  node cli/wmcp.mjs discover <catalog.json> <goal> [--method lexical|embedding|graph]",
  "    [--context <context.json>] [--embeddings <vectors.json>] [--limit n]",
  "  node cli/wmcp.mjs compose <catalog.json> [workflow.json] --policy <policy.json>",
  "  node cli/wmcp.mjs replay <catalog.json> <workflow.json> <fixture.json> --policy <policy.json>",
  "",
  "Options:",
  "  --json           Print machine-readable JSON",
  "  --strict         Doctor exits 2 if any warning or error exists",
  "  --baseline path  Compare Doctor output with a local JSON report",
  "  --base <origin>  Another WMCP service; HTTP only for local development",
  "  --send-key-to-base  Explicitly allow your API key to be sent to --base",
  "  --chrome path    Chrome executable for doctor web (or set WMCP_CHROME)",
  "  --wait-ms n      Observe for n milliseconds after load (doctor web, default 1000)",
  "  --pair url       Compare with this public MCP endpoint (doctor web)",
  "  --allow-preview-origin  Allow baseline for the same path on another origin",
  "",
  "Compile reads a local OpenAPI 3.0/3.1 or WMCP site JSON file and emits JSON.",
  "All commands are read-only. Use PUBLIC HTTPS URLs without credentials, query",
  "parameters or tokens: the remote service may fetch and cache target URLs.",
  "WMCP_API_KEY enables authenticated reads; its value is never printed.",
  "Doctor probes initialize + tools/list, not tools/call. No security certification.",
].join("\n");

export function validateTarget(value) {
  if (typeof value !== "string" || value.length > 2048) throw Error("URL must be at most 2048 characters");
  let url;
  try { url = new URL(value); } catch { throw Error("Enter a full https:// URL"); }
  if (url.protocol !== "https:" || url.username || url.password)
    throw Error("Target must be a public HTTPS URL without embedded credentials");
  if (url.hash) throw Error("Remove the URL fragment");
  if (url.search) throw Error("Remove query parameters before submitting a public URL");
  return url.toString();
}

export function validateBase(value = BASE) {
  let u;
  try { u = new URL(value); } catch { throw Error("Invalid --base URL"); }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname);
  if (u.protocol !== "https:" && !(local && u.protocol === "http:"))
    throw Error("--base must be HTTPS (HTTP only for localhost)");
  if (u.username || u.password || u.search || u.hash || u.pathname !== "/")
    throw Error("--base must be an origin without path, query or credentials");
  return u.origin;
}

export function mcpEndpoint(url, base = BASE) {
  return validateBase(base) + "/mcp/u/" + Buffer.from(validateTarget(url)).toString("base64url");
}

export function parseArgs(args) {
  if (!args.length || args.includes("--help") || args.includes("-h")) return { help: true };
  const [command, ...rest] = args;
  if (!CMDS.includes(command)) throw Error("Unknown command: " + command + ". Use --help.");
  if (command === "compile") {
    const paths = rest.filter((arg) => arg !== "--json");
    if (paths.length !== 1 || paths[0].startsWith("-")) throw Error("Usage: compile <local-source.json> [--json]");
    return { command, sourcePath: paths[0] };
  }
  if (command === "contract") {
    const { values, positionals } = parseOptions({ args: rest, options: { tool: { type: "string" } }, allowPositionals: true });
    if (positionals.length !== 1) throw Error("Usage: contract <local-json-file> [--tool <name>]");
    return { command, sourcePath: positionals[0], tool: values.tool };
  }
  if (command === "select") {
    const { positionals } = parseOptions({ args: rest, options: {}, allowPositionals: true });
    if (positionals.length !== 2) throw Error("Usage: select <task.json> <evidence.json>");
    const [taskPath, evidencePath] = positionals;
    return { command, taskPath, evidencePath };
  }
  if (command === "ontology" || command === "discover") {
    const options = command === "discover" ? {
      method: { type: "string" },
      context: { type: "string" },
      embeddings: { type: "string" },
      limit: { type: "string" },
    } : {};
    const { values, positionals } = parseOptions({ args: rest, options, allowPositionals: true });
    const [catalogPath, goal] = positionals;
    if (positionals.length !== (command === "ontology" ? 1 : 2) || !catalogPath.trim() || (goal !== undefined && !goal.trim())) {
      throw Error(command === "ontology" ? "Usage: ontology <catalog.json>" : "Usage: discover <catalog.json> <goal>");
    }
    const limit = values.limit === undefined ? undefined : Number(values.limit);
    return { command, catalogPath, goal, method: values.method, contextPath: values.context, embeddingsPath: values.embeddings, limit };
  }
  if (command === "compose" || command === "replay") {
    const { values, positionals } = parseOptions({
      args: rest, options: { policy: { type: "string" } }, allowPositionals: true,
    });
    const validCount = command === "compose" ? [1, 2].includes(positionals.length) : positionals.length === 3;
    if (!values.policy || !validCount) {
      throw Error(command === "compose" ? "Expected a catalog, optional workflow, and --policy" :
        "Expected a catalog, workflow, fixture, and --policy");
    }
    const [catalogPath, workflowPath, fixturePath] = positionals;
    return { command, catalogPath, workflowPath, fixturePath, policyPath: values.policy };
  }
  const web = command === "doctor" && rest[0] === "web";
  let json = false, strict = false, base = BASE, url = null, baselinePath = null, sendKeyToBase = false;
  const browserOptions = {};
  for (let i = web ? 1 : 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === "--json") json = true;
    else if (arg === "--send-key-to-base") sendKeyToBase = true;
    else if (arg === "--strict") strict = true;
    else if (arg === "--baseline") {
      baselinePath = rest[++i];
      if (!baselinePath) throw Error("--baseline requires a report JSON file");
    }
    else if (arg === "--base") {
      base = rest[++i];
      if (!base) throw Error("--base requires an origin URL");
    } else if (web && arg === "--allow-preview-origin") browserOptions.allowPreviewOrigin = true;
    else if (web && (arg === "--chrome" || arg === "--pair" || arg === "--wait-ms")) {
      const value = rest[++i];
      if (!value || value.startsWith("--")) throw Error(arg + " requires a value");
      if (arg === "--chrome") browserOptions.chrome = value;
      if (arg === "--pair") browserOptions.endpoint = validateEndpoint(value);
      if (arg === "--wait-ms") {
        if (!/^\d+$/.test(value) || Number(value) > 10_000) throw Error("--wait-ms must be an integer between 0 and 10000");
        browserOptions.waitMs = Number(value);
      }
    } else if (arg.startsWith("-")) throw Error("Unknown flag: " + arg);
    else if (url === null) url = arg;
    else throw Error("Only one target URL is supported");
  }
  if (!url) throw Error("Missing target URL");
  if (strict && command !== "doctor") throw Error("--strict is available only with doctor");
  if (baselinePath && command !== "doctor") throw Error("--baseline is available only with doctor");
  if (sendKeyToBase && command === "doctor") throw Error("doctor sends credentials only to its explicit target; --send-key-to-base is not applicable");
  if (command === "doctor") {
    if (base !== BASE) throw Error("doctor probes the supplied endpoint directly; do not use --base");
    if (web) return { command: "doctor-web", url: validateWebPage(url), json, strict, baselinePath, ...browserOptions };
    return { command, url: validateEndpoint(url), base: validateBase(base), json, strict, ...(baselinePath ? { baselinePath } : {}) };
  }
  return { command, url: validateTarget(url), base: validateBase(base), json, ...(sendKeyToBase ? { sendKeyToBase: true } : {}) };
}

async function jsonRequest(url, options = {}, key = "", request = fetch) {
  const headers = { accept: "application/json, text/event-stream", ...options.headers };
  if (key) headers.authorization = "Bearer " + key;
  let response;
  try {
    response = await request(url, { ...options, headers, signal: AbortSignal.timeout(15000) });
  } catch (error) {
    throw Error("Request failed: " + (error?.name === "TimeoutError" ? "15-second timeout" : String(error?.message || error)));
  }
  // Bound output size: a remote server could return a huge error document.
  const body = (await response.text()).slice(0, 2_000_000);
  let data;
  try {
    if ((response.headers?.get("content-type") || "").includes("text/event-stream")) {
      const events = body.split(/\r?\n/).filter((line) => /^data:\s*/.test(line));
      data = JSON.parse(events.at(-1)?.replace(/^data:\s*/, "") || "{}");
    } else data = JSON.parse(body);
  } catch {
    throw Error("Server returned invalid JSON (" + response.status + ")");
  }
  if (!response.ok) throw Error("HTTP " + response.status + ": " + String(data?.error || data?.hint || "request failed").slice(0, 200));
  if (data?.error) {
    const err = data.error;
    throw Error(typeof err === "string" ? err : (err.message || JSON.stringify(err)).slice(0, 200));
  }
  return data;
}

export async function execute({ command, url, base = BASE, baselinePath = null, sendKeyToBase = false, chrome, waitMs, endpoint, allowPreviewOrigin,
  sourcePath, catalogPath, goal, method, contextPath, embeddingsPath, limit, workflowPath, policyPath, fixturePath, tool,
  taskPath, evidencePath }, { request = fetch, apiKey = "", scan } = {}) {
  if (command === "compile") return compileFile(sourcePath);
  if (command === "contract") return inspectToolContract(sourcePath, tool);
  if (command === "select") return selectToolFiles(taskPath, evidencePath);
  if (command === "ontology" || command === "discover") {
    const ontology = loadOntology(catalogPath);
    if (command === "ontology") return ontology;
    const embeddings = embeddingsPath === undefined ? undefined : readLocalJson(embeddingsPath, "Embeddings", 16_000_000);
    const context = contextPath === undefined ? undefined : readLocalJson(contextPath, "Discovery context");
    return createDiscovery(ontology, { embeddings })(goal, { method, context, limit });
  }
  if (command === "compose" || command === "replay") {
    const ontology = loadOntology(catalogPath);
    const policy = readLocalJson(policyPath, "Workflow policy");
    if (workflowPath === undefined) return findCompositions(ontology, policy);
    const plan = composeWorkflow(ontology, readLocalJson(workflowPath, "Workflow"), policy);
    return command === "compose" ? plan : replayWorkflow(plan, readLocalJson(fixturePath, "Workflow fixture"));
  }
  const origin = validateBase(base);
  // WMCP_API_KEY is trusted only for the public WMCP host by default.
  // A custom base may be a third-party endpoint: avoid exfiltrating keys.
  const scopedApiKey = origin === BASE || sendKeyToBase ? apiKey : "";
  if (command === "config") {
    // A live key must never be serialized into terminal / chat logs.
    return { mcpServers: { wmcp: { type: "http", url: mcpEndpoint(url, origin) } } };
  }
  if (command === "inspect") return jsonRequest(origin + "/api/v1/tools?url=" + encodeURIComponent(url), {}, scopedApiKey, request);
  if (command === "grade") return jsonRequest(origin + "/api/v1/mcp/grade?url=" + encodeURIComponent(url), {}, scopedApiKey, request);
  if (command === "mcp") return inspectMcpEndpoint(mcpEndpoint(url, origin), { request, apiKey: scopedApiKey });
  if (command === "doctor" || command === "doctor-web") {
    let baseline = null;
    if (baselinePath) {
      const stat = statSync(baselinePath);
      if (!stat.isFile() || stat.size > 2_000_000) throw Error("Doctor baseline must be a JSON file no larger than 2 MB");
      try { baseline = JSON.parse(readFileSync(baselinePath, "utf8")); }
      catch { throw Error("Doctor baseline contains invalid JSON"); }
    }
    if (command === "doctor-web") return doctorWeb(url, { request, scan, baseline, chrome, waitMs, endpoint, allowPreviewOrigin });
    return doctorMcp(url, { request, apiKey, baseline });
  }
  throw Error("Unsupported command");
}

export function summarize(command, value, json = false) {
  if (json || ["config", "compile", "ontology", "discover", "compose", "replay", "contract", "select"].includes(command)) return JSON.stringify(value, null, 2);
  if (command === "doctor") return formatDoctor(value);
  if (command === "doctor-web") return formatDoctorWeb(value);
  if (command === "grade") return "MCP trust grade: " + (value.grade ?? "?") + "\n" +
      "Server: " + (value.host || value.url || "unknown") + "\n" +
      "Full report: " + (value.report_url || "https://wmcp.sh/mcp/grade");
  const tools = Array.isArray(value.tools) ? value.tools :
    Array.isArray(value?.payload?.tools) ? value.payload.tools : [];
  const lines = tools.slice(0, 40).map((tool) =>
    "  • " + String(tool.name || "unnamed") + " — " +
      String(tool.description || "no description").replace(/\s+/g, " ").slice(0, 100));
  return (command === "mcp" ? "MCP server: " + value.server + " (" + value.protocolVersion + ")\n" : "") +
    "Tools discovered: " + tools.length + "\n" + (lines.join("\n") || "No tools returned.") +
    (tools.length > 40 ? "\n… " + (tools.length - 40) + " more (use --json)" : "") +
    "\nDiscovery does not prove an action is executable or authorized.";
}

export async function main(argv = process.argv.slice(2), options = {}) {
  try {
    const args = parseArgs(argv);
    if (args.help) { console.log(HELP); return 0; }
    const data = await execute(args, { request: options.request || fetch, apiKey: options.apiKey ?? process.env.WMCP_API_KEY ?? "", scan: options.scan });
    console.log(summarize(args.command, data, args.json));
    if ((args.strict && data.status !== "pass") || (args.command === "compile" && !data.complete) ||
        (args.command === "replay" && data.status !== "completed") || (args.command === "contract" && !data.valid) ||
        (args.command === "select" && data.status === "no-feasible-tool")) return 2;
    return 0;
  } catch (error) {
    console.error("wmcp: " + String(error.message || error));
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main();
}
