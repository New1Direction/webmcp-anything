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

async function getJson(url: string, extraHeaders: Record<string, string> = {}): Promise<any | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), PKG_TIMEOUT);
  try {
    const res = await fetch(url, { headers: { "user-agent": "wmcp.sh-grader/1.0 (+https://wmcp.sh/mcp/grade)", accept: "application/json", ...extraHeaders }, signal: ctrl.signal });
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

// Python danger patterns (parallel to the npm DANGER set).
const PY_DANGER = /\beval\(|\bexec\(|subprocess|os\.system|os\.popen|__import__\(|pickle\.loads|shell\s*=\s*True/;
const PY_TOOL = /@(?:mcp|server|app|tools?)\.tool|@tool\b|Tool\(\s*name\s*=\s*["']([a-zA-Z0-9_.-]{2,64})["']|types\.Tool\(|add_tool\(|register_tool\(/g;

function ghFromUrls(info: any): { owner: string; repo: string } | null {
  const cands: string[] = [];
  const purls = info?.project_urls || {};
  for (const k of Object.keys(purls)) cands.push(String(purls[k] || ""));
  if (info?.home_page) cands.push(String(info.home_page));
  for (const u of cands) {
    const m = u.match(/github\.com\/([^/\s]+)\/([^/\s#?]+)/i);
    if (m) return { owner: m[1], repo: m[2].replace(/\.git$/, "") };
  }
  return null;
}

/** Pull a bounded sample of source from a GitHub repo via jsdelivr (no clone). */
async function scanGitHubSource(owner: string, repo: string, exts: RegExp): Promise<{ source: string; sampled: string[]; ref: string; versions: number }> {
  let source = "", sampled: string[] = [];
  const meta = await getJson(`https://data.jsdelivr.com/v1/packages/gh/${owner}/${repo}`);
  const versions = meta?.versions?.length || 0;
  const ref = meta?.versions?.[0]?.version || meta?.tags?.latest || "HEAD";
  const tree = await getJson(`https://data.jsdelivr.com/v1/packages/gh/${owner}/${repo}@${ref}`);
  if (!tree?.files) return { source, sampled, ref, versions };
  const flat: string[] = [];
  const walk = (nodes: any[], prefix: string) => { for (const n of nodes || []) { if (n.type === "directory") walk(n.files, `${prefix}${n.name}/`); else flat.push(`${prefix}${n.name}`); } };
  walk(tree.files, "");
  const pick = flat
    .filter((f) => exts.test(f) && !/(test|spec|__pycache__|\.min\.|examples?\/|docs?\/)/i.test(f))
    .sort((a, b) => (/(server|main|tool|index|app|__init__)/.test(b) ? 1 : 0) - (/(server|main|tool|index|app|__init__)/.test(a) ? 1 : 0))
    .slice(0, MAX_SOURCE_FILES);
  for (const f of pick) {
    if (source.length > MAX_SOURCE_BYTES) break;
    const txt = await getText(`https://cdn.jsdelivr.net/gh/${owner}/${repo}@${ref}/${f}`);
    if (txt) { source += "\n" + txt.slice(0, 80_000); sampled.push(f); }
  }
  // Fallback for repos jsdelivr can't mirror (too large): pull common files
  // straight from raw.githubusercontent (the raw CDN — not API-rate-limited).
  if (!sampled.length) {
    const guesses = ["README.md", "readme.md", "pyproject.toml", "package.json", "setup.py", "server.py", "main.py", "src/index.ts", "index.ts", "src/server.py", `src/${repo}/__init__.py`, `${repo}/server.py`, "mcp_server.py", "src/main.rs"];
    for (const g of guesses) {
      if (source.length > MAX_SOURCE_BYTES || sampled.length >= MAX_SOURCE_FILES) break;
      const txt = await getText(`https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${g}`);
      if (txt) { source += "\n" + txt.slice(0, 80_000); sampled.push(g); }
    }
  }
  return { source, sampled, ref, versions };
}

/** Grade a PyPI package as a (stdio) MCP server from its metadata + GitHub source. */
export async function scoreMcpPyPiPackage(rawName: string): Promise<GradeResult> {
  const name = rawName.trim();
  const host = `pypi:${name}`;
  const r: GradeResult = {
    url: `https://pypi.org/project/${name}/`, host, checked_at: Date.now(),
    reachable: false, auth_required: false, grade: "F", score: 0, sub: {}, findings: [],
    tools_count: 0, title: name, kind: "package",
  };
  const meta = await getJson(`https://pypi.org/pypi/${encodeURIComponent(name)}/json`);
  if (!meta?.info) {
    r.findings.push({ id: "pkg_missing", severity: "fail", detail: "Package not found on PyPI." });
    r.sub = { spec: z(20), security: z(30), maintenance: z(20), hygiene: z(15), transparency: z(15) };
    r.category = deriveCategory([], name, "");
    return r;
  }
  const info = meta.info;
  const ver = info.version;
  r.protocol_version = ver;
  const summary = String(info.summary || "");
  const keywords = String(info.keywords || "");
  const classifiers: string[] = info.classifiers || [];
  const license = info.license || classifiers.find((c) => /License ::/.test(c))?.split("::").pop()?.trim() || "";
  const reqs: string[] = info.requires_dist || [];
  const depCount = reqs.length;
  const hasMcpSdk = reqs.some((d) => /^(mcp|fastmcp|modelcontextprotocol|mcp-)/i.test(d));
  const isTyped = classifiers.some((c) => /Typing :: Typed/.test(c));
  const gh = ghFromUrls(info);
  const lastUpload = (meta.urls?.[0]?.upload_time_iso_8601) || (meta.releases?.[ver]?.[0]?.upload_time_iso_8601);
  const ageDays = lastUpload ? Math.floor((Date.now() - new Date(lastUpload).getTime()) / 86400000) : 9999;
  const verCount = Object.keys(meta.releases || {}).length;

  let downloads = 0;
  const dl = await getJson(`https://pypistats.org/api/packages/${name.toLowerCase()}/recent`);
  if (dl?.data?.last_week) downloads = dl.data.last_week;

  let source = "", sampled: string[] = [];
  if (gh) { const s = await scanGitHubSource(gh.owner, gh.repo, /\.(py|pyi)$/); source = s.source; sampled = s.sampled; }

  // tools from source
  const toolNames = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = PY_TOOL.exec(source)) && toolNames.size < 30) { if (m[1]) toolNames.add(m[1]); }
  const toolHits = (source.match(/@(?:mcp|server|app)\.tool|register_tool\(|add_tool\(/g) || []).length;
  const toolCount = Math.max(toolNames.size, toolHits);
  r.tools_count = toolCount;
  if (toolNames.size) r.tools_preview = [...toolNames].slice(0, 18).map((n) => ({ name: n.slice(0, 64), desc: "" }));

  const injHit = INJ.test(source), secretPath = SECRET.test(source), hardcoded = HARDCODED.test(source), danger = PY_DANGER.test(source);

  let sec = 90; const secNotes: string[] = [];
  if (sampled.length) {
    if (hardcoded) { sec = Math.min(sec, 5); secNotes.push("⚠ hardcoded API-key-shaped secret in source"); }
    if (injHit) { sec = Math.min(sec, 15); secNotes.push("⚠ prompt-injection markup in source"); }
    if (secretPath) { sec = Math.min(sec, 25); secNotes.push("⚠ references sensitive file paths / secrets"); }
    if (danger) { sec = Math.min(sec, 65); secNotes.push("uses eval/exec/subprocess/pickle (review for unsanitized input)"); }
    if (sec >= 90) secNotes.push("no high-risk patterns in sampled source");
    secNotes.push(`scanned ${sampled.length} source file${sampled.length === 1 ? "" : "s"} from GitHub`);
  } else { sec = 50; secNotes.push(gh ? "source not retrievable — graded on metadata only" : "no public repo linked — graded on metadata only"); }

  let spec = 40; const specNotes: string[] = [];
  if (hasMcpSdk) { spec += 35; specNotes.push("✓ depends on an MCP SDK (mcp/fastmcp)"); } else specNotes.push("no recognized MCP SDK dependency");
  if (toolCount) { spec += 25; specNotes.push(`✓ ${toolCount} tool(s) detected in source`); } else specNotes.push("no tools detected");
  spec = clamp(spec);

  let maint = 50; const maintNotes: string[] = [];
  if (ageDays < 90) { maint = 92; maintNotes.push("published within 90 days"); }
  else if (ageDays < 365) { maint = 75; maintNotes.push(`last release ~${Math.round(ageDays / 30)}mo ago`); }
  else { maint = 40; maintNotes.push(`stale — last release ~${Math.round(ageDays / 365)}y ago`); }
  if (verCount >= 5) maint = clamp(maint + 8);
  maintNotes.push(`${verCount} release${verCount === 1 ? "" : "s"}${downloads ? `, ${downloads.toLocaleString()} downloads/wk` : ""}`);

  let hyg = 50; const hygNotes: string[] = [];
  if (isTyped) { hyg += 20; hygNotes.push("✓ declares Typed classifier"); }
  if (depCount <= 15) { hyg += 20; hygNotes.push(`${depCount} declared deps`); } else { hyg -= 5; hygNotes.push(`${depCount} declared deps (heavy)`); }
  if (gh) { hyg += 10; hygNotes.push("public repo"); }
  hyg = clamp(hyg);

  let trans = 25; const transNotes: string[] = [];
  if (gh) { trans += 35; transNotes.push(`✓ repo: github.com/${gh.owner}/${gh.repo}`); } else transNotes.push("no public repository linked");
  if (license) { trans += 25; transNotes.push(`✓ ${String(license).slice(0, 24)} license`); } else transNotes.push("no license declared");
  if (downloads >= 1000) { trans += 12; }
  trans = clamp(trans);

  r.sub = {
    spec: { score: spec, weight: 20, notes: specNotes },
    security: { score: sec, weight: 30, notes: secNotes },
    maintenance: { score: maint, weight: 20, notes: maintNotes },
    hygiene: { score: hyg, weight: 15, notes: hygNotes },
    transparency: { score: trans, weight: 15, notes: transNotes },
  };
  r.score = clamp(Object.values(r.sub).reduce((a, s) => a + (s.score * s.weight) / 100, 0));
  if (injHit || hardcoded) r.score = Math.min(r.score, 55);
  r.grade = letter(r.score);
  r.reachable = true;
  if (injHit) r.findings.push({ id: "tool_poisoning", severity: "fail", owasp: "MCP01", detail: "Prompt-injection markup found in package source." });
  if (hardcoded) r.findings.push({ id: "secret_exfil", severity: "fail", owasp: "MCP08", detail: "Hardcoded API-key-shaped secret in package source." });
  else if (secretPath) r.findings.push({ id: "secret_exfil", severity: "warn", owasp: "MCP08", detail: "References sensitive file paths / secrets." });
  r.findings.push({ id: "pkg", severity: "info", detail: `Static analysis of PyPI package ${name}@${ver}${gh ? ` (source: github.com/${gh.owner}/${gh.repo})` : ""} — stdio server, no remote endpoint. Runtime behavior not measured.` });
  r.category = deriveCategory([...toolNames].map((n) => ({ name: n })), name, `${summary} ${keywords}`);
  return r;
}

/** Grade a GitHub-hosted MCP server directly from its repo (for servers not on
 *  npm/pypi — e.g. headroom). Uses the GitHub API for metadata + jsdelivr for source. */
export async function scoreMcpGitHubRepo(owner: string, repo: string, token?: string): Promise<GradeResult> {
  const host = `gh:${owner}/${repo}`;
  const r: GradeResult = {
    url: `https://github.com/${owner}/${repo}`, host, checked_at: Date.now(),
    reachable: false, auth_required: false, grade: "F", score: 0, sub: {}, findings: [],
    tools_count: 0, title: repo, kind: "package",
  };
  // GitHub API gives stars/license/recency. Unauth is 60/hr (the worker's shared
  // IP burns that fast) → set GITHUB_TOKEN to lift it to 5,000/hr. Source comes
  // from jsdelivr / raw.githubusercontent, which aren't rate-limited.
  const gm = (await getJson(`https://api.github.com/repos/${owner}/${repo}`, token ? { authorization: `Bearer ${token}` } : {})) || {};
  const apiOk = !!gm.full_name;
  const { source, sampled, versions } = await scanGitHubSource(owner, repo, /\.(py|pyi|ts|tsx|js|mjs|rs)$/);
  // Never assign a confident grade to a repo we couldn't actually inspect.
  if (!sampled.length && !apiOk) {
    r.grade = "?"; r.score = 0; r.limited = true;
    r.findings.push({ id: "insufficient_data", severity: "info", detail: `Not graded — couldn't retrieve source (repo too large for our source mirror) and the GitHub API was rate-limited. We don't assign a grade we can't justify.${versions ? ` ${versions} releases observed.` : ""} Set a GITHUB_TOKEN to grade large repos.` });
    r.sub = { spec: z(20), security: z(30), maintenance: z(20), hygiene: z(15), transparency: z(15) };
    r.category = deriveCategory([], repo, "");
    return r;
  }
  const stars = gm.stargazers_count || 0;
  const license = apiOk && gm.license?.spdx_id && gm.license.spdx_id !== "NOASSERTION" ? gm.license.spdx_id : "";
  const desc = String(gm.description || "");
  const topics: string[] = gm.topics || [];
  const ageDays = gm.pushed_at ? Math.floor((Date.now() - new Date(gm.pushed_at).getTime()) / 86400000) : (versions >= 3 ? 60 : 9999);
  r.title = (apiOk && gm.name) || repo;
  const blob = `${source} ${desc} ${topics.join(" ")}`;
  const isMcp = /modelcontextprotocol|@modelcontextprotocol|fastmcp|mcp[_-]?server|navigator\.modelContext|\bmcp\b/i.test(blob);
  const toolNames = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = PY_TOOL.exec(source)) && toolNames.size < 30) if (m[1]) toolNames.add(m[1]);
  while ((m = TOOL_DEF.exec(source)) && toolNames.size < 30) toolNames.add(m[1]);
  const toolHits = (source.match(/@(?:mcp|server|app)\.tool|register_tool\(|add_tool\(|server\.tool\(|registerTool\(/g) || []).length;
  const toolCount = Math.max(toolNames.size, toolHits);
  r.tools_count = toolCount;
  if (toolNames.size) r.tools_preview = [...toolNames].slice(0, 18).map((n) => ({ name: n.slice(0, 64), desc: "" }));

  const injHit = INJ.test(source), secretPath = SECRET.test(source), hardcoded = HARDCODED.test(source), danger = DANGER.test(source) || PY_DANGER.test(source);

  let sec = 90; const secNotes: string[] = [];
  if (sampled.length) {
    if (hardcoded) { sec = Math.min(sec, 5); secNotes.push("⚠ hardcoded API-key-shaped secret in source"); }
    if (injHit) { sec = Math.min(sec, 15); secNotes.push("⚠ prompt-injection markup in source"); }
    if (secretPath) { sec = Math.min(sec, 25); secNotes.push("⚠ references sensitive file paths / secrets"); }
    if (danger) { sec = Math.min(sec, 65); secNotes.push("uses eval/exec/subprocess (review for unsanitized input)"); }
    if (sec >= 90) secNotes.push("no high-risk patterns in sampled source");
    secNotes.push(`scanned ${sampled.length} source file${sampled.length === 1 ? "" : "s"}`);
  } else { sec = 50; secNotes.push("source not retrievable — graded on repo metadata only"); }

  let spec = 35; const specNotes: string[] = [];
  if (isMcp) { spec += 40; specNotes.push("✓ MCP server signals in source/metadata"); } else specNotes.push("no clear MCP signals found");
  if (toolCount) { spec += 25; specNotes.push(`✓ ${toolCount} tool(s) detected`); } else specNotes.push("no tools detected in sampled source");
  spec = clamp(spec);

  let maint = 50; const maintNotes: string[] = [];
  if (gm.pushed_at && ageDays < 60) { maint = 92; maintNotes.push("pushed within 60 days"); }
  else if (gm.pushed_at && ageDays < 365) { maint = 74; maintNotes.push(`last push ~${Math.round(ageDays / 30)}mo ago`); }
  else if (versions >= 5) { maint = 80; maintNotes.push(`${versions} releases — actively versioned`); }
  else if (gm.pushed_at) { maint = 38; maintNotes.push(`stale — last push ~${Math.round(ageDays / 365)}y ago`); }
  if (apiOk) maintNotes.push(`${stars.toLocaleString()} stars`); else if (versions) maintNotes.push(`${versions} published releases`);

  let hyg = 55; const hygNotes: string[] = [];
  if (license) { hyg += 20; hygNotes.push(`${license} license`); }
  if (apiOk && !gm.fork) { hyg += 10; hygNotes.push("original (not a fork)"); }
  hyg = clamp(hyg);

  let trans = 55; const transNotes: string[] = ["✓ public GitHub repo"];
  if (license) { trans += 25; transNotes.push(`✓ ${license} license`); } else transNotes.push(apiOk ? "no detected license" : "license/stars unavailable (GitHub API rate-limited) — graded on source + releases");
  if (stars >= 100) { trans += 12; transNotes.push("established (100+ stars)"); }
  trans = clamp(trans);

  r.sub = {
    spec: { score: spec, weight: 20, notes: specNotes },
    security: { score: sec, weight: 30, notes: secNotes },
    maintenance: { score: maint, weight: 20, notes: maintNotes },
    hygiene: { score: hyg, weight: 15, notes: hygNotes },
    transparency: { score: trans, weight: 15, notes: transNotes },
  };
  r.score = clamp(Object.values(r.sub).reduce((a, s) => a + (s.score * s.weight) / 100, 0));
  if (injHit || hardcoded) r.score = Math.min(r.score, 55);
  if (!isMcp) r.score = Math.min(r.score, 60); // not clearly an MCP server
  r.grade = letter(r.score);
  r.reachable = true;
  if (injHit) r.findings.push({ id: "tool_poisoning", severity: "fail", owasp: "MCP01", detail: "Prompt-injection markup found in source." });
  if (hardcoded) r.findings.push({ id: "secret_exfil", severity: "fail", owasp: "MCP08", detail: "Hardcoded secret found in source." });
  r.findings.push({ id: "pkg", severity: "info", detail: `Static analysis of github.com/${owner}/${repo}${apiOk ? ` (${stars.toLocaleString()} stars)` : ""}. Stdio/source-distributed — no remote endpoint; runtime behavior not measured.` });
  r.category = deriveCategory([...toolNames].map((n) => ({ name: n })), repo, `${desc} ${topics.join(" ")}`);
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
  // pull registry pages until we collect `max` package servers (npm OR pypi) or run out
  const targets: Array<{ kind: "npm" | "pypi"; name: string }> = [];
  const seen = new Set<string>();
  let cur = cursor;
  while (targets.length < max && pages < 6) {
    const api = `https://registry.modelcontextprotocol.io/v0/servers?limit=50` + (cur ? `&cursor=${encodeURIComponent(cur)}` : "");
    const page = await getJson(api);
    if (!page) break;
    for (const s of page.servers || []) {
      const srv = s?.server || s; // registry wraps entries as {server, _meta} since 2025-12-11
      const pkgs: any[] = srv?.packages || [];
      for (const p of pkgs) {
        const type = String(p.registry_type || p.registry_name || p.registryType || "").toLowerCase();
        const nm = String(p.identifier || p.name || "").trim();
        const kind = type === "npm" ? "npm" : type === "pypi" ? "pypi" : null;
        if (kind && nm && !seen.has(`${kind}:${nm}`) && targets.length < max) { seen.add(`${kind}:${nm}`); targets.push({ kind, name: nm }); }
      }
    }
    nextCursor = page?.metadata?.nextCursor || "";
    cur = nextCursor;
    pages++;
    if (!nextCursor) break;
  }
  await env.CACHE.put(CURSOR, nextCursor, { expirationTtl: 60 * 86400 });

  await Promise.all(targets.map(async (t) => {
    scanned++;
    try {
      const existing = await env.CACHE.get(`grade:${t.kind}:${t.name.toLowerCase()}`);
      if (existing) return;
      const g = t.kind === "pypi" ? await scoreMcpPyPiPackage(t.name) : await scoreMcpPackage(t.name);
      await recordGrade(env, g);
      seeded++;
    } catch {}
  }));
  return { seeded, scanned, nextCursor };
}
