const SCHEMA_VALUES = [
  "additionalProperties", "unevaluatedProperties", "items", "unevaluatedItems", "contains",
  "propertyNames", "not", "if", "then", "else", "contentSchema",
];
const SCHEMA_MAPS = ["properties", "patternProperties", "dependentSchemas"];
const SCHEMA_ARRAYS = ["allOf", "anyOf", "oneOf", "prefixItems"];
const SCHEMA_KEYWORDS = [
  "type", "enum", "const", "required", "dependentRequired", "format", "pattern",
  "maximum", "minimum", "exclusiveMaximum", "exclusiveMinimum", "multipleOf",
  "maxLength", "minLength", "maxItems", "minItems", "uniqueItems", "maxContains", "minContains",
  "maxProperties", "minProperties", "contentEncoding", "contentMediaType", "readOnly", "writeOnly",
  "title", "description",
];
const TYPES = new Set(["object", "array", "boolean", "integer", "null", "number", "string"]);
const DRAFT = "https://json-schema.org/draft/2020-12/schema";

export const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
export const pointerPart = (value) => value.replace(/~/g, "~0").replace(/\//g, "~1");
export const toolName = (value) => typeof value === "string" && /^[A-Za-z0-9_.-]{1,128}$/.test(value);

export function localReference(document, ref) {
  if (typeof ref !== "string" || !ref.startsWith("#/")) {
    throw Error("Only local JSON Pointer references are supported");
  }
  let value = document;
  const parts = decodeURIComponent(ref.slice(2)).split("/");
  for (const part of parts) {
    const key = part.replace(/~1/g, "/").replace(/~0/g, "~");
    if (!value || typeof value !== "object" || !Object.hasOwn(value, key)) throw Error("Unresolved local reference");
    value = value[key];
  }
  return value;
}

export function createSchemaCompiler(document, { openApi30 = false } = {}) {
  const definitions = new Map();
  const references = new Map();
  const visit = (value, depth = 0) => {
    if (typeof value === "boolean") return value;
    if (!record(value) || depth > 80) throw Error("Expected a JSON Schema object or boolean within the nesting limit");
    if (["$id", "$anchor", "$dynamicAnchor", "$dynamicRef", "$recursiveRef", "$recursiveAnchor", "dependencies", "additionalItems"].some((key) => Object.hasOwn(value, key)) ||
        (Object.hasOwn(value, "nullable") && !openApi30) ||
        (Object.hasOwn(value, "$schema") && value.$schema !== DRAFT)) {
      throw Error("Unsupported JSON Schema dialect or reference scope");
    }
    const entries = new Map();
    if (Object.hasOwn(value, "$ref")) {
      const ref = value.$ref;
      if (!references.has(ref)) {
        if (references.size >= 256) throw Error("Too many schema references");
        const target = localReference(document, ref);
        const name = "schema" + references.size;
        references.set(ref, name);
        definitions.set(name, visit(target, depth + 1));
      }
      const reference = "#/$defs/" + references.get(ref);
      if (openApi30) return { $ref: reference };
      entries.set("$ref", reference);
    }
    if (Object.hasOwn(value, "type")) {
      const types = Array.isArray(value.type) ? value.type : [value.type];
      if ((openApi30 && (Array.isArray(value.type) || value.type === "null")) ||
          !types.length || types.some((type) => !TYPES.has(type)) || new Set(types).size !== types.length) {
        throw Error("Invalid JSON Schema type");
      }
    }
    for (const key of SCHEMA_KEYWORDS) {
      if (Object.hasOwn(value, key)) entries.set(key, value[key]);
    }
    if (openApi30) {
      if (value.nullable === true && entries.has("type")) entries.set("type", [value.type, "null"]);
      for (const [limit, exclusive] of [["minimum", "exclusiveMinimum"], ["maximum", "exclusiveMaximum"]]) {
        if (!entries.has(exclusive)) continue;
        entries.delete(exclusive);
        if (value[exclusive] === true) {
          if (typeof value[limit] !== "number") throw Error("Exclusive limit requires a documented numeric bound");
          entries.delete(limit);
          entries.set(exclusive, value[limit]);
        }
      }
    }
    for (const key of SCHEMA_VALUES) {
      if (Object.hasOwn(value, key)) entries.set(key, visit(value[key], depth + 1));
    }
    for (const key of SCHEMA_MAPS) {
      if (!Object.hasOwn(value, key)) continue;
      if (!record(value[key])) throw Error(key + " must be a JSON Schema map");
      entries.set(key, Object.fromEntries(Object.entries(value[key]).map(([name, child]) => [name, visit(child, depth + 1)])));
    }
    for (const key of SCHEMA_ARRAYS) {
      if (!Object.hasOwn(value, key)) continue;
      if (!Array.isArray(value[key])) throw Error(key + " must be a JSON Schema array");
      entries.set(key, value[key].map((child) => visit(child, depth + 1)));
    }
    return Object.fromEntries(entries);
  };
  return {
    compile: (schema) => visit(schema),
    finish: (root) => definitions.size ? { ...root, $defs: Object.fromEntries(definitions) } : root,
  };
}

export function materializeSchema(document, schema, options) {
  const compiler = createSchemaCompiler(document, options);
  return compiler.finish(compiler.compile(schema));
}

export function objectSchema(properties, required = []) {
  return { type: "object", properties, required, additionalProperties: false };
}

export function authorizationConditions(alternatives, effect, boundary) {
  return [
    { kind: "authentication", boundary, anyOf: alternatives },
    {
      kind: "user-authorization",
      when: effect === "write" ? "always" : "authenticated-use",
      scope: "this-capability-and-input",
    },
  ];
}
