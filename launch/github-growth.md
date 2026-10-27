# GitHub adoption plan — earn stars by being useful

Baseline taken October 27, 2026 from GitHub public metadata:
- webmachinelearning/webmcp (specification): about 4,759 stars
- MiguelsPizza/WebMCP (MCP-B): about 1,109
- GoogleChromeLabs/webmcp-tools: about 723
- New1Direction/webmcp-anything: 8

Stars change and this is not a forecast. Competing directly with a widely cited official specification is substantially harder than leading a practical toolkit niche.

## Positioning: a working, trustworthy developer toolkit

Don't compete on "we implement WebMCP" alone. The browser specification is becoming standard platform infrastructure, and major vendors are shipping site integration. Win by reducing a developer's path from **URL / site → visible tools → tested agent workflow → secure execution**.

Three differentiated capabilities with independent evidence:
1. Read-only URL-to-MCP discovery across supported public sites, plus the fully working CLI.
2. First-party native WebMCP page example, explicit about lack of support in unenabled browsers.
3. Independent MCP trust grading and observable schema drift checks. Grades are never purchased and do not certify a server.

Native browser↔remote MCP relay is **not** an existing capability. Keep it on a separate security-reviewed release track.

## Product milestones (not promises)

**10 → 100 stars:** land PR #76 (CLI, native demo, honest setup), merge only after all CI and manual checks; add exact screencast showing setup in a clean repository clone; link from README; publish a technical explanation rather than asking for stars up front.

**100 → 1,000 stars:** collect 10 independently reproducible adapters or compatibility improvements from outside contributors; label easy issues, respond to reproducible bugs, keep the quickstart passing, add a changelog with real release artifacts.

**1,000 → 5,000+ stars:** become the genuinely recommended toolkit for users needing both backend URL→MCP adapters and native browser interoperability. That requires production-grade consent, session isolation, meaningful benchmark evidence and strong maintenance—not just a large README.

## What to measure

Weekly from GitHub: new stars (not purchased), unique contributors, merged external PRs, open bug age, demo/quickstart success, issue-to-fix cycle time. From hosted operations: public URL preview success/failure by adapter class, signups, paid activations and refunds. Never expose individual visitor identities or secrets for growth tracking.

The real proof is **independent projects adopting the toolkit and linking back to it**. GitHub stars are a proxy, not an end-user outcome.

## Distribution checklist

- Add the repository's missing **webmcp** topic via GitHub's About → Topics editor. It currently has broader MCP tags but no exact webmcp topic. Suggested additional applicable tags: browser-agents, model-context-protocol. Do not spam unrelated tags.
- Create a short, factual before/after video showing a URL recognized, an MCP tools/list response, and a task completed only when execution permissions actually allow it.
- After a CI-green, published release, submit a useful, accurate entry to curated WebMCP resources (e.g. webmachinelearning/awesome-webmcp) that accept third-party projects; follow each project's contribution rules and disclose affiliation.
- Offer a reproducible issue/PR with fixes to upstream tools when genuinely relevant. Don't inject unrelated promotional links.
- Write one technical note per solved problem: why REST is not MCP, browser-native vs backend tools, native permission boundaries, MCP drift verification, public-cache privacy.
- Share specific demos with relevant developer communities **where self-promotion is allowed**, and respond to feedback. No fake stars, star exchanges, bought traffic, bot accounts or spam outreach.

## Release gate

PR #76: Node CLI and browser-demo tests; current worker CI; verify docs URLs and a genuine public endpoint manually. PR #75: separate browser/production feature, requires explicit integration and payments acceptance testing. Do not advertise merged or deployed capabilities before they are.

If the CLI will be distributed via npm later, publish only after checking name ownership, version, provenance, license, package contents, release security and that npm install actually works. Do not claim a nonexistent package is available.
