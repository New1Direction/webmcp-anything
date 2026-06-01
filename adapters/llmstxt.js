// llmstxt.js — turn a site's declared llms.txt map into agent-readable tools.
//
// Detection is URL-only and side-effect-free: direct /llms.txt or
// /llms-full.txt URLs. Extraction fetches the text file and parses the common
// H1 + blockquote + H2 sections + markdown link-list shape.

export const ID = "llmstxt";

const LLMS_PATH_RE = /\/llms(?:-full)?\.txt$/i;
const LLMS_FULL_PATH_RE = /\/llms-full\.txt$/i;
const MAX_FETCH_BODY = 20000;

const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36";

export function detect({ url }) {
  try {
    const parsed = new URL(url);
    if (!isHttpUrl(parsed.toString())) return null;
    if (!LLMS_PATH_RE.test(parsed.pathname)) return null;
    return { adapter: ID, sourceUrl: parsed.toString(), full: LLMS_FULL_PATH_RE.test(parsed.pathname) };
  } catch {
    return null;
  }
}

export async function extract(ctx) {
  const res = await fetch(ctx.sourceUrl, {
    headers: {
      accept: "text/plain, text/markdown, text/*, */*",
      "user-agent": CHROME_UA,
    },
    credentials: "omit",
  });
  if (!res.ok) throw new Error(`llmstxt fetch failed: ${res.status}`);

  const text = await res.text();
  const parsed = parseLlmsTxt(text, ctx.sourceUrl);
  const links = parsed.sections.flatMap((section) =>
    section.links.map((link) => ({ ...link, section: section.name }))
  );
  if (!links.length) {
    if (ctx.full) return buildFullContextPayload(parsed, text, ctx.sourceUrl);
    throw new Error("llmstxt: no declared links found");
  }

  const product = {
    title: parsed.title,
    name: parsed.title,
    url: ctx.sourceUrl,
    summary: parsed.summary,
    description: parsed.description,
    section_count: parsed.sections.length,
    link_count: links.length,
  };

  return {
    product,
    variants: [],
    tools: [
      {
        name: "list_sections",
        description: `List the declared llms.txt sections for ${parsed.title}.`,
        inputSchema: { type: "object", properties: {}, required: [] },
        result: {
          title: parsed.title,
          summary: parsed.summary,
          description: parsed.description,
          sections: parsed.sections,
        },
      },
      {
        name: "get_section",
        description: "Return one declared llms.txt section by name.",
        inputSchema: {
          type: "object",
          properties: {
            section: {
              type: "string",
              enum: parsed.sections.map((section) => section.name),
            },
          },
          required: ["section"],
        },
        action: { kind: "llmstxt_get_section", sections: parsed.sections },
      },
      {
        name: "fetch_link",
        description: "Fetch one URL declared by llms.txt.",
        inputSchema: {
          type: "object",
          properties: {
            url: {
              type: "string",
              enum: links.map((link) => link.url),
            },
          },
          required: ["url"],
        },
        action: { kind: "llmstxt_fetch_link", links },
      },
    ],
  };
}

function parseLlmsTxt(text, sourceUrl) {
  const lines = String(text || "").replace(/^\uFEFF/, "").split(/\r?\n/);
  let title = "";
  const summary = [];
  const details = [];
  const sections = [];
  let current = null;
  let beforeFirstSection = true;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const h1 = line.match(/^#\s+(.+)$/);
    if (h1 && !title) {
      title = cleanText(h1[1]);
      continue;
    }

    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      const name = cleanText(h2[1]);
      current = { name, links: [] };
      if (isOptionalSectionName(name)) current.optional = true;
      sections.push(current);
      beforeFirstSection = false;
      continue;
    }

    if (beforeFirstSection && line.startsWith(">")) {
      summary.push(cleanText(line.replace(/^>\s?/, "")));
      continue;
    }

    const link = parseMarkdownListLink(line, sourceUrl);
    if (link) {
      if (!current) {
        current = { name: "Overview", links: [] };
        sections.push(current);
      }
      current.links.push(current.optional ? { ...link, optional: true } : link);
      beforeFirstSection = false;
      continue;
    }

    if (beforeFirstSection) {
      details.push(cleanText(line));
    }
  }

  let fallbackTitle = "llms.txt";
  try {
    fallbackTitle = new URL(sourceUrl).hostname;
  } catch {}

  return {
    title: title || fallbackTitle,
    summary: summary.join(" ").trim() || undefined,
    description: details.join(" ").trim() || undefined,
    sections: sections.filter((section) => section.links.length),
  };
}

