// skills_seo.ts — programmatic SEO for the agent-skills vertical.
//
// Mirrors the drops/leaderboard playbook: one template + a curated data list →
// a per-skill page, category hubs, and an index, all in the sitemap. Targets the
// "agent skills", "claude skill <X>", "<X> skill for agents" search space —
// newer and less saturated than "mcp servers", and the lane mcpservers.org just
// opened with /agent-skills. wmcp's angle: skills are one leg of the agent
// capability stack — pair them with trust-graded MCP servers (/mcp/leaderboard)
// and any-website tools via WebMCP (/connect). Every page routes to that stack.
//
// Add a row to SKILL_DEFS → the route (/skills/:slug) and sitemap auto-wire.

import { uiCss, uiNav } from "./ui";

export type SkillCat =
  | "Documents" | "Web & Browser" | "Data & Databases" | "Deploy & DevOps"
  | "Observability" | "Design" | "Coding" | "Productivity";

export interface SkillDef {
  slug: string;
  name: string;     // display name
  vendor: string;   // who publishes it
  category: SkillCat;
  what: string;     // what it does
  when: string;     // when an agent should invoke it
}

export const SKILL_DEFS: SkillDef[] = [
  // Documents
  { slug: "docx", name: "DOCX", vendor: "Anthropic", category: "Documents", what: "Create, edit, and analyze Word documents with tracked changes, comments, and formatting preserved.", when: "Reading, writing, or modifying .docx files — reports, contracts, letters." },
  { slug: "pdf", name: "PDF", vendor: "Anthropic", category: "Documents", what: "Extract text and tables, create new PDFs, merge/split documents, and fill forms.", when: "Pulling data out of a PDF, generating one, or splitting/merging pages." },
  { slug: "pptx", name: "PPTX", vendor: "Anthropic", category: "Documents", what: "Build and edit PowerPoint decks — slides, layouts, charts, speaker notes.", when: "Generating or restyling a presentation from an outline or data." },
  { slug: "xlsx", name: "XLSX", vendor: "Anthropic", category: "Documents", what: "Read, write, and analyze Excel workbooks including formulas and multiple sheets.", when: "Working with spreadsheet data, models, or generated reports." },
  // Web & Browser
  { slug: "browser-use", name: "Browser Use", vendor: "browser-use", category: "Web & Browser", what: "Automate browser interactions — navigation, form filling, screenshots, data extraction.", when: "The task needs a real browser to click through or read a rendered site." },
  { slug: "web-scraper", name: "Web Scraper", vendor: "community", category: "Web & Browser", what: "Pull structured data from web pages — listings, prices, articles — into clean JSON.", when: "Collecting data across pages where a direct API isn't available." },
  { slug: "playwright", name: "Playwright", vendor: "Microsoft", category: "Web & Browser", what: "Drive Chromium/WebKit/Firefox for end-to-end tests and reliable page automation.", when: "Writing or running E2E browser tests, or scripted multi-step flows." },
  // Data & Databases
  { slug: "supabase", name: "Supabase", vendor: "Supabase", category: "Data & Databases", what: "Work with Supabase Database, Auth, Edge Functions, Realtime, Storage, and Vectors.", when: "Any task touching a Supabase project — schema, queries, RLS, functions." },
  { slug: "postgres-best-practices", name: "Postgres Best Practices", vendor: "Supabase", category: "Data & Databases", what: "Performance optimization and schema/query best practices for PostgreSQL.", when: "Writing, reviewing, or tuning Postgres queries, indexes, or schema." },
  { slug: "neon-postgres", name: "Neon Postgres", vendor: "Neon", category: "Data & Databases", what: "Provision and query serverless Postgres branches on Neon.", when: "Spinning up a database branch or running migrations against Neon." },
  // Deploy & DevOps
  { slug: "vercel-deploy", name: "Vercel Deploy", vendor: "Vercel", category: "Deploy & DevOps", what: "Deploy and manage projects on Vercel, including token-based CI deploys and promotions.", when: "Shipping a build, configuring envs, or promoting a preview to production." },
  { slug: "cloudflare-workers", name: "Cloudflare Workers", vendor: "Cloudflare", category: "Deploy & DevOps", what: "Build and deploy Workers, Durable Objects, KV, R2, and D1 on Cloudflare's edge.", when: "Authoring edge functions, stateful coordination, or edge storage." },
  { slug: "docker", name: "Docker", vendor: "community", category: "Deploy & DevOps", what: "Author Dockerfiles, compose stacks, and debug container builds and runtime.", when: "Containerizing an app or fixing a broken image/compose setup." },
  { slug: "terraform", name: "Terraform", vendor: "HashiCorp", category: "Deploy & DevOps", what: "Write and review infrastructure-as-code modules and plans.", when: "Provisioning cloud infra or reviewing a Terraform change." },
  // Observability
  { slug: "sentry-debugging", name: "Sentry Debugging", vendor: "Sentry", category: "Observability", what: "Triage errors, inspect stack traces, and upgrade the Sentry SDK across versions.", when: "Investigating an error/issue or migrating Sentry instrumentation." },
  { slug: "posthog-llm-analytics", name: "PostHog LLM Analytics", vendor: "PostHog", category: "Observability", what: "Explore LLM usage clusters, costs, traces, and experiments in PostHog.", when: "Analyzing AI/LLM traffic, cost, or experiment results." },
  { slug: "grafana-dashboards", name: "Grafana Dashboards", vendor: "community", category: "Observability", what: "Build and edit Grafana dashboards and Prometheus queries.", when: "Visualizing metrics or wiring up monitoring panels." },
  // Design
  { slug: "figma-code-connect", name: "Figma Code Connect", vendor: "Figma", category: "Design", what: "Map Figma design components to their code components for design-to-code parity.", when: "Connecting a design system component to its implementation." },
  { slug: "frontend-design", name: "Frontend Design", vendor: "community", category: "Design", what: "Apply layout, color, typography, and UI best practices to build polished interfaces.", when: "Designing or restyling a page or component from scratch." },
  // Coding
  { slug: "code-review", name: "Code Review", vendor: "community", category: "Coding", what: "Review a diff for correctness, security, and maintainability before it ships.", when: "Reviewing changes rather than implementing a feature." },
  { slug: "tdd", name: "Test-Driven Development", vendor: "community", category: "Coding", what: "Drive features with tests-first: red, green, refactor, with coverage targets.", when: "Building a feature or fixing a bug with tests written first." },
  { slug: "security-review", name: "Security Review", vendor: "community", category: "Coding", what: "Scan code for secrets, injection, SSRF, unsafe crypto, and OWASP Top 10 issues.", when: "After writing code that handles input, auth, or sensitive data." },
  { slug: "documentation-lookup", name: "Documentation Lookup", vendor: "Context7", category: "Coding", what: "Fetch current library docs and code examples instead of relying on stale training data.", when: "Using or debugging any library, framework, SDK, or API." },
  // Productivity
  { slug: "artifacts-builder", name: "Artifacts Builder", vendor: "Anthropic", category: "Productivity", what: "Build multi-component HTML artifacts with React, Tailwind, and shadcn/ui.", when: "Producing a rich interactive artifact or mini-app." },
];

