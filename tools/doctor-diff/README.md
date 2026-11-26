# Compare saved Doctor reports offline

`wmcp doctor diff` compares the tool names and contract fingerprints in two saved `doctor --json` or `doctor web --json` reports. Use it to check preview reports from separate CI jobs or to review a report someone attached to a pull request.

## Try the missing-tool fixture

From the repository root, with Node.js 22.18+ and Rust:

```sh
npm ci --prefix tools/doctor-diff
cargo build --locked --manifest-path tools/doctor-diff/native/Cargo.toml

node cli/wmcp.mjs doctor diff tools/doctor-diff/fixtures/baseline.json \
  tools/doctor-diff/fixtures/preview.json --allow-preview-origin --strict
```

```text
0 added, 1 removed, 0 changed
  removed: "list_tasks"
```

The fixture simulates a preview where Chrome observes zero tools. The command exits 2. Use the baseline file for both arguments to see an unchanged comparison and exit 0. The fixture comparison runs entirely on local files.

## Compare your own reports

```sh
node cli/wmcp.mjs doctor diff baseline.json preview.json --json --strict
cat preview.json | node cli/wmcp.mjs doctor diff baseline.json - --json
```

Use two complete, unambiguous reports from the same endpoint or browser paths. For browser previews on another origin, add `--allow-preview-origin` and use the same observation window for both captures. Pin the Chrome build used to capture both reports. The comparison covers recorded tool fingerprints. Use [live Doctor checks](../../docs/WEBMCP_DOCTOR.md) for browser health, pairing discrepancies, and other findings.

Exit codes are 0 for a successful comparison, 1 for invalid input or a runtime error, and 2 for drift with `--strict`. The `--json` output includes the `added`, `removed`, and `changed` arrays. Pass `--engine /path/to/wmcp-doctor-diff` if Cargo builds elsewhere or you use a release binary.

## Implementation

TypeScript and Effect 4 handle file reads, report schemas, source matching and CLI output. The Rust engine gets only the names and hashes it needs to compute a diff. Lean proves that a tool is unchanged exactly when its optional fingerprint is equal, and that two present fingerprints classify as changed exactly when they differ. CI regenerates the Lean classification table and Rust tests check the same cases.

```sh
npm run typecheck --prefix tools/doctor-diff
npm test --prefix tools/doctor-diff
cargo test --locked --manifest-path tools/doctor-diff/native/Cargo.toml
cd tools/doctor-diff/formal
lean --run Drift.lean | diff -u classifications.tsv -
```
