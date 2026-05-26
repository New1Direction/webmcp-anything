// Stream-parse a remote HTML page using Cloudflare's HTMLRewriter.
// Extracts JSON-LD blocks, OG/product/twitter meta tags, and <title>.
// Designed to be fast and bounded — we never buffer the full page in memory.

export interface PageData {
  jsonld: any[];
  meta: Record<string, string>;
  title: string;
  finalUrl: string;
  status: number;
}

// A Chrome 132 desktop UA — most retailer firewalls let this through unless
// they actively block Cloudflare egress ranges (Akamai/Imperva often do).
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36";

export async function fetchAndParse(url: string): Promise<PageData> {
  const res = await fetch(url, {
    headers: {
      "user-agent": UA,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9",
      "accept-encoding": "gzip",
    },
    redirect: "follow",
    cf: { cacheTtl: 30, cacheEverything: false } as any,
  });

  const jsonld: any[] = [];
  const meta: Record<string, string> = {};
  let titleParts: string[] = [];

  // Buffers for streaming text inside script/title nodes
  let jsonldBuf = "";
  let inTitle = false;
  let titleBuf = "";

  const rewriter = new HTMLRewriter()
    .on('script[type="application/ld+json"]', {
      element() {
        jsonldBuf = "";
      },
      text(t) {
        jsonldBuf += t.text;
        if (t.lastInTextNode) {
          const raw = jsonldBuf.trim();
          jsonldBuf = "";
          if (!raw) return;
          try {
            const parsed = JSON.parse(raw);
            normalize(parsed, jsonld);
          } catch {
            // malformed — skip
          }
        }
      },
    })
    .on("meta[property]", {
      element(e) {
        const k = e.getAttribute("property");
        const v = e.getAttribute("content");
        if (k && v && (k.startsWith("og:") || k.startsWith("product:") || k.startsWith("twitter:"))) {
          meta[k] = v;
        }
      },
    })
    .on("meta[name]", {
      element(e) {
        const k = e.getAttribute("name");
        const v = e.getAttribute("content");
        if (k && v && (k.startsWith("twitter:") || k === "description")) {
          meta[k] = v;
        }
      },
    })
    .on("title", {
      element() {
        inTitle = true;
        titleBuf = "";
      },
      text(t) {
        if (!inTitle) return;
        titleBuf += t.text;
        if (t.lastInTextNode) {
          titleParts.push(titleBuf);
          titleBuf = "";
          inTitle = false;
        }
      },
    });

  // We must consume the body for HTMLRewriter to actually run handlers.
  // Use .text() to drain — but we don't need the result.
  await rewriter.transform(res).text();

  return {
    jsonld,
    meta,
    title: titleParts.join(" ").trim(),
    finalUrl: res.url,
    status: res.status,
  };
}

function normalize(node: any, out: any[]) {
  if (!node) return;
  if (Array.isArray(node)) {
    for (const n of node) normalize(n, out);
    return;
  }
  if (typeof node !== "object") return;
  if (node["@graph"]) {
    normalize(node["@graph"], out);
    return;
  }
  out.push(node);
}