export const SKILL_SLUGS = SKILL_DEFS.map((s) => s.slug);
export const SKILL_CATEGORIES = [...new Set(SKILL_DEFS.map((s) => s.category))] as SkillCat[];
export const catSlug = (c: string) => c.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export function skillBySlug(slug: string): SkillDef | undefined { return SKILL_DEFS.find((s) => s.slug === slug); }
export function categoryBySlug(s: string): SkillCat | undefined { return SKILL_CATEGORIES.find((c) => catSlug(c) === s); }

const esc = (s: string) => String(s || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" } as any)[c]);

const SKILL_CSS = `
  .sgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;margin:18px 0}
  .scard{display:block;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px;text-decoration:none;color:var(--text)}
  .scard:hover{border-color:var(--accent)}
  .scard .sn{font-weight:800;font-size:1rem}
  .scard .sv{font-size:.76rem;color:var(--muted)}
  .scard .sw{font-size:.86rem;color:var(--muted);margin-top:7px;line-height:1.45}
  .scat{display:inline-block;font-size:.74rem;color:var(--muted);background:var(--bg2);border:1px solid var(--border);border-radius:999px;padding:2px 9px;margin-top:9px}
  .catfilter{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 6px}
  .chip{background:var(--bg2);border:1px solid var(--border);color:var(--muted);border-radius:999px;padding:6px 13px;font-size:.82rem;text-decoration:none}
  .chip:hover{color:var(--text)} .chip.on{background:var(--accent);color:#2a1500;border-color:var(--accent);font-weight:700}
  .stack{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:18px 20px;margin:22px 0}
  .stack a{color:var(--accent2)}
`;

function shell(origin: string, title: string, desc: string, canonical: string, ld: any, h1: string, body: string): string {
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}"/>
<link rel="canonical" href="${canonical}"/>
<meta property="og:title" content="${esc(h1)} | wmcp.sh"/>
<meta property="og:description" content="${esc(desc)}"/>
<meta property="og:image" content="${origin}/og.png"/>
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>${uiCss(900)}${SKILL_CSS}</style></head><body>
${uiNav(origin)}
<div class="wrap">${body}</div>
</body></html>`;
}

// The shared "agent capability stack" CTA — every skill page routes to the
// trust-graded MCP leaderboard + the WebMCP/connect product (the dev funnel).
function stackCta(origin: string): string {
  return `<div class="stack">
    <div style="font-weight:800;font-size:1.05rem">Skills are one leg of the stack</div>
    <p style="color:var(--muted);font-size:.92rem;margin:6px 0 0">A skill tells your agent <i>how</i> to do something. To let it <i>act on the world</i>, pair skills with tools: <a href="${origin}/mcp/leaderboard">trust-graded MCP servers</a> (we grade every one A–F so you know it's safe to connect) and <a href="${origin}/connect">any website turned into agent tools</a> via WebMCP — no server to build.</p>
  </div>`;
}

export function skillPageHtml(origin: string, s: SkillDef): string {
  const canonical = `${origin}/skills/${s.slug}`;
  const related = SKILL_DEFS.filter((x) => x.category === s.category && x.slug !== s.slug).slice(0, 4);
  const ld = {
    "@context": "https://schema.org", "@type": "HowTo",
    name: `Use the ${s.name} agent skill`, description: s.what,
    url: canonical, publisher: { "@type": "Organization", name: "wmcp.sh", url: origin },
  };
  const title = `${s.name} — agent skill for Claude, Cursor & AI agents | wmcp.sh`;
  const desc = `${s.name} agent skill by ${s.vendor}: ${s.what} Add it to Claude, Cursor, or any agent — and pair it with trust-graded MCP servers on wmcp.sh.`;
  const body = `
  <header class="hero">
    <p class="crumbs"><a href="${origin}/skills">Agent Skills</a> <span class="sep">›</span> <a href="${origin}/skills/category/${catSlug(s.category)}">${esc(s.category)}</a></p>
    <h1>${esc(s.name)} <span style="color:var(--muted);font-weight:600;font-size:1rem">agent skill</span></h1>
    <p class="lede">${esc(s.what)}</p>
    <div class="scat">${esc(s.category)} · by ${esc(s.vendor)}</div>
  </header>
  <section style="padding-top:8px">
    <h2>What it does</h2><p>${esc(s.what)}</p>
    <h2>When your agent should use it</h2><p>${esc(s.when)}</p>
    <h2>How agent skills work</h2>
    <p class="muted" style="font-size:.92rem">An agent skill is a packaged instruction set (a <code>SKILL.md</code> + assets) that a model loads on demand when a task matches — so the agent gains a capability without bloating every prompt. Skills compose: a single agent can carry many, and invoke the right one per task.</p>
  </section>
  ${stackCta(origin)}
  ${related.length ? `<section><h2>More ${esc(s.category)} skills</h2><div class="sgrid">${related.map(skillCard.bind(null, origin)).join("")}</div></section>` : ""}
  <footer>Browse the full <a href="${origin}/skills">agent-skills directory</a> · grade an MCP server at <a href="${origin}/mcp/grade">/mcp/grade</a>.</footer>`;
  return shell(origin, title, desc, canonical, ld, `${s.name} agent skill`, body);
}

function skillCard(origin: string, s: SkillDef): string {
  return `<a class="scard" href="${origin}/skills/${s.slug}"><div class="sn">${esc(s.name)}</div><div class="sv">by ${esc(s.vendor)}</div><div class="sw">${esc(s.what)}</div><div class="scat">${esc(s.category)}</div></a>`;
}

export function skillsIndexHtml(origin: string, cat?: SkillCat): string {
  const active = cat && SKILL_CATEGORIES.includes(cat) ? cat : undefined;
  const pool = active ? SKILL_DEFS.filter((s) => s.category === active) : SKILL_DEFS;
  const canonical = active ? `${origin}/skills/category/${catSlug(active)}` : `${origin}/skills`;
  const h1 = active ? `${active} agent skills` : `Agent Skills directory`;
  const title = active
    ? `${active} agent skills for Claude, Cursor & AI agents | wmcp.sh`
    : `Agent Skills directory — skills for Claude, Cursor & AI agents | wmcp.sh`;
  const desc = active
    ? `Discover ${active} agent skills — what each does and when to use it, for Claude, Cursor, and any AI agent. Pair them with trust-graded MCP servers on wmcp.sh.`
    : `An open directory of agent skills for Claude, Cursor, and AI agents — documents, browser, databases, deploy, observability, design, and coding. Pair them with trust-graded MCP servers and any-website WebMCP tools.`;
  const chips = `<div class="catfilter"><a class="chip${active ? "" : " on"}" href="${origin}/skills">All</a>${SKILL_CATEGORIES.map((c) => `<a class="chip${active === c ? " on" : ""}" href="${origin}/skills/category/${catSlug(c)}">${esc(c)}</a>`).join("")}</div>`;
  const ld = {
    "@context": "https://schema.org", "@type": "CollectionPage",
    name: h1, description: desc, url: canonical,
    isPartOf: { "@type": "WebSite", name: "wmcp.sh", url: origin },
  };
  const body = `
  <header class="hero">
    <p class="crumbs"><a href="${origin}/connect">The MCP hub</a> <span class="sep">›</span> ${active ? `<a href="${origin}/skills">Agent Skills</a> <span class="sep">›</span> ${esc(active)}` : "Agent Skills"}</p>
    <h1>${esc(h1)}</h1>
    <p class="lede">${active ? `${esc(active)} skills give your agent new capabilities — here's what each does and when to use it.` : `Skills give an agent know-how; MCP servers and WebMCP give it tools. This is the skills half — browse by category, then wire up the tools.`}</p>
  </header>
  ${chips}
  <section style="padding-top:8px"><div class="sgrid">${pool.map(skillCard.bind(null, origin)).join("")}</div></section>
  ${stackCta(origin)}
  <footer>${SKILL_DEFS.length} skills · paired with <a href="${origin}/mcp/leaderboard">${"the trust leaderboard"}</a> + <a href="${origin}/connect">WebMCP</a>.</footer>`;
  return shell(origin, title, desc, canonical, ld, h1, body);
}
