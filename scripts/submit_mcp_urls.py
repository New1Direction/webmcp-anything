#!/usr/bin/env python3
"""submit_mcp_urls.py — submit a list of MCP server URLs (from json array) to wmcp.sh admin grade endpoint in safe batches.

Usage:
  export ADMIN_TOKEN=...
  python3 scripts/submit_mcp_urls.py launch/wmcp_submit_200.json
  # or the big one:
  python3 scripts/submit_mcp_urls.py launch/wmcp_coverage_urls.json --batch-size 200 --max 1000
"""
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.request

BASE = "https://wmcp.sh"
UA = "wmcp-coverage-agent/1.0 (+https://wmcp.sh)"

def submit_batch(urls, token, timeout=30):
    data = json.dumps({"urls": urls}).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE}/api/v1/admin/grade-servers",
        data=data,
        headers={
            "User-Agent": UA,
            "Content-Type": "application/json",
            "x-admin-token": token,
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("json_file", help="Path to json file containing array of url strings")
    ap.add_argument("--batch-size", type=int, default=200)
    ap.add_argument("--max", type=int, default=0, help="Max urls to submit (0=all)")
    ap.add_argument("--dry", action="store_true", help="Just print what would be submitted")
    args = ap.parse_args()

    token = os.environ.get("ADMIN_TOKEN", "").strip()
    if not token:
        print("ERROR: ADMIN_TOKEN env var required (same as for seed-stores)", file=sys.stderr)
        sys.exit(1)

    with open(args.json_file) as f:
        urls = json.load(f)
    if not isinstance(urls, list):
        print("ERROR: json must be an array of strings", file=sys.stderr)
        sys.exit(1)

    if args.max > 0:
        urls = urls[:args.max]

    print(f"Loaded {len(urls)} urls from {args.json_file}")

    total_new = 0
    total_queued = 0
    for i in range(0, len(urls), args.batch_size):
        batch = urls[i:i+args.batch_size]
        print(f"Batch {i//args.batch_size + 1}: {len(batch)} urls ...")
        if args.dry:
            print("  (dry) would POST first 3:", batch[:3])
            continue
        try:
            res = submit_batch(batch, token)
            print("  ", res)
            total_new += res.get("newly_added", 0)
            total_queued = res.get("queued_total", total_queued)
        except Exception as e:
            print("  ERROR:", e)
        time.sleep(0.5)

    print(f"\nDone. newly_added ~{total_new}, last queued_total {total_queued}")
    print("Check: curl -s https://wmcp.sh/api/v1/stats/public | jq")
    print("Leaderboard: https://wmcp.sh/mcp/leaderboard")

if __name__ == "__main__":
    main()
