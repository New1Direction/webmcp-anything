import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { stdin } from "node:process";
import { addAbortSignal } from "node:stream";
import { Effect, Schema } from "effect";
import { MAX_RESPONSE_BYTES, MAX_TOOLS, validateEndpoint } from "../../../cli/mcp-read.mjs";

const Fingerprint = Schema.Struct({
  name: Schema.NonEmptyString,
  sha256: Schema.String.check(Schema.isPattern(/^[a-f0-9]{64}$/u)),
});

const fields = {
  complete: Schema.Literal(true),
  toolCount: Schema.Int,
  toolFingerprints: Schema.Array(Fingerprint).check(Schema.isMaxLength(MAX_TOOLS)),
};

const DoctorReport = Schema.Union([
  Schema.Struct({
    ...fields,
    schemaVersion: Schema.Literal("wmcp-doctor/v1"),
    endpoint: Schema.String,
  }),
  Schema.Struct({
    ...fields,
    schemaVersion: Schema.Literal("wmcp-doctor-web/v1"),
    page: Schema.String,
    observedPage: Schema.String,
    waitMs: Schema.Int,
  }),
]);

const decodeReport = Schema.decodeUnknownEffect(Schema.fromJsonString(DoctorReport));
type Report = typeof DoctorReport.Type;

function readReport(path: string, label: string) {
  return Effect.tryPromise({
    try: async (signal) => {
      if (path !== "-" && !(await stat(path)).isFile()) {
        throw new Error("expected a regular file");
      }
      const chunks: Buffer[] = [];
      let size = 0;
      const stream = path === "-" ? addAbortSignal(signal, stdin) : createReadStream(path, { signal });
      for await (const chunk of stream) {
        const bytes = Buffer.from(chunk);
        size += bytes.length;
        if (size > MAX_RESPONSE_BYTES) throw new Error("report exceeds 2 MB");
        chunks.push(bytes);
      }
      return new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks));
    },
    catch: (cause) => new Error(
      `Cannot read ${label} ${JSON.stringify(path)}: ${cause instanceof Error ? cause.message : String(cause)}`,
    ),
  }).pipe(
    Effect.flatMap((text) => decodeReport(text).pipe(
      Effect.mapError(() => new Error(`${label} must be a complete WMCP Doctor v1 JSON report with valid tool fingerprints`)),
    )),
    Effect.flatMap((report) => {
      if (report.toolCount !== report.toolFingerprints.length) {
        return Effect.fail(new Error(`${label} does not have a fingerprint for every reported tool`));
      }
      const names = new Set(report.toolFingerprints.map(({ name }) => name));
      return names.size === report.toolFingerprints.length
        ? Effect.succeed(report)
        : Effect.fail(new Error(`${label} contains duplicate tool names`));
    }),
  );
}

function checkSources(baseline: Report, current: Report, allowPreviewOrigin: boolean) {
  if (baseline.schemaVersion === "wmcp-doctor/v1" && current.schemaVersion === "wmcp-doctor/v1") {
    if (allowPreviewOrigin) throw new Error("--allow-preview-origin requires two browser reports");
    if (validateEndpoint(baseline.endpoint) !== validateEndpoint(current.endpoint)) {
      throw new Error("Reports must come from the same MCP endpoint");
    }
    return;
  }
  if (baseline.schemaVersion !== "wmcp-doctor-web/v1" || current.schemaVersion !== "wmcp-doctor-web/v1") {
    throw new Error("Reports must both be browser WebMCP reports or both be remote MCP reports");
  }
  const before = new URL(validateEndpoint(baseline.page));
  const after = new URL(validateEndpoint(current.page));
  const observedBefore = new URL(validateEndpoint(baseline.observedPage));
  const observedAfter = new URL(validateEndpoint(current.observedPage));
  if (before.pathname !== after.pathname || observedBefore.pathname !== observedAfter.pathname) {
    throw new Error("Browser reports must use the same requested and observed paths");
  }
  if (!allowPreviewOrigin && (before.origin !== after.origin || observedBefore.origin !== observedAfter.origin)) {
    throw new Error("Browser origins differ. Pass --allow-preview-origin to compare a preview deployment");
  }
  if (baseline.waitMs !== current.waitMs) {
    throw new Error("Browser reports must use the same observation window");
  }
}

export const loadComparison = Effect.fn(function* (baselinePath: string, currentPath: string, allowPreviewOrigin: boolean) {
  const [baseline, current] = yield* Effect.all([
    readReport(baselinePath, "Baseline"),
    readReport(currentPath, "Current report"),
  ], { concurrency: 2 });
  yield* Effect.try({
    try: () => checkSources(baseline, current, allowPreviewOrigin),
    catch: (cause) => new Error(cause instanceof Error ? cause.message : String(cause)),
  });
  return { baseline: baseline.toolFingerprints, current: current.toolFingerprints };
});
