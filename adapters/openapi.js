// OpenAPI adapter — turn any OpenAPI 3.x or Swagger 2.0 spec URL into a tool list.
//
// Detection: URL pattern (openapi/swagger in path, or ends with .json with telltale paths).
// Extraction: fetch the spec, walk paths × methods → one tool per operation.
// Live action: openapi_request handler constructs an HTTP request from the operation.
//
// For now: JSON specs only. YAML support is a one-line add if we ship a tiny YAML parser
// later, but every well-published API also offers a JSON variant, so this covers the 90%.

export const ID = "openapi";

const URL_HINTS = [
  /\/openapi(?:\.json)?(\?|$)/i,
  /\/openapi\.ya?ml(\?|$)/i,
  /\/swagger(?:\.json)?(\?|$)/i,
  /\/swagger\.ya?ml(\?|$)/i,
  /\/api-docs(\.json)?(\?|$|\/)/i,
  /\/v\d+\/swagger\.json(\?|$)/i,
  /\/spec\.json(\?|$)/i,
];

const CHROME_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36";

export function detect({ url }) {
  if (!URL_HINTS.some((re) => re.test(url))) return null;
  return { adapter: ID, specUrl: url };
}

export async function extract(ctx) {
  const res = await fetch(ctx.specUrl, {
    headers: {
      accept: "application/json, application/yaml, text/yaml, */*",
      "user-agent": CHROME_UA,
    },
    credentials: "omit",
  });
  if (!res.ok) throw new Error(`openapi fetch failed: ${res.status}`);
  const text = await res.text();
  let spec;
  try {
    spec = JSON.parse(text);
  } catch {
    throw new Error("openapi: only JSON specs supported in v0 (YAML soon)");
  }

  if (!spec.openapi && !spec.swagger) {
    throw new Error("not an OpenAPI/Swagger document");
  }

  const baseUrl = resolveBaseUrl(spec, ctx.specUrl);
  const resolve = (s) => resolveRef(s, spec);
  const tools = [];

  for (const [path, pathItem] of Object.entries(spec.paths || {})) {
    if (!pathItem || typeof pathItem !== "object") continue;
    const sharedParams = pathItem.parameters || [];
    for (const method of ["get", "post", "put", "delete", "patch"]) {
      const op = pathItem[method];
      if (!op) continue;

      const baseName = op.operationId || `${method}_${path}`;
      const name = baseName.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 64);
      const allParams = [...sharedParams, ...(op.parameters || [])];

      const properties = {};
      const required = [];

      for (const p of allParams) {
        if (!p?.name) continue;
        const schema = resolve(p.schema) || { type: p.type || "string" };
        properties[p.name] = {
          ...schema,
          description:
            p.description ||
            `${p.in || "query"} parameter` + (p.required ? " (required)" : ""),
        };
        if (p.required) required.push(p.name);
      }

      // requestBody → flatten one level into properties for the agent-side schema.
      // $refs to #/components/schemas/... are resolved so agents get real shapes.
      const rbRaw = op.requestBody?.content?.["application/json"]?.schema;
      const rb = resolve(rbRaw);
      if (rb?.properties) {
        for (const [k, v] of Object.entries(rb.properties)) {
          if (!properties[k]) properties[k] = resolve(v);
        }
        if (Array.isArray(rb.required)) required.push(...rb.required);
      }

      tools.push({
        name,
        description: (
          op.summary ||
          op.description ||
          `${method.toUpperCase()} ${path}`
        ).slice(0, 300),
        inputSchema: {
          type: "object",
          properties,
          required: [...new Set(required)],
        },
        action: {
          kind: "openapi_request",
          method: method.toUpperCase(),
          baseUrl,
          path,
          params: allParams.map((p) => ({ name: p.name, in: p.in || "query" })),
        },
      });
    }
  }

  return {
    product: {
      title: spec.info?.title || "OpenAPI",
      name: spec.info?.title,
      description: spec.info?.description,
      version: spec.info?.version,
    },
    variants: [],
    tools,
  };
}

// Resolve a JSON Pointer ref (e.g. "#/components/schemas/Pet") against the spec.
// Returns the original object if no $ref or if resolution fails. One hop deep.
function resolveRef(schema, spec) {
  if (!schema || typeof schema !== "object") return schema;
  if (!schema.$ref) return schema;
  const ref = schema.$ref;
  if (!ref.startsWith("#/")) return schema;
  const path = ref.slice(2).split("/").map((s) => s.replace(/~1/g, "/").replace(/~0/g, "~"));
  let node = spec;
  for (const p of path) {
    if (node == null) return schema;
    node = node[p];
  }
  return node || schema;
}

function resolveBaseUrl(spec, specUrl) {
  // OpenAPI 3.x: servers[0].url
  if (Array.isArray(spec.servers) && spec.servers[0]?.url) {
    const s = spec.servers[0].url;
    if (s.startsWith("http")) return s.replace(/\/$/, "");
    // Relative — resolve against spec URL
    try {
      return new URL(s, specUrl).toString().replace(/\/$/, "");
    } catch {
      return s.replace(/\/$/, "");
    }
  }
  // Swagger 2.0: host + basePath + schemes
  if (spec.host) {
    const scheme = spec.schemes?.[0] || "https";
    return `${scheme}://${spec.host}${spec.basePath || ""}`.replace(/\/$/, "");
  }
  // Fallback: spec's own origin
  try {
    return new URL(specUrl).origin;
  } catch {
    return "";
  }
}

export const actions = {
  // Live request. Agents pass args matching the operation's input schema.
  // Auth is the caller's responsibility — pass via the `_auth` pseudo-arg
  // (sent as `Authorization` header) or any header param named in the spec.
  openapi_request: async ({ method, baseUrl, path, params, args }) => {
    let url = baseUrl + path;
    const query = new URLSearchParams();
    const body = {};
    const headers = {
      "content-type": "application/json",
      accept: "application/json",
      "user-agent": CHROME_UA,
    };

    const a = args || {};
    for (const [k, v] of Object.entries(a)) {
      if (k === "_auth") continue;
      const p = params.find((x) => x.name === k);
      const loc = p?.in || "query";
      if (loc === "path") {
        url = url.replace(`{${k}}`, encodeURIComponent(String(v)));
      } else if (loc === "query") {
        query.set(k, String(v));
      } else if (loc === "header") {
        headers[k.toLowerCase()] = String(v);
      } else {
        // body or unknown → assume body
        body[k] = v;
      }
    }

    if (a._auth) headers.authorization = String(a._auth);

    const qs = query.toString();
    if (qs) url += (url.includes("?") ? "&" : "?") + qs;

    const fetchOpts = { method, headers, credentials: "omit" };
    if (
      ["POST", "PUT", "PATCH", "DELETE"].includes(method) &&
      Object.keys(body).length
    ) {
      fetchOpts.body = JSON.stringify(body);
    }

    const res = await fetch(url, fetchOpts);
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text.slice(0, 2000);
    }
    return { status: res.status, data };
  },
};
