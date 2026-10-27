#!/usr/bin/env node
// WMCP read-only developer CLI. No hosted credentials and no dependencies.
import { pathToFileURL } from "node:url";
import { readFileSync, statSync } from "node:fs";
import { inspectMcpEndpoint, validateEndpoint } from "./mcp-read.mjs";
import { doctorMcp, formatDoctor } from "./doctor.mjs";
const BASE = "https://wmcp.sh";
const CMDS = ["inspect", "mcp", "grade", "config", "doctor"];
const HELP = [
  "wmcp — inspect websites and MCP servers without setting up an agent",
  "",
  "Usage:",
  "  node cli/wmcp.mjs inspect <public-url> [--json]",
  "  node cli/wmcp.mjs mcp     <public-url> [--json]",
  "  node cli/wmcp.mjs grade   <mcp-endpoint-url> [--json]",
  "  node cli/wmcp.mjs config  <public-url>",
  "  node cli/wmcp.mjs doctor  <mcp-endpoint-url> [--json] [--strict] [--baseline path]",
  "",
  "Options:",
  "  --json           Print machine-readable JSON",
  "  --strict         Doctor exits 2 if any warning or error exists",
  "  --baseline path  Compare Doctor output with a local JSON report",
  "  --base <origin>  Another WMCP service; HTTP only for local development",
  "",
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
  let json = false, strict = false, base = BASE, url = null, baselinePath = null;
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === "--json") json = true;
    else if (arg === "--strict") strict = true;
    else if (arg === "--baseline") {
      baselinePath = rest[++i];
      if (!baselinePath) throw Error("--baseline requires a report JSON file");
    }
    else if (arg === "--base") {
      base = rest[++i];
      if (!base) throw Error("--base requires an origin URL");
    } else if (arg.startsWith("-")) throw Error("Unknown flag: " + arg);
    else if (url === null) url = arg;
    else throw Error("Only one target URL is supported");
  }
  if (!url) throw Error("Missing target URL");
  if (strict && command !== "doctor") throw Error("--strict is available only with doctor");
  if (baselinePath && command !== "doctor") throw Error("--baseline is available only with doctor");
  if (command === "doctor") {
    if (base !== BASE) throw Error("doctor probes the supplied endpoint directly; do not use --base");
    return { command, url: validateEndpoint(url), base: validateBase(base), json, strict, ...(baselinePath ? { baselinePath } : {}) };
  }
  return { command, url: validateTarget(url), base: validateBase(base), json };
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

export async function execute({ command, url, base = BASE, baselinePath = null }, { request = fetch, apiKey = "" } = {}) {
  const origin = validateBase(base);
  if (command === "config") {
    // A live key must never be serialized into terminal / chat logs.
    return { mcpServers: { wmcp: { type: "http", url: mcpEndpoint(url, origin) } } };
  }
  if (command === "inspect") return jsonRequest(origin + "/api/v1/tools?url=" + encodeURIComponent(url), {}, apiKey, request);
  if (command === "grade") return jsonRequest(origin + "/api/v1/mcp/grade?url=" + encodeURIComponent(url), {}, apiKey, request);
  if (command === "mcp") return inspectMcpEndpoint(mcpEndpoint(url, origin), { request, apiKey });
  if (command === "doctor") {
    let baseline = null;
    if (baselinePath) {
      const stat = statSync(baselinePath);
      if (!stat.isFile() || stat.size > 2_000_000) throw Error("Doctor baseline must be a JSON file no larger than 2 MB");
      try { baseline = JSON.parse(readFileSync(baselinePath, "utf8")); }
      catch { throw Error("Doctor baseline contains invalid JSON"); }
    }
    return doctorMcp(url, { request, apiKey, baseline });
  }
  throw Error("Unsupported command");
}

export function summarize(command, value, json = false) {
  if (json || command === "config") return JSON.stringify(value, null, 2);
  if (command === "doctor") return formatDoctor(value);
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
    const data = await execute(args, { request: options.request || fetch, apiKey: options.apiKey ?? process.env.WMCP_API_KEY ?? "" });
    console.log(summarize(args.command, data, args.json));
    if (args.command === "doctor" && args.strict && data.status !== "pass") return 2;
    return 0;
  } catch (error) {
    console.error("wmcp: " + String(error.message || error));
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main();
}
