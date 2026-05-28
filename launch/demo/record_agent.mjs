// record_agent.mjs — records the agent-demo HTML page (demo.html).
//
// The demo page makes a REAL fetch to https://wmcp.sh/api/v1/tools and
// renders the actual response inside a Claude.ai-style chat UI. We open
// it via a local Python http.server, run window.__demo() (the scripted
// session), record the whole thing, then encode to MP4.
//
// Run:
//   npm run record:agent
// Or manually:
//   node record_agent.mjs

import { chromium } from "playwright";
import { mkdir, rm, readdir, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";

const VIEWPORT = { width: 1280, height: 800 };
const OUT_DIR = "./out";
const PORT = 8763;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function serveDir() {
  // Spawn a Python http.server for the demo file.
  // Background process — killed at the end.
  const p = spawn("python3", ["-m", "http.server", String(PORT)], {
    stdio: ["ignore", "ignore", "pipe"],
    detached: false,
  });
  // Wait a beat for it to bind.
  await sleep(500);
  return p;
}

async function recordVideo() {
  if (existsSync(OUT_DIR)) {
    await rm(OUT_DIR, { recursive: true });
  }
  await mkdir(OUT_DIR, { recursive: true });

  const server = await serveDir();

  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: VIEWPORT,
      recordVideo: { dir: OUT_DIR, size: VIEWPORT },
      deviceScaleFactor: 2,
      colorScheme: "dark",
    });
    const page = await context.newPage();

    // Open the demo page from the local server (NOT file://) so fetch
    // to wmcp.sh works without CORS / file-scheme weirdness.
    await page.goto(`http://localhost:${PORT}/demo.html`, {
      waitUntil: "domcontentloaded",
    });

    // Give the page a beat to lay out + start at top
    await sleep(900);

    // Drive the scripted session. The HTML defines window.__demo() that
    // returns a promise resolved when the whole session is on screen.
    await page.evaluate(async () => {
      await window.__demo();
    });

    // Hold final frame for ~1.5s so the answer can be read on replay
    await sleep(1500);

    // Close context to flush video to disk
    await context.close();
    await browser.close();

    const entries = await readdir(OUT_DIR);
    const webm = entries.find((f) => f.endsWith(".webm"));
    if (!webm) {
      console.error("× no .webm produced");
      process.exit(1);
    }
    await rename(join(OUT_DIR, webm), join(OUT_DIR, "wmcp-agent-demo.webm"));
    console.log(`✓ recorded → ${join(OUT_DIR, "wmcp-agent-demo.webm")}`);
  } finally {
    // Clean up the http.server we spawned
    try { server.kill("SIGTERM"); } catch {}
  }
}

await recordVideo();
