import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

function engine() {
  const binary = process.platform === "win32" ? "wmcp-stats.exe" : "wmcp-stats";
  if (process.env.WMCP_STATS_ENGINE) {
    if (!existsSync(process.env.WMCP_STATS_ENGINE)) throw Error("WMCP_STATS_ENGINE does not exist");
    return process.env.WMCP_STATS_ENGINE;
  }
  const candidates = ["debug", "release"].map((mode) =>
    fileURLToPath(new URL(`../tools/wmcp-stats/target/${mode}/${binary}`, import.meta.url)));
  const path = candidates.find(existsSync);
  if (!path) throw Error("Build the Rust selection engine: cargo build --locked --manifest-path tools/wmcp-stats/Cargo.toml");
  return path;
}

export function statsBatch(requests) {
  if (!requests.length) return [];
  const result = spawnSync(engine(), [], { input: JSON.stringify({ requests }), encoding: "utf8", maxBuffer: 16_000_000 });
  if (result.error || result.status !== 0) throw Error(`Selection engine failed: ${result.error?.message || result.stderr.trim()}`);
  return JSON.parse(result.stdout);
}

export function lowerRate(successes, trials, alpha) {
  return statsBatch([{ op: "rate", successes, trials, alpha }])[0];
}

export function upperP95(latencies, alpha) {
  return statsBatch([{ op: "p95", latencies, alpha }])[0];
}
