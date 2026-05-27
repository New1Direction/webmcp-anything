// /agent-ready/saas — SERP target: "saas agent ready", "ai-ready saas",
// "saas agent commerce", "agent economy saas", "ai shopping saas",
// "make my saas claude friendly", "saas mcp", "saas chatgpt integration".
//
// Audience: SaaS founders / GTM teams (not engineering deep-dive — that's
// /agent-ready/api). Focus: how agents recommend, sign up, and use SaaS.

import { agentReadyVerticalHtml } from "./agent_ready_chrome";

export function agentReadySaasHtml(origin: string): string {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "I run a SaaS — what does 'agent-ready' even mean for me?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Three things, in order of revenue impact. (1) Recommendability: when someone asks Claude 'what's the best CRM for a 5-person startup', does your product show up — or only Salesforce and HubSpot? (2) Signupability: when an agent tries to create a trial account on your behalf, does the flow complete or hit a CAPTCHA wall? (3) Usability via tools: once a customer signs up, can their agent actually USE your product through an MCP server, or are you read-only / dashboard-only? Most SaaS today fails on (1) and (2). The third only matters once you have agent-savvy customers.",
        },
      },
      {
        "@type": "Question",
        name: "How do agents decide which SaaS to recommend?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Same way humans do — comparison pages, reviews, social proof, brand recognition — plus three things agents see better than humans: (a) structured pricing data (JSON-LD <code>Offer</code> + <code>PriceSpecification</code> on your pricing page), (b) comparison-friendly landing pages that explicitly position vs named competitors, (c) presence in agent-friendly directories. If your pricing is a Figma-style image with no machine-readable structure, an agent comparing 5 SaaS options literally can't see your number.",
        },
      },
      {
        "@type": "Question",
        name: "Can AI agents really sign up for my SaaS on a user's behalf?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes — and increasingly do. Anthropic Computer Use, OpenAI Operator, and Cursor's autonomous mode can drive a browser, fill forms, complete signups. The catch: most SaaS sign-up flows fail one of these steps: hCaptcha / reCAPTCHA (agents fail), email-verification with a magic link from a non-aliased inbox (agents can't read the user's email), phone verification (agents don't have a phone). Make any of these steps optional or proxied through the user's agent runtime if you want agent-driven signup volume.",
        },
      },
      {
        "@type": "Question",
        name: "Do agents actually buy SaaS, or just research?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Both, increasingly. Reports of agents completing $100-$500 SaaS purchases on team cards autonomously are accelerating in 2026. For now: most agent volume is research (comparing options, summarizing pricing, building shortlists for the human to decide). But the comparison itself is the funnel — being recommendable is worth more than being purchasable directly because the user follows the agent's shortlist.",
        },
      },
      {
        "@type": "Question",
        name: "How do I become 'recommendable' to agents?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Five tactical moves: (1) ship JSON-LD <code>SoftwareApplication</code> + <code>Offer</code> + <code>AggregateRating</code> on your homepage and pricing page; (2) write comparison pages (vs Notion, vs Linear, vs Asana) — agents pull these into context when asked 'X vs Y'; (3) get listed in directories agents query (Product Hunt with structured data, G2 with API access, the wmcp.sh /directory); (4) publish a public roadmap + changelog at stable URLs — agents prefer products with visible momentum; (5) ship clean docs (see /agent-ready/docs) — agents won't recommend products whose docs they can't read.",
        },
      },
      {
        "@type": "Question",
        name: "What's WebMCP for a SaaS product specifically?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "WebMCP on a SaaS means: your pricing page exposes machine-readable Offer schema, your sign-up form is annotated so agents know which fields to fill, your dashboard's key actions (create project, invite member, generate API key) are exposed as MCP tools your customers' agents can call. Most SaaS won't ship all of this — but the first two (pricing schema + signup form markup) are cheap, high-leverage. The third (dashboard MCP) is for SaaS where developer / dev-tool customers actively use agents.",
        },
      },
      {
        "@type": "Question",
        name: "What's the ROI on this? My product manager is asking.",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Honestly: hard to measure cleanly today. Agent traffic shows up as 'Direct' or user-agent-spoofed in your analytics. The closest measurable proxy: track sign-ups initiated from your AI-comparison-page traffic vs your generic pricing page over 90 days. The truthful answer is: this is a 2026 bet that 2027-2028 makes obvious in conversion data. The companies setting it up now will look prescient when the data lands. The cost is ~$500 - $2k of one-time work for the cornerstone moves — small bet for a multi-year upside.",
        },
      },
    ],
  };

  const bodyHtml = `
<!-- ========== Why ========== -->
<section id="why">
  <div class="section-label">The new buyer in your funnel</div>
  <h2>Agents are reading your landing page before humans do.</h2>
  <p class="section-sub">A developer at 9am: "Claude, what's a good Stripe alternative for marketplace payments?" Claude pulls in 4 SaaS pricing pages, ranks them by margin + Stripe Connect support + reviews, hands the user a shortlist. The user picks one. If your product isn't legible to that opening pull, you're not in the shortlist. The buyer's first 30 seconds are now an agent's first 30 seconds, and it's a different SEO game.</p>
</section>

<!-- ========== Diagnosis ========== -->
<section id="diagnosis">
  <div class="section-label">5 things SaaS sites miss</div>
  <h2>The SaaS agent-readiness diagnostic.</h2>

  <div class="reason-card">
    <span class="num">1</span>
    <h3>Pricing isn't machine-readable</h3>
    <p>Your pricing page is a beautiful three-column layout with image-rendered numbers, no JSON-LD <code>Offer</code> schema. When an agent compares 5 products for a user, it has to either OCR your image or skip you.</p>
    <p class="verdict">→ Agent compares 5 products. Yours is "price not detected". Skipped from the shortlist.</p>
    <p class="fix"><strong>Fix:</strong> Add JSON-LD <code>SoftwareApplication</code> + <code>Offer</code> + <code>PriceSpecification</code> on your pricing page. Five lines per tier. Doesn't change visual design, just adds an agent-readable layer underneath.</p>
  </div>

  <div class="reason-card">
    <span class="num">2</span>
    <h3>No comparison pages — you're invisible in "X vs Y" queries</h3>
    <p>When a user asks an agent "Notion vs Linear vs ClickUp", the agent pulls in pages that directly address that comparison. If you don't have a "vs &lt;Top Competitor&gt;" page, you're not in the result.</p>
    <p class="verdict">→ Agent recommends 3 of your competitors. None of them is you because you have no comparison page.</p>
    <p class="fix"><strong>Fix:</strong> Ship at least one comparison page per top competitor. Honest framing ("here's where we win, here's where they win, here's who should use which"). Agents reward truthful comparisons; they down-rank fluff-only pages.</p>
  </div>

  <div class="reason-card">
    <span class="num">3</span>
    <h3>Sign-up flow blocks agent-driven signups</h3>
    <p>hCaptcha, reCAPTCHA, email magic-link verification with non-aliased inboxes, phone verification — every one of these breaks agent-driven trial signups. Anthropic Computer Use and OpenAI Operator can technically pass some CAPTCHAs but trust degrades fast.</p>
    <p class="verdict">→ Agent tries to create a trial. Hits CAPTCHA. Escalates to user. User abandons.</p>
    <p class="fix"><strong>Fix:</strong> Make CAPTCHAs adaptive (skip for low-risk signal patterns). Support email-aliased signups (user@anything.team.com). Make phone verification optional — gate it behind paid plans, not free trial. Or offer an explicit "I'm an AI agent acting on behalf of a user" signup path that takes a verified user token instead of CAPTCHA.</p>
  </div>

  <div class="reason-card">
    <span class="num">4</span>
    <h3>No agent-discoverable directory presence</h3>
    <p>Product Hunt, G2, Capterra, Crunchbase — agents query these. If you're not listed (or your listing is sparse), you're missing from a meaningful share of agent-driven recommendation flows.</p>
    <p class="verdict">→ Agent asks "what are the top 10 X tools" and queries G2. You're #43 with 12 reviews. Skipped.</p>
    <p class="fix"><strong>Fix:</strong> Get listed everywhere with structured data — G2, Capterra, Product Hunt, AlternativeTo, and emerging agent-specific directories (wmcp.sh /directory). Encourage reviews from real users with explicit ask-for-review automation.</p>
  </div>

  <div class="reason-card">
    <span class="num">5</span>
    <h3>No public roadmap / changelog — agents prefer momentum</h3>
    <p>When agents (or the LLMs behind them) rank tools, "is this product actively developed" is a meaningful signal. A 6-month-old "last updated" date kills your ranking. A public roadmap at a stable URL signals you're alive and growing.</p>
    <p class="verdict">→ Agent compares your product to a 6-month-old article that doesn't show your recent shipping. Treats you as stale.</p>
    <p class="fix"><strong>Fix:</strong> Public changelog at <code>/changelog</code> with structured entries (date, version, summary). Public roadmap at <code>/roadmap</code>. Mark them up with JSON-LD <code>BlogPosting</code> + <code>datePublished</code>. Agents pull recent dates into their context.</p>
  </div>
</section>

<!-- ========== Fix ========== -->
<section id="fix">
  <div class="section-label">The fix — non-technical</div>
  <h2>Six things any founder can ship this week.</h2>

  <div class="fix-grid">
    <div class="fix-card">
      <h3>1. JSON-LD pricing</h3>
      <p class="body">5 lines per tier on your pricing page. Most landing-page builders (Webflow, Framer, Wix) have a plug-in.</p>
    </div>
    <div class="fix-card">
      <h3>2. Comparison pages</h3>
      <p class="body">One "vs &lt;top competitor&gt;" page. Honest framing. 2 hours.</p>
    </div>
    <div class="fix-card">
      <h3>3. Aliased-email signup</h3>
      <p class="body">Accept <code>+aliases</code> and team-domain aliases. Lower CAPTCHA on low-risk signals.</p>
    </div>
    <div class="fix-card">
      <h3>4. Public changelog</h3>
      <p class="body"><code>/changelog</code> with dates. Signals momentum. 1 hour to set up + ongoing 5 min/release.</p>
    </div>
    <div class="fix-card">
      <h3>5. Directory listings</h3>
      <p class="body">G2, Capterra, Product Hunt, wmcp.sh /directory. Free or low-cost. Half a day of work.</p>
    </div>
    <div class="fix-card">
      <h3>6. AggregateRating schema</h3>
      <p class="body">If you have reviews, mark them up. Agents compare ratings across products.</p>
    </div>
  </div>

  <div class="checklist">
    <h3>10-minute SaaS founder checklist</h3>
    <div class="row"><span class="mark">→</span><span>Open your pricing page in Chrome → View source → search <code>application/ld+json</code>. If no Offer schema, fix #1.</span></div>
    <div class="row"><span class="mark">→</span><span>Google "&lt;your-product&gt; vs &lt;top-competitor&gt;". If your own comparison page isn't on page 1, write one. Agents look there first.</span></div>
    <div class="row"><span class="mark">→</span><span>Try to sign up for your own trial using <code>founder+test@yourdomain.com</code>. If rejected as invalid, fix #3.</span></div>
    <div class="row"><span class="mark">→</span><span>Ask Claude: "Compare my-product vs &lt;competitor&gt;". Does the answer cite your real features + pricing or hallucinate? If hallucinate, you need #1 + #2.</span></div>
    <div class="row"><span class="mark">→</span><span>Submit to <a href="/directory" style="color:var(--accent2);text-decoration:none">wmcp.sh/directory</a> — agent-discoverable directory.</span></div>
  </div>
</section>

<!-- ========== Two paths ========== -->
<section id="paths">
  <div class="section-label">Two ways forward</div>
  <h2>DIY checklist or done-for-you.</h2>

  <div class="path-grid">
    <div class="path diy">
      <div class="price">Free · ~half a day</div>
      <h3>Ship the cornerstone six yourself</h3>
      <p class="desc">Every item in the fix list is non-technical. A founder + a marketer can ship all six in a half-day with no engineering tickets.</p>
      <ul>
        <li>JSON-LD on pricing + landing — copy-paste from templates</li>
        <li>One comparison page (steal the format from your competitor's comparison page)</li>
        <li>Public changelog (Notion-public works as v0)</li>
        <li>Directory listings — half a day of forms</li>
      </ul>
      <a class="cta" href="/dashboard">Get the checklist →</a>
    </div>

    <div class="path featured">
      <div class="price">$499+ · 5-day delivery</div>
      <h3>Managed: agent-ready SaaS landing</h3>
      <p class="desc">We audit your funnel, ship JSON-LD across pricing + landing + comparison pages, write your top "vs competitor" pages, set up your changelog, get you listed in the directories agents query.</p>
      <ul>
        <li>Pricing page JSON-LD on every tier</li>
        <li>SoftwareApplication + AggregateRating schema</li>
        <li>2-3 comparison pages with honest framing</li>
        <li>G2 / Capterra / Product Hunt listing optimization</li>
        <li>Public changelog setup + first 5 entries written</li>
        <li>Sign-up flow audit + CAPTCHA / email rules adjusted</li>
      </ul>
      <a class="cta" href="/managed#contact">Get audit →</a>
    </div>
  </div>
</section>

<!-- ========== FAQ ========== -->
<section id="faq">
  <div class="section-label">FAQ</div>
  <h2>Common questions from SaaS founders.</h2>

  <details><summary>I run a SaaS — what does "agent-ready" even mean for me?</summary>
  <div class="answer">Three things ranked by revenue impact: (1) Recommendability — when someone asks Claude "best CRM for 5-person startup", does your product show up? (2) Signupability — does your trial flow complete when an agent tries on a user's behalf? (3) Usability via tools — can the customer's agent use your product through an MCP server? Most SaaS fails (1) and (2). (3) matters only with agent-savvy customers.</div>
  </details>

  <details><summary>How do agents decide which SaaS to recommend?</summary>
  <div class="answer">Comparison pages, reviews, social proof, brand. Plus three things agents see better: (a) structured pricing (JSON-LD Offer), (b) comparison pages with named competitors, (c) presence in agent-friendly directories. Pricing as Figma image with no machine-readable data = invisible to agents.</div>
  </details>

  <details><summary>Can AI agents really sign up for my SaaS on a user's behalf?</summary>
  <div class="answer">Yes — Computer Use, Operator, Cursor autonomous can drive a browser. Catches: hCaptcha / reCAPTCHA, email-magic-link with non-aliased inbox, phone verification. Make these optional or proxy through the user's agent runtime for agent-driven signup volume.</div>
  </details>

  <details><summary>Do agents actually buy SaaS, or just research?</summary>
  <div class="answer">Both, increasingly. $100-$500 autonomous SaaS purchases on team cards reported in 2026. Most volume today is research (compare, summarize, shortlist). Being recommendable matters more than being directly purchasable because the user follows the agent's shortlist.</div>
  </details>

  <details><summary>How do I become "recommendable" to agents?</summary>
  <div class="answer">Five moves: JSON-LD SoftwareApplication + Offer + AggregateRating; comparison pages vs top competitors; directory listings (G2, Capterra, Product Hunt, wmcp.sh /directory); public roadmap + changelog; clean docs (see <a href="/agent-ready/docs" style="color:var(--accent2);text-decoration:none">/agent-ready/docs</a>).</div>
  </details>

  <details><summary>What's WebMCP for a SaaS product?</summary>
  <div class="answer">Pricing page with machine-readable Offer schema, sign-up form annotated for agent filling, dashboard key actions (create project, invite member, generate API key) exposed as MCP tools. Most SaaS won't ship all of this — first two are cheap and high-leverage; third matters only if your customers use agents.</div>
  </details>

  <details><summary>What's the ROI on this? My PM is asking.</summary>
  <div class="answer">Hard to measure cleanly today. Agent traffic shows as "Direct" or spoofed in your analytics. Closest proxy: track sign-ups from AI-comparison-page traffic vs generic pricing page over 90 days. This is a 2026 bet that 2027-2028 makes obvious in conversion data. Cost: ~$500-$2k of one-time work. Small bet for multi-year upside.</div>
  </details>
</section>

<!-- ========== Related ========== -->
<section id="related">
  <div class="section-label">More verticals</div>
  <h2>Other agent-readiness guides.</h2>
  <p class="section-sub">
    <a href="/agent-ready" style="color:var(--accent2);text-decoration:none">/agent-ready</a> (cornerstone) ·
    <a href="/agent-ready/shopify" style="color:var(--accent2);text-decoration:none">/agent-ready/shopify</a> ·
    <a href="/agent-ready/api" style="color:var(--accent2);text-decoration:none">/agent-ready/api</a> ·
    <a href="/agent-ready/docs" style="color:var(--accent2);text-decoration:none">/agent-ready/docs</a> ·
    <a href="/managed" style="color:var(--accent2);text-decoration:none">/managed</a>
  </p>
</section>
`;

  return agentReadyVerticalHtml({
    origin,
    pageTitle: "Make your SaaS agent-ready — be recommendable, signupable, usable | wmcp.sh",
    metaDescription:
      "When agents like Claude pick which SaaS to recommend, do they see your pricing, comparisons, and reviews? The 5 reasons SaaS products are invisible to agents + the founder-doable fix.",
    canonicalPath: "/agent-ready/saas",
    ogTitle: "Make your SaaS agent-ready",
    ogDescription: "5 reasons agents skip your product + the founder-doable fix. Recommendability, signupability, usability.",
    twitterTitle: "SaaS agent-readiness — wmcp.sh",
    twitterDescription: "Be recommendable when Claude picks SaaS for your buyer. 5 things to ship.",
    articleHeadline: "How to make your SaaS agent-ready",
    articleDescription:
      "Five reasons SaaS products are invisible to AI agents picking tools on behalf of buyers, and the six-step fix any founder can ship in half a day.",
    faqJsonLd,
    heroBadge: "agent-ready · saas",
    heroH1: "Show up when agents pick your category.",
    heroSubtitle:
      "When someone asks Claude or Cursor 'what's the best tool for X', the agent pulls in 5 pricing pages, 3 reviews, and 2 comparisons — then ranks. If your pricing is an image, your comparison pages don't exist, and your changelog is 6 months old, you're not in the shortlist. Five reasons agents skip SaaS products, plus the six-step fix any founder can ship this week.",
    heroHint: "Six things, ~half a day of work, zero engineering tickets required.",
    bodyHtml,
  });
}
