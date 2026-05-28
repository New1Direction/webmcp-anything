// record_all.mjs — drive each demo*.html through Playwright + record video.
//
// Each demo HTML exposes window.__demo() which returns a promise once the
// scripted session is fully on-screen. We open the page, run __demo(),
// hold a beat, close — Playwright flushes the WebM to disk.
//
// Run:  node record_all.mjs              (records all)
//       node record_all.mjs claude-code  (records just one by suffix)

import { chromium } from "playwright";
import { mkdir, rm, readdir, rename, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { join } from "node:path";

const OUT_DIR = "./out";
const PORT = 8763;

// Each entry: html filename → output basename + viewport
const DEMOS = [
  { id: "agent",        html: "demo.html",             viewport: { width: 1280, height: 800 } },
  { id: "claude-code",  html: "demo-claude-code.html", viewport: { width: 1280, height: 760 } },
  { id: "codex",        html: "demo-codex.html",       viewport: { width: 1400, height: 820 } },
  { id: "grok",         html: "demo-grok.html",        viewport: { width: 1400, height: 820 } },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function serveDir() {
  const p = spawn("python3", ["-m", "http.server", String(PORT)], {
    stdio: ["ignore", "ignore", "pipe"],
  });
  await sleep(600);
  return p;
}

async function recordOne(demo) {
  // Per-demo subdir so Playwright doesn't collide filenames
  const tmpDir = `${OUT_DIR}/__tmp_${demo.id}`;
  if (existsSync(tmpDir)) await rm(tmpDir, { recursive: true });
  await mkdir(tmpDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: demo.viewport,
    recordVideo: { dir: tmpDir, size: demo.viewport },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  const page = await context.newPage();
  // Surface JS console errors so we can debug
  page.on("pageerror", (e) => console.error(`[${demo.id}] page error:`, e.message));

  await page.goto(`http://localhost:${PORT}/${demo.html}`, {
    waitUntil: "domcontentloaded",
  });
  await sleep(800);

  await page.evaluate(async () => {
    if (typeof window.__demo === "function") {
      await window.__demo();
    } else {
      throw new Error("window.__demo() not defined on page");
    }
  });
  await sleep(1500); // hold final frame

  await context.close();
  await browser.close();

  // Rename the produced .webm to wmcp-<id>.webm
  const entries = await readdir(tmpDir);
  const webm = entries.find((f) => f.endsWith(".webm"));
  if (!webm) {
    console.error(`× no .webm for ${demo.id}`);
    return null;
  }
  const finalPath = join(OUT_DIR, `wmcp-${demo.id}.webm`);
  await rename(join(tmpDir, webm), finalPath);
  await rm(tmpDir, { recursive: true });
  const st = await stat(finalPath);
  console.log(`✓ ${demo.id.padEnd(14)} ${finalPath}  (${(st.size / 1024).toFixed(0)} KB)`);
  return finalPath;
}

async function main() {
  const arg = process.argv[2];
  const targets = arg ? DEMOS.filter((d) => d.id === arg) : DEMOS;
  if (!targets.length) {
    console.error(`× no demo matches '${arg}'. Valid: ${DEMOS.map((d) => d.id).join(", ")}`);
    process.exit(1);
  }

  if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });

  const server = await serveDir();
  try {
    for (const d of targets) {
      await recordOne(d);
    }
  } finally {
    try { server.kill("SIGTERM"); } catch {}
  }
}

await main();
