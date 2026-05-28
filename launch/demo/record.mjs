// record.mjs — produces a ~25s WebM walkthrough of wmcp.sh's
// agent-ready / price-data / managed surface.
//
// Run from <repo>/launch/demo:
//   npm install playwright
//   node record.mjs
//
// Output:
//   ./out/wmcp-demo.webm  (Playwright native)
//   ./out/wmcp-demo.mp4   (after ffmpeg pass — call ffmpeg separately)
//
// Knobs at the top: VIEWPORT, BASE, SCROLL_SPEED, etc.

import { chromium } from "playwright";
import { mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://wmcp.sh";
const OUT_DIR = "./out";
const VIEWPORT = { width: 1280, height: 720 };
const SCROLL_PX_PER_SEC = 350;

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Smooth-scroll the page by `pixels` over `durationMs`.
async function smoothScroll(page, pixels, durationMs) {
  const steps = Math.max(30, Math.floor(durationMs / 16));
  const dy = pixels / steps;
  const dt = durationMs / steps;
  for (let i = 0; i < steps; i++) {
    await page.evaluate((y) => window.scrollBy(0, y), dy);
    await sleep(dt);
  }
}

// Inject a fixed-position caption pill at the bottom of the page.
// Fades in, holds for `holdMs`, fades out, removes. Returns AFTER
// the fade-out completes so callers can sequence scenes cleanly.
// Twitter / X auto-plays video muted, so we need on-screen labels
// for the demo to communicate without audio.
async function caption(page, text, holdMs = 4000) {
  // Wrapped — captions are visual sugar. If a navigation kills the
  // execution context mid-fade, swallow the error rather than crash
  // the whole recording.
  const safe = async (fn) => {
    try { await fn(); } catch { /* navigation killed us, fine */ }
  };
  await safe(() => page.evaluate(({ text }) => {
    document.querySelectorAll(".__wmcp_cap__").forEach((el) => el.remove());
    const div = document.createElement("div");
    div.className = "__wmcp_cap__";
    div.textContent = text;
    Object.assign(div.style, {
      position: "fixed",
      bottom: "32px",
      left: "50%",
      transform: "translateX(-50%) translateY(20px)",
      background: "rgba(20,20,30,0.92)",
      color: "#fff",
      border: "1px solid rgba(124,92,255,.45)",
      borderRadius: "999px",
      padding: "11px 22px",
      font: '600 16px -apple-system,Inter,sans-serif',
      letterSpacing: "0.005em",
      boxShadow: "0 8px 32px rgba(0,0,0,.5)",
      zIndex: "999999",
      opacity: "0",
      transition: "opacity .4s ease, transform .4s ease",
      pointerEvents: "none",
    });
    document.body.appendChild(div);
    requestAnimationFrame(() => {
      div.style.opacity = "1";
      div.style.transform = "translateX(-50%) translateY(0)";
    });
  }, { text }));
  await sleep(holdMs);
  await safe(() => page.evaluate(() => {
    const cap = document.querySelector(".__wmcp_cap__");
    if (cap) {
      cap.style.opacity = "0";
      cap.style.transform = "translateX(-50%) translateY(20px)";
    }
  }));
  await sleep(500);
  await safe(() => page.evaluate(() => {
    document.querySelectorAll(".__wmcp_cap__").forEach((el) => el.remove());
  }));
}

// Full-screen title card overlay — used at start + end.
async function titleCard(page, title, subtitle, holdMs = 2200) {
  await page.evaluate(({ title, subtitle }) => {
    document.querySelectorAll(".__wmcp_title__").forEach((el) => el.remove());
    const wrap = document.createElement("div");
    wrap.className = "__wmcp_title__";
    Object.assign(wrap.style, {
      position: "fixed",
      inset: "0",
      background:
        "radial-gradient(ellipse 800px 500px at 50% 50%, rgba(124,92,255,0.25), transparent 70%), #07070d",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "1000000",
      opacity: "0",
      transition: "opacity .35s ease",
      font: "-apple-system,Inter,sans-serif",
    });
    const h = document.createElement("div");
    h.textContent = title;
    Object.assign(h.style, {
      fontSize: "64px",
      fontWeight: "800",
      letterSpacing: "-0.025em",
      background: "linear-gradient(135deg, #fff 30%, #00e5ff 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      marginBottom: "16px",
    });
    const s = document.createElement("div");
    s.textContent = subtitle;
    Object.assign(s.style, {
      fontSize: "20px",
      color: "#8a8aa8",
      fontWeight: "500",
      maxWidth: "640px",
      textAlign: "center",
      lineHeight: "1.45",
    });
    wrap.appendChild(h);
    wrap.appendChild(s);
    document.body.appendChild(wrap);
    requestAnimationFrame(() => {
      wrap.style.opacity = "1";
    });
  }, { title, subtitle });
  await sleep(holdMs);
  await page.evaluate(() => {
    const t = document.querySelector(".__wmcp_title__");
    if (t) {
      t.style.opacity = "0";
    }
  });
  await sleep(400);
  await page.evaluate(() => {
    document.querySelectorAll(".__wmcp_title__").forEach((el) => el.remove());
  });
}

async function recordVideo() {
  if (existsSync(OUT_DIR)) {
    await rm(OUT_DIR, { recursive: true });
  }
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    recordVideo: {
      dir: OUT_DIR,
      size: VIEWPORT,
    },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  const page = await context.newPage();

  // ─── Title card (2.5s) ───
  // Use about:blank for the title card so we control the styling fully.
  await page.goto("about:blank");
  // about:blank gives us a clean dark canvas. Title fades over it.
  await page.evaluate(() => {
    document.documentElement.style.background = "#07070d";
    document.body.style.background = "#07070d";
    document.body.style.margin = "0";
    document.body.style.minHeight = "100vh";
  });
  await titleCard(
    page,
    "wmcp.sh",
    "Turn any URL into MCP tools your agent can call.",
    2500
  );

  // ─── Scene 1: cornerstone /agent-ready (8s) ───
  await page.goto(`${BASE}/agent-ready`, { waitUntil: "domcontentloaded" });
  await sleep(700);
  caption(page, "5 reasons agents can't read your site", 6500);
  await smoothScroll(page, 1200, 5500);
  await sleep(800);

  // ─── Scene 2: /price-data (7s) ───
  await page.goto(`${BASE}/price-data`, { waitUntil: "domcontentloaded" });
  await sleep(700);
  caption(page, "Free price-data adapters (CoinGecko, Pyth, Chainlink…)", 5500);
  await smoothScroll(page, 1500, 5000);
  await sleep(600);

  // ─── Scene 3: a vertical — /agent-ready/shopify (6s) ───
  await page.goto(`${BASE}/agent-ready/shopify`, {
    waitUntil: "domcontentloaded",
  });
  await sleep(700);
  caption(page, "Vertical guides: Shopify, API, docs, SaaS", 5000);
  await smoothScroll(page, 1400, 4500);
  await sleep(500);

  // ─── Scene 4: live API call (the wow) (5s) ───
  await page.goto(
    `${BASE}/api/v1/tools?url=https://api.coingecko.com/api/v3`,
    { waitUntil: "domcontentloaded" }
  );
  await sleep(700);
  caption(page, "Real /api/v1/tools call → real MCP tools", 4500);
  await sleep(2000);
  await smoothScroll(page, 600, 2000);

  // ─── Scene 5: /managed (4s) ───
  await page.goto(`${BASE}/managed`, { waitUntil: "domcontentloaded" });
  await sleep(700);
  caption(page, "Done-for-you agent-readiness — from $499", 3800);
  await smoothScroll(page, 900, 2500);

  await sleep(500);

  // ─── End card (3s) — CTA ───
  await page.goto("about:blank");
  await page.evaluate(() => {
    document.documentElement.style.background = "#07070d";
    document.body.style.background = "#07070d";
    document.body.style.margin = "0";
    document.body.style.minHeight = "100vh";
  });
  await titleCard(
    page,
    "wmcp.sh",
    "Drop a URL. Get MCP tools. Free.\nhttps://wmcp.sh/agent-ready",
    3000
  );

  // CRITICAL: closeContext() flushes video to disk
  await context.close();
  await browser.close();

  // The recorded video gets a random filename — rename to wmcp-demo.webm
  const fs = await import("node:fs/promises");
  const entries = await fs.readdir(OUT_DIR);
  const webm = entries.find((f) => f.endsWith(".webm"));
  if (webm) {
    await fs.rename(join(OUT_DIR, webm), join(OUT_DIR, "wmcp-demo.webm"));
    console.log(`✓ recorded → ${join(OUT_DIR, "wmcp-demo.webm")}`);
  } else {
    console.error("× no .webm found in", OUT_DIR);
    process.exit(1);
  }
}

await recordVideo();
