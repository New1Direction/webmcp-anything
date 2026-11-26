import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { Effect, Schema } from "effect";
import { loadComparison } from "./reports.ts";

const Diff = Schema.Struct({
  added: Schema.Array(Schema.String),
  removed: Schema.Array(Schema.String),
  changed: Schema.Array(Schema.String),
});
const decodeDiff = Schema.decodeUnknownEffect(Schema.fromJsonString(Diff));

const binaryName = process.platform === "win32" ? "wmcp-doctor-diff.exe" : "wmcp-doctor-diff";
const defaultEngine = fileURLToPath(new URL(`../native/target/debug/${binaryName}`, import.meta.url));
const buildCommand = "cargo build --locked --manifest-path tools/doctor-diff/native/Cargo.toml";

const compare = Effect.fn(function* (argv: string[]) {
  const { positionals, values } = yield* Effect.try({
    try: () => parseArgs({
      args: argv,
      allowPositionals: true,
      options: {
        json: { type: "boolean" },
        strict: { type: "boolean" },
        engine: { type: "string" },
        "allow-preview-origin": { type: "boolean" },
      },
    }),
    catch: (cause) => new Error(`${cause instanceof Error ? cause.message : cause}. See doctor diff --help.`),
  });
  const [baseline, current] = positionals;
  if (positionals.length !== 2 || (baseline === "-" && current === "-")) {
    return yield* Effect.fail(new Error("Pass two saved reports and use stdin for at most one. See doctor diff --help."));
  }
  const input = yield* loadComparison(baseline, current, values["allow-preview-origin"] ?? false);
  const output = yield* Effect.try({
    try: () => {
      const run = spawnSync(values.engine === undefined ? defaultEngine : resolve(values.engine), [], {
        input: JSON.stringify(input),
        encoding: "utf-8",
        timeout: 5_000,
        maxBuffer: 4_000_000,
        windowsHide: true,
        env: {},
      });
      if (run.error && "code" in run.error && run.error.code === "ENOENT") {
        throw new Error(`Rust engine unavailable. Build it with ${buildCommand}`);
      }
      if (run.error || run.status !== 0) throw new Error("Rust engine failed to compare the reports");
      return run.stdout;
    },
    catch: (cause) => new Error(cause instanceof Error ? cause.message : String(cause)),
  });
  const diff = yield* decodeDiff(output).pipe(Effect.mapError(() => new Error("Rust engine returned an invalid diff")));
  const changedAny = diff.added.length + diff.removed.length + diff.changed.length > 0;
  if (values.json) {
    console.log(JSON.stringify({ schemaVersion: "wmcp-doctor-diff/v1", ...diff, changedAny }, null, 2));
  } else {
    console.log(`${diff.added.length} added, ${diff.removed.length} removed, ${diff.changed.length} changed`);
    for (const kind of ["added", "removed", "changed"] as const) {
      for (const name of diff[kind]) {
        const escaped = JSON.stringify(name).replace(/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu,
          (character) => `\\u{${character.codePointAt(0)!.toString(16)}}`);
        console.log(`  ${kind}: ${escaped}`);
      }
    }
  }
  return values.strict && changedAny ? 2 : 0;
});

export function runDoctorDiff(argv: string[]) {
  return Effect.runPromise(Effect.match(compare(argv), {
    onFailure: (error) => {
      console.error(`wmcp: ${error.message}`);
      return 1;
    },
    onSuccess: (exit) => exit,
  }));
}
