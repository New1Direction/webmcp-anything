// mcp_pkg.ts — STATIC scanner for stdio / package MCP servers (no endpoint to probe).
//
// The official registry is ~15k entries but only ~3,100 expose a remote URL; the
// rest are npm/pip packages that run locally. We can't connect to those — but we
// CAN read their published source. This grades an npm package from its metadata +
// source (fetched file-by-file via jsdelivr, no tarball untar) on a package-shaped
// rubric, and stores it in the SAME grade: namespace (host = "npm:<name>") so it
// flows into the leaderboard, report, and categories — growing the corpus past the
// remote-only set. "We grade every MCP server, hosted or local."

import type { GradeResult, SubScore } from "./mcp_grade";
import { letter, recordGrade, deriveCategory } from "./mcp_grade";

const PKG_TIMEOUT = 10000;
const MAX_SOURCE_FILES = 6;
const MAX_SOURCE_BYTES = 240_000;

async function getJson(url: string): Promise<any | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), PKG_TIMEOUT);
  try {
    const res = await fetch(url, { headers: { "user-agent": "wmcp.sh-grader/1.0 (+https://wmcp.sh/mcp/grade)", accept: "application/json" }, signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; } finally { clearTimeout(t); }
}
async function getText(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), PKG_TIMEOUT);
  try {
    const res = await fetch(url, { headers: { "user-agent": "wmcp.sh-grader/1.0 (+https://wmcp.sh/mcp/grade)" }, signal: ctrl.signal });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; } finally { clearTimeout(t); }
}

const z = (weight: number, notes: string[] = []): SubScore => ({ score: 0, weight, notes });
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

