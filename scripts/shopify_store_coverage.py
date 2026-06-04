#!/usr/bin/env python3
"""
shopify_store_coverage.py — wmcp.sh Shopify store coverage agent (3 niches).

Finds PUBLIC Shopify stores in TCG/trading cards, collectibles (Labubu/designer toys/Funko),
streetwear/sneaker boutiques via firecrawl searches + directories + listicles.
Confirms via /products.json?limit=1 (or homepage cdn.shopify.com fallback for low-conf "likely").
Cleans to bare hostname, dedupes, queues via POST /api/v1/admin/seed-stores.

Run (no submit):
  python3 scripts/shopify_store_coverage.py --max-submit 0

With submit (operator with token):
  ADMIN_TOKEN=xxx python3 scripts/shopify_store_coverage.py --max-submit 200

Re-runnable; dedupes via the API response (newly_added).
Only public storefronts; skips big marketplaces (QuickCatch covers them).
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
UA = "wmcp-shopify-coverage/1.0 (+https://wmcp.sh/stores)"

# DO NOT SUBMIT list (per spec)
BLOCKED = {
    "pokemoncenter.com", "popmart.com", "walmart.com", "target.com", "amazon.com",
    "bestbuy.com", "gamestop.com", "tcgplayer.com", "ebay.com", "nike.com",
    "footlocker.com", "snkrs.com", "stockx.com", "goat.com",
}

@dataclass
class SubmitResult:
    accepted: int = 0
    rejected: int = 0
    newly_added: int = 0
    total_stores_in_list: int = 0
    error: str = ""

def http_get(url: str, timeout: float = 10.0, accept_json: bool = False) -> Any:
    headers = {"User-Agent": UA}
    if accept_json:
        headers["Accept"] = "application/json"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        raw = r.read().decode("utf-8", errors="ignore")
        if accept_json:
            return json.loads(raw)
        return raw

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
        return json.loads(r.read().decode("utf-8", errors="ignore"))

def confirm_shopify(host: str) -> bool:
    """One light request: /products.json?limit=1 -> non-empty products array.
    Fallback: homepage contains cdn.shopify.com or Shopify.theme (low-conf "likely", cron re-filters).
    """
    host = host.lower().strip().replace("www.", "")
    if not host or any(b in host for b in ["localhost", "127.", "192.168", "10.", "shopify.com", "myshopify"]):
        return False
    # Primary: products.json
    try:
        u = f"https://{host}/products.json?limit=1"
        data = http_get(u, timeout=7, accept_json=True)
        if isinstance(data, dict) and isinstance(data.get("products"), list) and len(data["products"]) > 0:
            return True
    except urllib.error.HTTPError as e:
        if e.code in (403, 429, 503):
            pass  # anti-bot; try fallback
    except Exception:
        pass
    # Fallback homepage (low confidence ok per spec)
    try:
        txt = http_get(f"https://{host}/", timeout=6).lower()
        if "cdn.shopify.com" in txt or "shopify.theme" in txt or 'id="shopify-section' in txt:
            return True
    except Exception:
        pass
    return False

def load_seed_hosts() -> List[str]:
    """Load from launch/ pre-extracted (from firecrawl runs) or return small verified set."""
    paths = [
        "/Users/alexhearts/webmcp-anything/launch/shopify_good_hosts.json",
        "/tmp/shopify_good_hosts.json",
    ]
    for p in paths:
        try:
            with open(p) as f:
                data = json.load(f)
                if isinstance(data, list):
                    return [str(x).strip() for x in data if x]
        except Exception:
            pass
    # Fallback small verified set from this run (TCG + collectibles + streetwear variety)
    return [
        "stomptradingcards.com.au","cardfaire.com","hammverse.com","vaultedculture.com",
        "rhydonmycards.com.au","jinkiesco.com","theshopcollectibles.com","zenkaigames.co.nz",
        "eclipsepop.com","dodogames.co.uk","awesomedealsdeluxe.com","skyboxct.com",
        "mallardcollectibles.com","cutiemalta.com","ttmartglobal.com","redraideroutfitter.com",
        "jawnsonfire.com","ikigaicases.com","nagbags.ca","onitathlete.com","tcgcorner.com",
    ]

def clean_hosts(raw: Iterable[str]) -> List[str]:
    good: Set[str] = set()
    for h in raw:
        try:
            h = str(h).strip().lower()
            p = urllib.parse.urlparse(h if "://" in h else f"https://{h}")
            host = p.netloc.lower() or h
            host = host.replace("www.", "").rstrip("/")
            if not host or host in BLOCKED or any(x in host for x in ["shopify.com", "myshopify", "localhost", "127.", "192.168"]):
                continue
            good.add(host)
        except Exception:
            continue
    return sorted(good)

def submit_batches(hosts: List[str], batch_size: int = 100) -> SubmitResult:
    if not ADMIN_TOKEN:
        print("ERROR: ADMIN_TOKEN not set. Cannot submit. (Operator: export ADMIN_TOKEN=... )")
        return SubmitResult(error="no ADMIN_TOKEN")
    res = SubmitResult()
    for i in range(0, len(hosts), batch_size):
        batch = hosts[i : i + batch_size]
        print(f"[submit] batch {i//batch_size + 1} size={len(batch)} ...")
        try:
            out = http_post_json(f"{BASE}/api/v1/admin/seed-stores", {"stores": batch}, ADMIN_TOKEN)
            print(f"  -> {out}")
            res.accepted += out.get("accepted", 0)
            res.rejected += out.get("rejected", 0)
            res.newly_added += out.get("newly_added", 0)
            res.total_stores_in_list = out.get("total_stores_in_list", res.total_stores_in_list)
        except Exception as e:
            print(f"  ERROR: {e}")
            res.error = str(e)
            break
        time.sleep(0.5)
    return res

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--max-submit", type=int, default=0, help="Max hosts to submit this run (0 = harvest + confirm only, write batches)")
    ap.add_argument("--batch-size", type=int, default=100)
    args = ap.parse_args()

    print("=== wmcp.sh Shopify Store Coverage Agent ===")
    print("Niches: TCG/trading cards | Collectibles (Labubu/designer/Funko) | Streetwear/sneakers")
    print()

    raw = load_seed_hosts()
    print(f"[load] {len(raw)} seed candidates from launch/ + fallback")

    cleaned = clean_hosts(raw)
    print(f"[clean] {len(cleaned)} after dedupe + blocklist")

    # Confirm (one light per; in real runs do incremental from new firecrawl harvests)
    confirmed: List[str] = []
    for h in cleaned[:200]:  # safety cap
        if confirm_shopify(h):
            confirmed.append(h)
            print(f"  ✅ {h}")
        else:
            print(f"  ❌ {h}")
        time.sleep(0.4)
    print(f"[confirm] {len(confirmed)} verified Shopify (or low-conf likely)")

    # Write batch files for operator
    os.makedirs("/Users/alexhearts/webmcp-anything/launch", exist_ok=True)
    with open("/Users/alexhearts/webmcp-anything/launch/shopify_good_hosts.json", "w") as f:
        json.dump(confirmed, f, indent=2)
    print(f"[write] launch/shopify_good_hosts.json ({len(confirmed)})")

    if args.max_submit > 0:
        to_submit = confirmed[:args.max_submit]
        result = submit_batches(to_submit, args.batch_size)
        print(f"\n[result] accepted={result.accepted} rejected={result.rejected} newly_added={result.newly_added} total_in_list={result.total_stores_in_list}")
    else:
        print("\n[submit] skipped (--max-submit 0). Operator: export ADMIN_TOKEN=... then re-run or use queue script.")
        print("  Example: ADMIN_TOKEN=xxx python3 scripts/shopify_store_coverage.py --max-submit 100")

    # Quick verify hint
    print("\nVerify:")
    print("  curl -s https://wmcp.sh/api/v1/directory | head -c 200")
    print("  curl -s https://wmcp.sh/api/v1/stats/public")

if __name__ == "__main__":
    main()
