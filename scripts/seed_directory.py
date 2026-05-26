#!/usr/bin/env python3
"""seed_directory.py — populate the /directory + /u/* SEO pages by pre-caching real URLs.

Hands a list of URLs to https://wmcp.sh/api/v1/tools so the worker extracts +
caches them. Each successful hit becomes one indexable /u/<hash> page that
Google can crawl.

Use cases:
- Bootstrap launch with ~500 popular product URLs across categories
- Hermes-driven scheduled crawl ("every Sunday, refresh top 100 shoes")
- Quick post-deploy smoke test that the worker is healthy

Run manually:
    python3 scripts/seed_directory.py < urls.txt

Or with a curated category:
    python3 scripts/seed_directory.py --category shopify-popular

Hermes integration (one-liner from a Hermes plan):
    bash -c "cat my-shopify-urls.txt | python3 scripts/seed_directory.py --rate 2"
"""

from __future__ import annotations

import argparse
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass, field
from typing import Iterable, List

BASE_URL = "https://wmcp.sh"


@dataclass
class Result:
    url: str
    status: int
    adapter: str = ""
    tool_count: int = 0
    error: str = ""


# A curated starting set — known-good URLs that exercise multiple adapters.
# Real URLs only. No fake data.
CURATED: dict[str, List[str]] = {
    "shopify-shoes": [
        "https://www.allbirds.com/products/mens-wool-runners",
        "https://www.allbirds.com/products/womens-tree-runners",
        "https://www.allbirds.com/products/mens-tree-runners",
        "https://www.allbirds.com/products/womens-wool-runner-mizzles",
    ],
    "shopify-apparel": [
        "https://www.everlane.com/products/mens-organic-cotton-crew-tee-white",
        "https://www.everlane.com/products/womens-organic-cotton-box-cut-tee-white",
        "https://www.tenthousand.cc/products/interval-short",
        "https://outdoorvoices.com/products/exercise-dress",
    ],
    "shopify-cpg": [
        "https://www.deathwishcoffee.com/products/death-wish-ground-coffee-can",
        "https://liquiddeath.com/products/liquid-death-mountain-water-12-pack",
        "https://magicspoon.com/products/magic-spoon-cereal-variety-pack",
        "https://www.partakefoods.com/products/birthday-cake-cookies",
    ],
    "shopify-beauty": [
        "https://www.glossier.com/products/balm-dotcom",
        "https://www.huel.com/products/huel-black-edition",
        "https://www.brooklinen.com/products/classic-core-sheet-set",
    ],
    "openapi-public": [
        "https://petstore3.swagger.io/api/v3/openapi.json",
        "https://petstore.swagger.io/v2/swagger.json",
        "https://api.frankfurter.app/openapi.json",
    ],
}


def hit(url: str, *, fresh: bool = False, timeout: float = 20.0) -> Result:
    qs = urllib.parse.urlencode({"url": url, **({"fresh": "1"} if fresh else {})})
    full = f"{BASE_URL}/api/v1/tools?{qs}"
    req = urllib.request.Request(
        full,
        headers={"accept": "application/json", "user-agent": "wmcp-seed/0.1"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = resp.read().decode("utf-8")
            data = json.loads(body) if body else {}
            return Result(
                url=url,
                status=resp.status,
                adapter=data.get("adapter", ""),
                tool_count=len(data.get("tools", []) or []),
            )
    except urllib.error.HTTPError as e:
        err_body = ""
        try:
            err_body = e.read().decode("utf-8", errors="replace")[:200]
        except Exception:
            pass
        return Result(url=url, status=e.code, error=err_body)
    except Exception as e:
        return Result(url=url, status=0, error=str(e)[:200])


def seed(urls: Iterable[str], *, rate_per_sec: float = 1.0, fresh: bool = False) -> List[Result]:
    delay = 1.0 / max(0.1, rate_per_sec)
    results: List[Result] = []
    n = 0
    for u in urls:
        u = u.strip()
        if not u or u.startswith("#"):
            continue
        n += 1
        r = hit(u, fresh=fresh)
        results.append(r)
        ok = r.status == 200
        marker = "✓" if ok else "✗"
        line = f"  {marker} [{r.status}] "
        if ok and r.adapter:
            line += f"{r.adapter:8s} {r.tool_count:>3} tools  "
        line += u
        if r.error:
            line += f"  — {r.error[:80]}"
        print(line)
        if delay > 0:
            time.sleep(delay)
    return results


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument(
        "--category",
        action="append",
        default=[],
        help=f"Curated category (repeatable). Available: {', '.join(CURATED)}",
    )
    p.add_argument("--rate", type=float, default=1.0, help="Requests per second (default 1)")
    p.add_argument("--fresh", action="store_true", help="Add ?fresh=1 to bypass cache")
    p.add_argument(
        "--list-categories",
        action="store_true",
        help="Print curated category names + URL counts then exit",
    )
    args = p.parse_args()

    if args.list_categories:
        for cat, urls in CURATED.items():
            print(f"  {cat:24s} {len(urls)} urls")
        return 0

    urls: List[str] = []
    for cat in args.category:
        if cat not in CURATED:
            print(f"unknown category: {cat}", file=sys.stderr)
            return 2
        urls.extend(CURATED[cat])

    if not sys.stdin.isatty():
        urls.extend(sys.stdin.readlines())

    if not urls:
        # No input — default to seeding the whole curated set.
        for cat_urls in CURATED.values():
            urls.extend(cat_urls)
        print(f"# no input; seeding all {len(urls)} curated URLs across {len(CURATED)} categories")
        print()

    results = seed(urls, rate_per_sec=args.rate, fresh=args.fresh)

    ok = sum(1 for r in results if r.status == 200)
    fail = len(results) - ok
    adapters = {}
    for r in results:
        if r.status == 200 and r.adapter:
            adapters[r.adapter] = adapters.get(r.adapter, 0) + 1

    print()
    print(f"# {ok}/{len(results)} OK · {fail} failed")
    if adapters:
        print(f"# by adapter: {', '.join(f'{k}={v}' for k, v in sorted(adapters.items()))}")
    return 0 if fail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
