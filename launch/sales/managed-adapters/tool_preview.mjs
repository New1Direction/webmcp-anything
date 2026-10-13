#!/usr/bin/env node
// Offline prospect preview: run a public OpenAPI spec through the same
// adapters/openapi.js the hosted worker uses, without calling wmcp.sh.
// Calling /api/v1/tools instead would write a permanent `seen:` entry and
// publish a /u/* directory page for the prospect's spec before they've agreed.
//
//   node launch/sales/managed-adapters/tool_preview.mjs <spec-url|local.json> [--json]
//
// YAML-only specs: convert first, e.g.
//   uvx --with pyyaml python -c "import sys,yaml,json;json.dump(yaml.safe_load(sys.stdin),sys.stdout)" < spec.yml > spec.json

import { readFile } from "node:fs/promises";
import { extractFromSpec } from "../../../adapters/openapi.js";

const [specUrl, flag] = process.argv.slice(2);
if (!specUrl) {
  console.error("usage: tool_preview.mjs <openapi-json-url|file> [--json]");
  process.exit(2);
}

let text;
if (/^https?:\/\//.test(specUrl)) {
  const res = await fetch(specUrl, { headers: { accept: "application/json" } });
  if (!res.ok) {
    console.error(`fetch failed: ${res.status} ${specUrl}`);
    process.exit(1);
  }
  text = await res.text();
} else {
  text = await readFile(specUrl, "utf8");
}
let spec;
try {
  spec = JSON.parse(text);
} catch {
  console.error("not JSON (YAML specs need converting first; the hosted adapter is JSON-only too)");
  process.exit(1);
}
if (!spec.openapi && !spec.swagger) {
  console.error("not an OpenAPI/Swagger document");
  process.exit(1);
}

let ops = 0;
let undocumented = 0;
let noOperationId = 0;
const byMethod = {};
for (const item of Object.values(spec.paths || {})) {
  for (const m of ["get", "post", "put", "delete", "patch"]) {
    const op = item?.[m];
    if (!op) continue;
    ops++;
    byMethod[m] = (byMethod[m] || 0) + 1;
    if (!op.summary && !op.description) undocumented++;
    if (!op.operationId) noOperationId++;
  }
}

const out = extractFromSpec(spec, specUrl);
const nonGet = ops - (byMethod.get || 0);
const baseUrl = out.tools[0]?.action.baseUrl || "";
const badBase = !/^https:\/\//.test(baseUrl) || /localhost|127\.0\.0\.1|example\.com/.test(baseUrl);
const report = {
  specUrl,
  title: out.product.title,
  version: out.product.version,
  specBytes: text.length,
  operations: ops,
  toolsEmitted: out.tools.length,
  truncatedFrom: out.truncated,
  byMethod,
  nonGetOperations: nonGet,
  undocumentedOperations: undocumented,
  generatedNames: noOperationId,
  baseUrl,
  baseUrlNeedsFix: badBase,
  sampleTools: out.tools.slice(0, 12).map((t) => t.name),
};

if (flag === "--json") {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(`${report.title} ${report.version ?? ""}`.trim());
  console.log(`  spec:            ${specUrl} (${Math.round(text.length / 1024)} KB)`);
  console.log(`  operations:      ${ops}  (${Object.entries(byMethod).map(([m, n]) => `${m.toUpperCase()} ${n}`).join(", ")})`);
  console.log(`  tools emitted:   ${out.tools.length}${out.truncated ? ` (capped from ${out.truncated})` : ""}`);
  console.log(`  non-GET ops:     ${nonGet}  ← candidate writes; check each (some APIs search via POST) and gate real ones`);
  console.log(`  undocumented:    ${undocumented}  ← agents pick tools by description; these are invisible`);
  console.log(`  generated names: ${noOperationId}  ← no operationId, tool names fall back to method_path`);
  console.log(`  base URL:        ${baseUrl}${badBase ? "  ← NOT a usable production host; raw generation would call this" : ""}`);
  console.log(`  sample:          ${report.sampleTools.join(", ")}`);
}
