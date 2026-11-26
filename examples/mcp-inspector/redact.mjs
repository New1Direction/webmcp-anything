import { record } from "./schemas.mjs";

const SECRET = /(?:^|[-_ .])(?:authorization|cookie|credentials?|secret|password|passwd|token|session|signature|api[-_ ]?key|private[-_ ]?key)(?:$|[-_ .])/i;
const SECRET_CAMEL = /(?:access|refresh|auth|bearer|api|id|csrf|session|client|private)(?:token|key|secret|id|password)$/i;
const TOKEN = /(?:gh[pousr]_|github_pat_|xox[baprs]-|sk[-_]|rk_live_|AKIA[A-Z0-9]{12}|AIza|\beyJ[A-Za-z0-9_-]{8,}\.|(?:bearer|basic)\s|-----BEGIN)/i;
const KEYWORDS = new Set([
  "$schema", "$defs", "$ref", "type", "required", "properties", "additionalProperties", "items",
  "minItems", "maxItems", "minLength", "maxLength", "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum",
  "enum", "const", "allOf", "anyOf", "oneOf", "not", "format", "pattern",
]);
const SCHEMA_TYPES = new Set(["object", "array", "string", "integer", "number", "null", "boolean"]);
export const sensitive = (key) => SECRET.test(key) || SECRET_CAMEL.test(key) ||
  ["apikey", "setcookie", "mcp-session-id", "proxy-authorization"].includes(key.toLowerCase());

export function identifier(value, fallback = "withheld") {
  return typeof value === "string" && /^[A-Za-z0-9_./-]{1,72}$/.test(value) &&
    !TOKEN.test(value) && !/[A-Za-z0-9_-]{36,}/.test(value) ? value : fallback;
}

function safeField(value, ordinal = 1) {
  return sensitive(value) ? "[credential field " + ordinal + "]" :
    identifier(value, "[field " + ordinal + "]");
}

export function safePointer(path) {
  return path.split("/").map((segment, index) => segment
    ? safeField(segment.replace(/~1/g, "-").replace(/~0/g, "-"), index) : "").join("/");
}

export function payloadShape(value, depth = 0) {
  if (depth >= 8) return "[nested data withheld]";
  if (value === null) return null;
  if (Array.isArray(value)) return value.length ? [...value.slice(0, 10).map((item) => payloadShape(item, depth + 1)),
    ...(value.length > 10 ? ["[more items withheld]"] : [])] : [];
  if (record(value)) return Object.fromEntries(Object.entries(value).slice(0, 30).map(([key, field], index) =>
    [safeField(key, index + 1), sensitive(key) ? "[redacted]" : payloadShape(field, depth + 1)]));
  return "[" + typeof value + "]";
}

export function schemaShape(schema, depth = 0) {
  if (depth >= 8) return "[nested schema withheld]";
  if (typeof schema === "boolean") return schema;
  if (!record(schema)) return "[schema unavailable]";
  return Object.fromEntries(Object.entries(schema).filter(([key]) => KEYWORDS.has(key)).slice(0, 25).map(([key, value]) => {
    if (key === "type") return [key, Array.isArray(value) ? value.filter((type) => SCHEMA_TYPES.has(type)) :
      SCHEMA_TYPES.has(value) ? value : "[unknown type]"];
    if (key === "required" && Array.isArray(value)) return [key, value.filter((field) => typeof field === "string")
      .slice(0, 30).map((field, i) => safeField(field, i + 1))];
    if (key === "properties" || key === "$defs") return [key, record(value)
      ? Object.fromEntries(Object.entries(value).slice(0, 30).map(([name, child], i) =>
        [safeField(name, i + 1), schemaShape(child, depth + 1)])) : "[invalid schema map]"];
    if (["not", "items", "additionalProperties"].includes(key)) return [key, schemaShape(value, depth + 1)];
    if (["anyOf", "allOf", "oneOf"].includes(key) && Array.isArray(value)) {
      return [key, value.slice(0, 10).map((child) => schemaShape(child, depth + 1))];
    }
    if (typeof value === "number" && Number.isFinite(value) && /^(min|max|exclusive)/.test(key)) return [key, value];
    return [key, payloadShape(value, depth + 1)];
  }));
}

export function headerFacts(value) {
  if (!record(value)) return {};
  const headers = new Map(Object.entries(value).map(([key, header]) => [key.toLowerCase(), header]));
  const result = {};
  for (const key of ["authorization", "proxy-authorization", "cookie", "set-cookie", "mcp-session-id", "x-api-key"]) {
    if (headers.has(key)) result[key] = "[redacted]";
  }
  for (const key of ["content-type", "accept"]) {
    const raw = headers.get(key);
    if (typeof raw !== "string") continue;
    const formats = raw.split(",").map((part) => part.trim().split(";")[0])
      .filter((type) => ["application/json", "text/event-stream"].includes(type));
    if (formats.length) result[key] = formats.join(", ");
  }
  return result;
}