function parseMarkdownListLink(line, sourceUrl) {
  const match = line.match(/^\s*[-*]\s+\[([^\]]+)]\(([^)]+)\)(?:\s*[:—-]\s*(.*))?\s*$/);
  if (!match) return null;
  const name = cleanText(match[1]);
  const rawUrl = match[2].trim();
  const description = cleanText(match[3] || "");
  let url;
  try {
    url = new URL(rawUrl, sourceUrl).toString();
  } catch {
    return null;
  }
  if (!isFetchableUrl(url)) return null;
  return description ? { name, url, description } : { name, url };
}

function buildFullContextPayload(parsed, text, sourceUrl) {
  const body = String(text || "").slice(0, MAX_FETCH_BODY);
  return {
    product: {
      title: parsed.title,
      name: parsed.title,
      url: sourceUrl,
      summary: parsed.summary,
      description: parsed.description,
      section_count: 0,
      link_count: 0,
    },
    variants: [],
    tools: [
      {
        name: "get_full_context",
        description: `Return the bounded llms-full.txt context for ${parsed.title}.`,
        inputSchema: { type: "object", properties: {}, required: [] },
        result: {
          title: parsed.title,
          summary: parsed.summary,
          description: parsed.description,
          url: sourceUrl,
          body,
          truncated: String(text || "").length > MAX_FETCH_BODY,
        },
      },
    ],
  };
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function isOptionalSectionName(name) {
  return name.trim().toLowerCase() === "optional";
}

function isHttpUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isFetchableUrl(url) {
  try {
    const parsed = new URL(url);
    if (!isHttpUrl(parsed.toString())) return false;
    return !isBlockedHost(parsed.hostname);
  } catch {
    return false;
  }
}

function isBlockedHost(hostname) {
  const host = String(hostname || "").toLowerCase().replace(/^\[/, "").replace(/]$/, "").replace(/\.$/, "");
  if (!host) return true;
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".internal") ||
    host === "metadata.google.internal"
  ) {
    return true;
  }

  const mappedIpv4 = host.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (mappedIpv4) return isBlockedHost(mappedIpv4[1]);

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4) {
    const parts = ipv4.slice(1).map((part) => Number(part));
    if (parts.some((part) => part > 255)) return true;
    const [a, b] = parts;
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) ||
      a >= 224
    );
  }

  return (
    host === "::1" ||
    host.startsWith("fe80:") ||
    host.startsWith("fc") ||
    host.startsWith("fd")
  );
}

async function readTextWithLimit(res, maxChars) {
  const reader = res.body?.getReader?.();
  if (!reader) {
    const text = await res.text();
    return { body: text.slice(0, maxChars), truncated: text.length > maxChars };
  }

  const decoder = new TextDecoder();
  let body = "";
  let truncated = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    const chunk = decoder.decode(value, { stream: true });
    const remaining = maxChars - body.length;
    if (remaining > 0) body += chunk.slice(0, remaining);
    if (chunk.length > remaining) {
      truncated = true;
      await reader.cancel();
      break;
    }
  }

  if (!truncated) body += decoder.decode();
  return { body, truncated };
}

export const actions = {
  llmstxt_get_section: async ({ sections, args }) => {
    const wanted = String(args?.section || "").trim().toLowerCase();
    const section = (sections || []).find((item) => item.name.toLowerCase() === wanted);
    if (!section) throw new Error("llmstxt section not declared");
    return section;
  },

  llmstxt_fetch_link: async ({ links, args }) => {
    const wanted = String(args?.url || args?.name || "").trim();
    const link = (links || []).find(
      (item) => item.url === wanted || item.name.toLowerCase() === wanted.toLowerCase()
    );
    if (!link) throw new Error("llmstxt link not declared");
    if (!isFetchableUrl(link.url)) throw new Error("llmstxt unsupported URL");

    const res = await fetch(link.url, {
      headers: {
        accept: "text/plain, text/markdown, text/html, application/json, */*",
        "user-agent": CHROME_UA,
      },
      credentials: "omit",
    });
    if (res.url && !isFetchableUrl(res.url)) throw new Error("llmstxt unsupported URL");
    const { body, truncated } = await readTextWithLimit(res, MAX_FETCH_BODY);
    return {
      name: link.name,
      url: link.url,
      status: res.status,
      content_type: res.headers.get("content-type") || undefined,
      body,
      truncated,
    };
  },
};
