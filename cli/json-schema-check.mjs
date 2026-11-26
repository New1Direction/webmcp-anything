const TYPES = ["null", "boolean", "number", "integer", "string", "array", "object"];
const SUPPORTED = new Set([
  "$schema", "$defs", "$ref", "title", "description", "examples", "default", "readOnly", "writeOnly",
  "type", "required", "properties", "additionalProperties", "items", "minItems", "maxItems",
  "minLength", "maxLength", "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum",
  "enum", "const", "allOf", "anyOf", "oneOf", "not",
]);
const DRAFT = "https://json-schema.org/draft/2020-12/schema";
export const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
export const escapePointer = (key) => key.replace(/~/g, "~0").replace(/\//g, "~1");

function fail(status, path, message) {
  throw Object.assign(new Error(message), { status, path });
}

function localRef(root, ref) {
  if (ref === "#") return root;
  if (typeof ref !== "string" || !ref.startsWith("#/")) fail("unsupported", "", "Only local JSON Pointer references are supported.");
  let value = root;
  let pointer;
  try { pointer = decodeURIComponent(ref.slice(2)); }
  catch { fail("invalid", "", "Malformed schema reference."); }
  for (const segment of pointer.split("/")) {
    const key = segment.replace(/~1/g, "/").replace(/~0/g, "~");
    if (!value || !Object.hasOwn(value, key)) fail("invalid", "", "Unresolved schema reference.");
    value = value[key];
  }
  return value;
}

export function checkSchema(root, { objectRoot = false } = {}) {
  const seen = new Set();
  let remaining = 4000;
  const visit = (schema, path, depth) => {
    if (--remaining < 0 || depth > 48) fail("unsupported", path, "Schema exceeds inspection limits.");
    if (typeof schema === "boolean" || seen.has(schema)) return;
    if (!record(schema)) fail("invalid", path, "Expected a schema object or boolean.");
    seen.add(schema);
    if (Object.keys(schema).some((key) => !SUPPORTED.has(key)) || (schema.$schema !== undefined && schema.$schema !== DRAFT)) {
      fail("unsupported", path, "Contains a schema keyword or dialect outside this inspector’s supported profile.");
    }
    if (schema.type !== undefined) {
      const types = Array.isArray(schema.type) ? schema.type : [schema.type];
      if (!types.length || new Set(types).size !== types.length || types.some((type) => !TYPES.includes(type))) {
        fail("invalid", path, "Invalid JSON Schema type.");
      }
    }
    if (schema.required !== undefined && (!Array.isArray(schema.required) ||
        schema.required.some((key) => typeof key !== "string") || new Set(schema.required).size !== schema.required.length)) {
      fail("invalid", path, "Required must contain unique property names.");
    }
    if (schema.enum !== undefined && (!Array.isArray(schema.enum) || !schema.enum.length)) {
      fail("invalid", path, "Enum must contain at least one option.");
    }
    for (const key of ["minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "minItems", "maxItems", "minLength", "maxLength"]) {
      if (schema[key] !== undefined && (!Number.isFinite(schema[key]) ||
          (/Items|Length/.test(key) && (!Number.isInteger(schema[key]) || schema[key] < 0)))) {
        fail("invalid", path, "A schema constraint has an invalid numeric bound.");
      }
    }
    for (const group of ["properties", "$defs"]) {
      if (schema[group] === undefined) continue;
      if (!record(schema[group])) fail("invalid", path, "Expected a schema map.");
      for (const [address, child] of Object.entries(schema[group])) visit(child, path + "/" + group + "/" + escapePointer(address), depth + 1);
    }
    for (const key of ["items", "additionalProperties", "not"]) {
      if (schema[key] !== undefined) visit(schema[key], path + "/" + key, depth + 1);
    }
    for (const group of ["allOf", "anyOf", "oneOf"]) {
      if (schema[group] === undefined) continue;
      if (!Array.isArray(schema[group]) || !schema[group].length) fail("invalid", path, "Expected a nonempty list of schemas.");
      schema[group].forEach((child, i) => visit(child, path + "/" + group + "/" + i, depth + 1));
    }
    if (schema.$ref !== undefined) visit(localRef(root, schema.$ref), path, depth + 1);
  };
  try {
    if (objectRoot && (!record(root) || root.type !== "object")) fail("invalid", "", "MCP tool schemas must declare an object root.");
    visit(root, "", 0);
    return { status: "valid", issues: [] };
  } catch (error) {
    if (!error.status) throw error;
    return { status: error.status, issues: [{ path: error.path, message: error.message }] };
  }
}

function equal(a, b, depth = 0) {
  if (depth > 64) fail("unsupported", "", "Enum or constant comparison exceeds the nesting limit.");
  if (a === b) return true;
  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((item, i) => equal(item, b[i], depth + 1));
  return record(a) && record(b) && Object.keys(a).length === Object.keys(b).length &&
    Object.keys(a).every((key) => Object.hasOwn(b, key) && equal(a[key], b[key], depth + 1));
}

export function validateValue(schema, value, declaration = checkSchema(schema)) {
  if (declaration.status !== "valid") return declaration;
  let budget = 12_000;
  const visit = (rule, data, path, depth) => {
    if (--budget < 0 || depth > 64) fail("unsupported", path, "Validation exceeded its recursion or work limit.");
    const issue = (message) => ({ path, message });
    if (typeof rule === "boolean") return rule ? null : issue("Value is forbidden by the schema.");
    const test = (sub, v = data, p = path) => visit(sub, v, p, depth + 1);
    const type = data === null ? "null" : Array.isArray(data) ? "array" :
      typeof data === "number" && Number.isInteger(data) ? "integer" : typeof data;
    if (rule.type !== undefined && ![rule.type].flat().some((allowed) => allowed === type || (allowed === "number" && type === "integer"))) {
      return issue("Expected " + [rule.type].flat().join(" or ") + ".");
    }
    if (Object.hasOwn(rule, "const") && !equal(data, rule.const)) return issue("Value differs from the declared constant.");
    if (rule.enum && !rule.enum.some((allowed) => equal(data, allowed))) return issue("Value is outside the declared enum.");
    if (rule.$ref !== undefined) {
      const result = test(localRef(schema, rule.$ref));
      if (result) return result;
    }
    if (rule.allOf) for (const sub of rule.allOf) {
      const result = test(sub);
      if (result) return result;
    }
    if (rule.anyOf && !rule.anyOf.some((sub) => !test(sub))) return issue("No anyOf alternative matched.");
    if (rule.oneOf && rule.oneOf.filter((sub) => !test(sub)).length !== 1) return issue("Expected exactly one matching alternative.");
    if (rule.not !== undefined && !test(rule.not)) return issue("Value matched a prohibited schema.");
    if (typeof data === "number" && (data < rule.minimum || data > rule.maximum ||
        data <= rule.exclusiveMinimum || data >= rule.exclusiveMaximum)) return issue("Value is outside the declared numeric bounds.");
    if (typeof data === "string") {
      const length = [...data].length;
      if (length < rule.minLength || length > rule.maxLength) return issue("Text is outside the declared length bounds.");
    }
    if (Array.isArray(data)) {
      if (data.length < rule.minItems || data.length > rule.maxItems) return issue("Array is outside the declared item bounds.");
      if (rule.items !== undefined) for (let i = 0; i < data.length; i++) {
        const result = test(rule.items, data[i], path + "/" + i);
        if (result) return result;
      }
    }
    if (record(data)) {
      const missing = rule.required?.find((key) => !Object.hasOwn(data, key));
      if (missing !== undefined) return { path: path + "/" + escapePointer(missing), message: "Required field is missing." };
      for (const [key, item] of Object.entries(data)) {
        const sub = rule.properties && Object.hasOwn(rule.properties, key) ? rule.properties[key] : rule.additionalProperties;
        if (sub !== undefined) {
          const result = test(sub, item, path + "/" + escapePointer(key));
          if (result) return result;
        }
      }
    }
    return null;
  };
  try {
    const issue = visit(schema, value, "", 0);
    return issue ? { status: "invalid", issues: [issue] } : { status: "valid", issues: [] };
  } catch (error) {
    if (!error.status) throw error;
    return { status: error.status, issues: [{ path: error.path, message: error.message }] };
  }
}
