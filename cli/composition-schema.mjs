import { isDeepStrictEqual } from "node:util";
import { localReference, pointerPart, record } from "./compile-schema.mjs";
import { keysAt } from "./composition-contract.mjs";

const TYPES = ["null", "boolean", "string", "integer", "number", "object", "array"];
const ANNOTATIONS = ["title", "description", "$defs", "readOnly", "writeOnly"];
const TYPE_KEYS = {
  null: [], boolean: [],
  string: ["minLength", "maxLength"],
  integer: ["minimum", "maximum"],
  number: ["minimum", "maximum"],
  object: ["properties", "required", "additionalProperties"],
  array: ["items", "minItems", "maxItems"],
};

export function compositionSchema(root) {
  const visit = (schema, depth, references) => {
    if (!record(schema) || depth > 60) throw Error("Unsupported composition schema");
    if (Object.hasOwn(schema, "$ref")) {
      if (references.has(schema.$ref) || Object.keys(schema).some((key) => key !== "$ref" && !ANNOTATIONS.includes(key))) {
        throw Error("Unsupported schema reference for composition");
      }
      return visit(localReference(root, schema.$ref), depth + 1, new Set(references).add(schema.$ref));
    }
    const type = schema.type;
    if (!TYPES.includes(type) || Object.keys(schema).some((key) =>
      !["type", "const", "enum", ...ANNOTATIONS, ...TYPE_KEYS[type]].includes(key))) {
      throw Error("Unsupported composition schema keyword or type");
    }
    const normalized = { type };
    for (const key of TYPE_KEYS[type].filter((key) => /^(min|max)/.test(key))) {
      if (!Object.hasOwn(schema, key)) continue;
      if (!Number.isFinite(schema[key]) || (["string", "array"].includes(type) &&
          (!Number.isSafeInteger(schema[key]) || schema[key] < 0))) throw Error("Invalid composition schema bound");
      normalized[key] = schema[key];
    }
    for (const [lower, upper] of [["minimum", "maximum"], ["minLength", "maxLength"], ["minItems", "maxItems"]]) {
      if (normalized[lower] > normalized[upper]) throw Error("Composition schema has contradictory bounds");
    }
    if (type === "object") {
      const { properties = {}, required = [], additionalProperties = true } = schema;
      if (!record(properties) || !Array.isArray(required) || typeof additionalProperties !== "boolean" ||
          required.some((name) => typeof name !== "string" || !Object.hasOwn(properties, name))) {
        throw Error("Unsupported object shape for composition");
      }
      normalized.properties = Object.fromEntries(Object.entries(properties)
        .map(([key, child]) => [key, visit(child, depth + 1, references)]));
      normalized.required = [...new Set(required)];
      normalized.additionalProperties = additionalProperties;
    }
    if (type === "array" && Object.hasOwn(schema, "items")) normalized.items = visit(schema.items, depth + 1, references);
    if (Object.hasOwn(schema, "const")) normalized.const = schema.const;
    if (Object.hasOwn(schema, "enum")) {
      if (!Array.isArray(schema.enum) || !schema.enum.length) throw Error("Invalid composition schema enum");
      normalized.enum = schema.enum;
    }
    return normalized;
  };
  return visit(root, 0, new Set());
}

export function schemaAt(schema, pointer) {
  for (const part of keysAt(pointer)) {
    if (schema?.type !== "object" || !Object.hasOwn(schema.properties, part)) return undefined;
    schema = schema.properties[part];
  }
  return schema;
}

export function matches(schema, value) {
  if (Object.hasOwn(schema, "const") && !isDeepStrictEqual(schema.const, value)) return false;
  if (schema.enum && !schema.enum.some((item) => isDeepStrictEqual(item, value))) return false;
  switch (schema.type) {
    case "null": return value === null;
    case "boolean": return typeof value === "boolean";
    case "string": {
      if (typeof value !== "string") return false;
      const size = [...value].length;
      return size >= (schema.minLength ?? 0) && size <= (schema.maxLength ?? Infinity);
    }
    case "number":
    case "integer": return Number.isFinite(value) && (schema.type !== "integer" || Number.isSafeInteger(value)) &&
      value >= (schema.minimum ?? -Infinity) && value <= (schema.maximum ?? Infinity);
    case "array": return Array.isArray(value) && value.length >= (schema.minItems ?? 0) &&
      value.length <= (schema.maxItems ?? Infinity) && (!schema.items || value.every((item) => matches(schema.items, item)));
    case "object": return record(value) && schema.required.every((key) => Object.hasOwn(value, key)) &&
      Object.entries(value).every(([key, property]) => Object.hasOwn(schema.properties, key)
        ? matches(schema.properties[key], property) : schema.additionalProperties);
    default: return false;
  }
}

export function preserves(source, target) {
  if (source.type !== target.type) return false;
  if (Object.hasOwn(source, "const")) return matches(source, source.const) && matches(target, source.const);
  if (source.enum) {
    const possible = source.enum.filter((value) => matches(source, value));
    return possible.length > 0 && possible.every((value) => matches(target, value));
  }
  if (target.enum || Object.hasOwn(target, "const")) return false;
  for (const [lower, upper, floor] of [["minimum", "maximum", -Infinity], ["minLength", "maxLength", 0], ["minItems", "maxItems", 0]]) {
    if ((source[lower] ?? floor) < (target[lower] ?? floor) ||
        (source[upper] ?? Infinity) > (target[upper] ?? Infinity)) return false;
  }
  if (source.type === "array") return !target.items || Boolean(source.items && preserves(source.items, target.items));
  if (source.type !== "object") return true;
  if (source.additionalProperties && !target.additionalProperties) return false;
  if (target.required.some((key) => !source.required.includes(key))) return false;
  for (const [key, property] of Object.entries(target.properties)) {
    if (!Object.hasOwn(source.properties, key)) {
      if (source.additionalProperties) return false;
    } else if (!preserves(source.properties[key], property)) return false;
  }
  return target.additionalProperties || Object.keys(source.properties).every((key) => Object.hasOwn(target.properties, key));
}

export function assertInputCoverage(schema, pointers, path = "") {
  if (pointers.includes(path)) {
    if (pointers.length > 1) throw Error("Overlapping input bindings at " + (path || "/"));
    return;
  }
  if (schema.type !== "object" || schema.enum || Object.hasOwn(schema, "const")) throw Error("Missing or unsupported argument binding at " + (path || "/"));
  for (const [field, child] of Object.entries(schema.properties)) {
    const prefix = path + "/" + pointerPart(field);
    const relevant = pointers.filter((pointer) => pointer === prefix || pointer.startsWith(prefix + "/"));
    if (relevant.length || schema.required.includes(field)) assertInputCoverage(child, relevant, prefix);
  }
}
