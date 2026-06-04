#!/usr/bin/env python3
"""
coverage_agent.py — wmcp.sh MCP trust hub coverage harvester.

Finds public remote MCP servers (https streamable-http / sse endpoints)
from the official registry + secondary sources and queues them for grading
via POST /api/v1/admin/grade-servers.

Run:
  ADMIN_TOKEN=xxx python3 scripts/coverage_agent.py --max-submit 400

It is safe to re-run; it dedupes against the remote KV list (via the API response).
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Iterable, Set, List, Dict, Any

BASE = "https://wmcp.sh"
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "").strip()
UA = "wmcp-coverage-agent/1.0 (+https://wmcp.sh/mcp/grade)"

@dataclass
class SubmitResult:
    accepted: int = 0
    rejected: int = 0
    newly_added: int = 0
    queued_total: int = 0
    error: str = ""

def http_get(url: str, timeout: float = 25.0) -> Any:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))

def http_post_json(url: str, payload: dict, token: str, timeout: float = 30.0) -> Any:
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
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

def harvest_registry(max_pages: int = 300) -> Set[str]:
    """Full pagination of official registry, extract remotes[].url for streamable/sse."""
    urls: Set[str] = set()
    cursor = ""
    pages = 0
    while pages < max_pages:
        api = "https://registry.modelcontextprotocol.io/v0/servers?limit=100"
        if cursor:
            api += "&cursor=" + urllib.parse.quote(cursor)
        try:
            page = http_get(api)
        except Exception as e:
            print(f"[registry] fetch error page {pages}: {e}")
            break
        servers = page.get("servers", [])
        for entry in servers:
            srv = entry.get("server", {}) if isinstance(entry, dict) else {}
            remotes = srv.get("remotes", []) if isinstance(srv, dict) else []
            for rmt in remotes:
                if not isinstance(rmt, dict):
                    continue
                if rmt.get("type") in ("streamable-http", "sse"):
                    u = (rmt.get("url") or "").strip()
                    if u.startswith("https://"):
                        urls.add(u)
        meta = page.get("metadata", {}) or {}
        cursor = meta.get("nextCursor", "") or ""
        pages += 1
        print(f"[registry] page {pages}: +{len(servers)} entries, total={len(urls)}, cursor={cursor[:30] if cursor else '(end)'}")
        if not cursor:
            break
        time.sleep(0.1)
    return urls


def harvest_pulsemcp_secondary() -> Set[str]:
    """Load pre-extracted from launch/ for PulseMCP hosted remotes (from firecrawl scrape of server detail pages).
    Extend live with firecrawl_search + scrape for more.
    """
    urls: Set[str] = set()
    candidates = [
        "/Users/alexhearts/webmcp-anything/launch/pulsemcp_extracted.json",
        "/tmp/pulsemcp_extracted.json",
    ]
    for p in candidates:
        try:
            with open(p) as f:
                data = json.load(f)
                for u in data:
                    if isinstance(u, str) and u.startswith("https://"):
                        clean_u = u.strip().split()[0].rstrip(".,;\"'<>()[]")
                        urls.add(clean_u)
        except Exception:
            pass
    print(f"[pulsemcp-secondary] added {len(urls)} from pre-extracted (run firecrawl searches for fresh)")
    return urls

def clean_and_normalize(raw: Iterable[str]) -> List[str]:
    """Keep only plausible public remote MCP https endpoints. Dedup + sort."""
    good: Set[str] = set()
    for u in raw:
        try:
            p = urllib.parse.urlparse(u.strip())
            if p.scheme != "https":
                continue
            host = p.netloc.lower()
            if not host or "localhost" in host or host.startswith("127.") or host.startswith("192.168.") or host.startswith("10."):
                continue
            path = p.path or "/"
            # Heuristic: looks like an MCP endpoint if path contains mcp/sse or is root on a plausible host
            if any(k in (host + path).lower() for k in ("/mcp", "/sse", "mcp-server", "mcp.sse")) or path in ("/", ""):
                norm = f"https://{host}{path}".rstrip("/")
                good.add(norm)
        except Exception:
            continue
    return sorted(good)

def submit_batches(urls: List[str], batch_size: int = 200) -> SubmitResult:
    if not ADMIN_TOKEN:
        print("ERROR: ADMIN_TOKEN not set in environment. Cannot submit. (Set it from wrangler secret.)")
        return SubmitResult(error="no ADMIN_TOKEN")
    total_new = 0
    total_queued = 0
    accepted = 0
    rejected = 0
    for i in range(0, len(urls), batch_size):
        batch = urls[i : i + batch_size]
        print(f"[submit] batch {i//batch_size + 1} size={len(batch)} ...")
        try:
            res = http_post_json(f"{BASE}/api/v1/admin/grade-servers", {"urls": batch}, ADMIN_TOKEN)
            print(f"  -> {res}")
            accepted += res.get("accepted", 0)
            rejected += res.get("rejected", 0)
            total_new += res.get("newly_added", 0)
            total_queued = res.get("queued_total", total_queued)
        except Exception as e:
            print(f"  SUBMIT ERROR: {e}")
            rejected += len(batch)
        time.sleep(0.5)
    return SubmitResult(accepted=accepted, rejected=rejected, newly_added=total_new, queued_total=total_queued)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--max-submit", type=int, default=0, help="Max URLs to submit this run (0 = all after dedup)")
    ap.add_argument("--batch-size", type=int, default=200)
    ap.add_argument("--only-harvest", action="store_true", help="Just harvest + save list, do not submit")
    args = ap.parse_args()

    print("=== wmcp.sh coverage agent ===")
    print(f"BASE={BASE}")
    print(f"ADMIN_TOKEN set: {bool(ADMIN_TOKEN)}")

    # 1. Registry (primary, canonical source)
    reg = harvest_registry()
    print(f"Registry gave {len(reg)} raw https remotes")

    # 2. Secondary (PulseMCP etc for hosted not-yet-in-registry or fresh ones)
    pulse = harvest_pulsemcp_secondary()

    # TODO: add more: harvest_smithery(), harvest_glama(), github code search for "https://.../mcp" "streamable-http" in READMEs, etc.
    all_raw = reg | pulse

    cleaned = clean_and_normalize(all_raw)
    print(f"After clean/normalize/dedup: {len(cleaned)} URLs")

    # Persist for audit / resume
    out_path = "/tmp/wmcp_coverage_urls.json"
    with open(out_path, "w") as f:
        json.dump(cleaned, f, indent=2)
    print(f"Saved cleaned list -> {out_path}")

    if args.only_harvest:
        print("only-harvest: done.")
        return

    to_submit = cleaned[: args.max_submit] if args.max_submit > 0 else cleaned
    if not to_submit:
        print("Nothing to submit.")
        return

    print(f"Submitting {len(to_submit)} URLs in batches of {args.batch_size}...")
    res = submit_batches(to_submit, args.batch_size)

    # Final report
    print("\n=== RUN REPORT ===")
    print(f"unique found this run (registry+secondaries): {len(cleaned)}")
    print(f"submitted this run: {len(to_submit)}")
    print(f"API accepted: {res.accepted}")
    print(f"API rejected: {res.rejected}")
    print(f"API newly_added: {res.newly_added}")
    print(f"API queued_total: {res.queued_total}")
    if res.error:
        print(f"ERROR: {res.error}")

    # Verify
    try:
        stats = http_get(f"{BASE}/api/v1/stats/public")
        print(f"Public stats after run: {stats}")
    except Exception as e:
        print(f"Could not fetch stats: {e}")

if __name__ == "__main__":
    main()