// Source-pattern signals (shared spirit with the remote grader).
const INJ = /<important>|<hidden>|<secret>|do not (tell|mention|inform|reveal)|ignore (the )?(previous|prior|above)|system prompt/i;
const SECRET = /~\/\.ssh|id_rsa|\/etc\/passwd|\bAWS_SECRET|process\.env\.\w*(KEY|TOKEN|SECRET|PASSWORD)|\.cursor\/mcp\.json|private[_ ]?key/i;
const DANGER = /\beval\(|new Function\(|child_process|execSync\(|\bexec\(|\bspawn\(/;
const HARDCODED = /(sk-[a-zA-Z0-9]{20,}|gh[ps]_[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|xox[baprs]-[a-zA-Z0-9-]{10,})/;
// best-effort tool extraction from source
const TOOL_DEF = /(?:server|mcp|tool)\.(?:tool|registerTool|addTool)\(\s*["'`]([a-zA-Z0-9_.-]{2,64})["'`]\s*,\s*["'`]([^"'`]{0,160})/g;
const TOOL_NAME = /(?:name:\s*|setRequestHandler\([^,]*,\s*)["'`]([a-zA-Z0-9_.-]{2,64})["'`]/g;

/** Grade an npm package as a (stdio) MCP server from its published source. */
export async function scoreMcpPackage(rawName: string, version?: string): Promise<GradeResult> {
  const name = rawName.trim();
  const host = `npm:${name}`;
  const r: GradeResult = {
    url: `https://www.npmjs.com/package/${name}`, host, checked_at: Date.now(),
    reachable: false, auth_required: false, grade: "F", score: 0, sub: {}, findings: [],
    tools_count: 0, transport: undefined, title: name, kind: "package",
  };

  const meta = await getJson(`https://registry.npmjs.org/${encodeURIComponent(name).replace(/%40/g, "@").replace(/%2F/g, "/")}`);
  if (!meta || !meta.versions) {
    r.findings.push({ id: "pkg_missing", severity: "fail", detail: "Package not found on the npm registry." });
    r.sub = { spec: z(20), security: z(30), maintenance: z(20), hygiene: z(15), transparency: z(15) };
    r.category = deriveCategory([], name, "");
    return r;
  }
  const ver = version && meta.versions[version] ? version : meta["dist-tags"]?.latest;
  const v = meta.versions[ver] || {};
  r.url = `https://www.npmjs.com/package/${name}`;
  r.protocol_version = ver;
  const desc = String(v.description || meta.description || "");
  const keywords: string[] = Array.isArray(v.keywords) ? v.keywords : [];
  const repoUrl = typeof v.repository === "string" ? v.repository : v.repository?.url || meta.repository?.url || "";
  const license = v.license || meta.license || "";
  const scripts = v.scripts || {};
  const deps = { ...(v.dependencies || {}), ...(v.peerDependencies || {}) };
  const depCount = Object.keys(v.dependencies || {}).length;
  const hasMcpSdk = Object.keys(deps).some((d) => /modelcontextprotocol|@mcp|fastmcp|mcp-/.test(d));
  const hasBin = !!v.bin;
  const isTyped = !!(v.types || v.typings || Object.keys(deps).some((d) => d === "typescript"));
  const lastPublish = meta.time?.[ver] || meta.time?.modified;
  const ageDays = lastPublish ? Math.floor((Date.now() - new Date(lastPublish).getTime()) / 86400000) : 9999;

  // weekly downloads (best-effort)
  let downloads = 0;
  const dl = await getJson(`https://api.npmjs.org/downloads/point/last-week/${name}`);
  if (dl && typeof dl.downloads === "number") downloads = dl.downloads;

  // ---- fetch a sample of source files via jsdelivr (no tarball untar) ----
  let source = "";
  const sampled: string[] = [];
  const flat: string[] = [];
  const tree = await getJson(`https://data.jsdelivr.com/v1/packages/npm/${name}@${ver}`);
  const walk = (nodes: any[], prefix: string) => {
    for (const n of nodes || []) {
      if (n.type === "directory") walk(n.files, `${prefix}${n.name}/`);
      else flat.push(`${prefix}${n.name}`);
    }
  };
  if (tree?.files) walk(tree.files, "");
  // prefer entry/tool/server files; skip maps, json, tests, declarations
  const pick = flat
    .filter((f) => /\.(js|mjs|cjs|ts)$/.test(f) && !/\.d\.ts$/.test(f) && !/(test|spec|__|\.min\.)/.test(f))
    .sort((a, b) => score(b) - score(a))
    .slice(0, MAX_SOURCE_FILES);
  function score(f: string): number {
    let s = 0;
    if (/index|main|server|tools?|cli|bin/.test(f)) s += 3;
    if (/^(src|dist|lib)\//.test(f)) s += 1;
    const depth = f.split("/").length; s -= depth * 0.1;
    return s;
  }
  for (const f of pick) {
    if (source.length > MAX_SOURCE_BYTES) break;
    const txt = await getText(`https://cdn.jsdelivr.net/npm/${name}@${ver}/${f}`);
    if (txt) { source += "\n" + txt.slice(0, 80_000); sampled.push(f); }
  }

  // ---- best-effort tool extraction ----
  const toolMap = new Map<string, string>();
  let m: RegExpExecArray | null;
  while ((m = TOOL_DEF.exec(source)) && toolMap.size < 30) toolMap.set(m[1], (m[2] || "").trim());
  if (toolMap.size === 0) { while ((m = TOOL_NAME.exec(source)) && toolMap.size < 30) if (!toolMap.has(m[1])) toolMap.set(m[1], ""); }
  const toolsArr = [...toolMap].map(([n2, d]) => ({ name: n2, description: d }));
  r.tools_count = toolsArr.length;
  if (toolsArr.length) r.tools_preview = toolsArr.slice(0, 18).map((t) => ({ name: t.name.slice(0, 64), desc: (t.description || "").replace(/\s+/g, " ").trim().slice(0, 150) }));

  // ---- scan ----
  const injHit = INJ.test(source);
  const secretPath = SECRET.test(source);
  const hardcoded = HARDCODED.test(source);
  const danger = DANGER.test(source);
  const installScript = !!(scripts.postinstall || scripts.install || scripts.preinstall);

  // ---- Security (30%) ----
  let sec = 90;
  const secNotes: string[] = [];
  if (sampled.length) {
    if (hardcoded) { sec = Math.min(sec, 5); secNotes.push("⚠ hardcoded API-key-shaped secret in source"); }
    if (injHit) { sec = Math.min(sec, 15); secNotes.push("⚠ prompt-injection / hidden-instruction markup in source"); }
    if (secretPath) { sec = Math.min(sec, 25); secNotes.push("⚠ references sensitive file paths / env secrets"); }
    if (installScript) { sec = Math.min(sec, 55); secNotes.push("install/postinstall script present (supply-chain surface)"); }
    if (danger) { sec = Math.min(sec, 70); secNotes.push("uses eval/exec/child_process (review for unsanitized input)"); }
    if (sec >= 90) secNotes.push("no high-risk patterns in sampled source");
    secNotes.push(`scanned ${sampled.length} source file${sampled.length === 1 ? "" : "s"}`);
  } else {
    sec = 50; secNotes.push("source not retrievable — graded on metadata only");
  }

  // ---- Spec / packaging (20%) ----
  let spec = 40;
  const specNotes: string[] = [];
  if (hasMcpSdk) { spec += 35; specNotes.push("✓ depends on an MCP SDK"); } else specNotes.push("no recognized MCP SDK dependency");
  if (hasBin) { spec += 15; specNotes.push("✓ declares a bin entry (runnable server)"); } else specNotes.push("no bin entry");
  if (toolsArr.length) { spec += 10; specNotes.push(`✓ ${toolsArr.length} tool(s) detected in source`); } else specNotes.push("no tools detected in sampled source");
  spec = clamp(spec);

  // ---- Maintenance (20%) ----
  let maint = 50;
  const maintNotes: string[] = [];
  if (ageDays < 90) { maint = 92; maintNotes.push("published within 90 days"); }
  else if (ageDays < 365) { maint = 75; maintNotes.push(`last published ~${Math.round(ageDays / 30)}mo ago`); }
  else { maint = 40; maintNotes.push(`stale — last published ~${Math.round(ageDays / 365)}y ago`); }
  const verCount = Object.keys(meta.versions).length;
  if (verCount >= 5) maint = clamp(maint + 8);
  maintNotes.push(`${verCount} published version${verCount === 1 ? "" : "s"}`);

  // ---- Hygiene (15%) ----
  let hyg = 50;
  const hygNotes: string[] = [];
  if (isTyped) { hyg += 25; hygNotes.push("✓ ships TypeScript types"); } else hygNotes.push("no TypeScript types");
  if (depCount <= 12) { hyg += 20; hygNotes.push(`${depCount} runtime deps`); } else { hyg -= 10; hygNotes.push(`${depCount} runtime deps (heavy)`); }
  if (installScript) { hyg -= 15; hygNotes.push("install script reduces hygiene"); }
  hyg = clamp(hyg);

  // ---- Transparency / provenance (15%) ----
  let trans = 30;
  const transNotes: string[] = [];
  if (repoUrl) { trans += 35; transNotes.push("✓ public repository linked"); } else transNotes.push("no repository link");
  if (license) { trans += 25; transNotes.push(`✓ ${String(license).slice(0, 24)} license`); } else transNotes.push("no license declared");
  if (downloads >= 1000) { trans += 10; transNotes.push(`${downloads.toLocaleString()} weekly downloads`); }
  else if (downloads > 0) transNotes.push(`${downloads.toLocaleString()} weekly downloads`);
  trans = clamp(trans);

  r.sub = {
    spec: { score: spec, weight: 20, notes: specNotes },
    security: { score: sec, weight: 30, notes: secNotes },
    maintenance: { score: maint, weight: 20, notes: maintNotes },
    hygiene: { score: hyg, weight: 15, notes: hygNotes },
    transparency: { score: trans, weight: 15, notes: transNotes },
  };
  r.score = clamp(Object.values(r.sub).reduce((a, s) => a + (s.score * s.weight) / 100, 0));
  // hard caps mirror the remote grader
  if (injHit || hardcoded) r.score = Math.min(r.score, 55);
  r.grade = letter(r.score);
  r.reachable = true; // we successfully analyzed it
  if (injHit) r.findings.push({ id: "tool_poisoning", severity: "fail", owasp: "MCP01", detail: "Prompt-injection / hidden-instruction markup found in package source." });
  if (hardcoded) r.findings.push({ id: "secret_exfil", severity: "fail", owasp: "MCP08", detail: "Hardcoded API-key-shaped secret found in package source." });
  else if (secretPath) r.findings.push({ id: "secret_exfil", severity: "warn", owasp: "MCP08", detail: "References sensitive file paths / environment secrets." });
  if (installScript) r.findings.push({ id: "install_script", severity: "warn", detail: "Runs an install/postinstall script — supply-chain surface to review." });
  r.findings.push({ id: "pkg", severity: "info", detail: `Static analysis of npm package ${name}@${ver} (stdio server — no remote endpoint). Reliability/behavioral signals require running it; not measured.` });

  r.category = deriveCategory(toolsArr, name, `${desc} ${keywords.join(" ")}`);
  return r;
}

/**
 * Walk the registry for npm-package servers (the ~15k stdio entries we can't reach
 * remotely) and statically grade them. Separate cursor so it doesn't fight the
 * remote registry seed. Each call grades up to `max` npm packages.
 */
export async function seedRegistryPackages(env: any, max = 12): Promise<{ seeded: number; scanned: number; nextCursor: string }> {
  const CURSOR = "pkgseed:cursor";
  const cursor = (await env.CACHE.get(CURSOR)) || "";
  let scanned = 0, seeded = 0, nextCursor = cursor, pages = 0;
  // pull registry pages until we collect `max` npm packages or run out
  const targets: string[] = [];
  let cur = cursor;
  while (targets.length < max && pages < 6) {
    const api = `https://registry.modelcontextprotocol.io/v0/servers?limit=50` + (cur ? `&cursor=${encodeURIComponent(cur)}` : "");
    const page = await getJson(api);
    if (!page) break;
    for (const s of page.servers || []) {
      const srv = s?.server || s; // registry wraps entries as {server, _meta} since 2025-12-11
      const pkgs: any[] = srv?.packages || [];
      const npm = pkgs.find((p) => /^npm$/i.test(String(p.registry_type || p.registry_name || p.registryType || "")));
      const nm = npm && String(npm.identifier || npm.name || "").trim();
      if (nm && !targets.includes(nm) && targets.length < max) targets.push(nm);
    }
    nextCursor = page?.metadata?.nextCursor || "";
    cur = nextCursor;
    pages++;
    if (!nextCursor) break;
  }
  await env.CACHE.put(CURSOR, nextCursor, { expirationTtl: 60 * 86400 });

  await Promise.all(targets.map(async (nm) => {
    scanned++;
    try {
      // skip if already graded recently
      const existing = await env.CACHE.get(`grade:npm:${nm.toLowerCase()}`);
      if (existing) return;
      const g = await scoreMcpPackage(nm);
      await recordGrade(env, g);
      seeded++;
    } catch {}
  }));
  return { seeded, scanned, nextCursor };
}
