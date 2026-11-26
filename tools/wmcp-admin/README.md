# wmcp-admin

The standard command-line tools for wmcp.sh directory and coverage operations. Install Rust and Cargo, then run these commands from the repository root. The original Python scripts remain available as legacy fallbacks.

```sh
cargo run --manifest-path tools/wmcp-admin/Cargo.toml -- seed --list-categories
cargo run --manifest-path tools/wmcp-admin/Cargo.toml -- seed --category shopify-shoes --rate 2
cat urls.txt | cargo run --manifest-path tools/wmcp-admin/Cargo.toml -- seed --fresh
```

The seed command accepts repeated `--category` options and URLs on standard input. With no input it uses all curated categories. It exits with status 1 if any request fails, or 2 for invalid options. Requests default to one per second, and each has a 20-second timeout. `--base-url` can target a local or self-hosted API.

```sh
# Harvest the MCP registry without submitting; writes /tmp/wmcp_coverage_urls.json.
cargo run --manifest-path tools/wmcp-admin/Cargo.toml -- crawl --only-harvest

# Review a JSON array without a token or network requests.
cargo run --manifest-path tools/wmcp-admin/Cargo.toml -- submit /tmp/wmcp_coverage_urls.json --dry
ADMIN_TOKEN=... cargo run --manifest-path tools/wmcp-admin/Cargo.toml -- submit /tmp/wmcp_coverage_urls.json --batch-size 200 --max 400

# Confirm Shopify candidates without submitting them.
cargo run --manifest-path tools/wmcp-admin/Cargo.toml -- shopify-coverage --input candidates.json --output confirmed.json
# Submit confirmed stores by explicitly setting a positive limit.
ADMIN_TOKEN=... cargo run --manifest-path tools/wmcp-admin/Cargo.toml -- shopify-coverage --input candidates.json --output confirmed.json --max-submit 100
```

`crawl` uses the official registry and an optional pre-extracted PulseMCP file in the system temporary directory. It writes the cleaned list before submitting; `--only-harvest` skips submission, while `--max-submit 0` means submit all harvested URLs. `--registry-url`, `--secondary`, and `--output` override its sources and output.

If registry pagination fails, produces an invalid page, or reaches its 300-page limit, the command writes partial results to a separate `.partial.json` file, exits nonzero, and does not submit. `--allow-partial` explicitly allows using the partial results.

`shopify-coverage` checks at most 200 candidates and defaults to `--max-submit 0`, which skips submission. By default it reads and replaces `shopify_good_hosts.json` in the system temporary directory, or uses the built-in candidate list if that file cannot be read. The output is replaced atomically; if there are no confirmations, no candidates, or at least half of candidates are unavailable, the existing output is preserved and no submission occurs. Use `--input` and `--output` to choose different files.

Submission commands read `ADMIN_TOKEN` from the environment and retry connection failures, timeouts, HTTP 429, and HTTP 5xx up to two times (250 ms and 500 ms delays). Other failures are not retried. If a batch fails, has an invalid response, or reports rejected items, the command exits nonzero and writes a recovery JSON file in the system temporary directory. Use `--failed-output` to choose a new recovery filename; an existing file is never overwritten. Shopify recovery also includes batches not attempted after a failure.

The API returns rejection counts rather than identifying individual items, and a timeout may occur after a server has accepted a batch. Recovery files can therefore include accepted items. Review them before resuming; the current endpoints deduplicate entries, but counts reported after a retry can differ from the original attempt. Recovery files contain the destination URL and should be treated as trusted input:

```sh
cargo run --manifest-path tools/wmcp-admin/Cargo.toml -- resume /tmp/wmcp-failed-....json --dry
ADMIN_TOKEN=... cargo run --manifest-path tools/wmcp-admin/Cargo.toml -- resume /tmp/wmcp-failed-....json
```

The original recovery file is retained. If a resumed submission fails, a new recovery file is written. `--base-url` on the original command selects the target; resume uses the destination recorded in the file. Batch sizes must be positive.
