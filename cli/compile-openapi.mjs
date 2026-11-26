import { authorizationConditions, createSchemaCompiler, localReference, materializeSchema, objectSchema, pointerPart, record, toolName } from "./compile-schema.mjs";

const METHODS = ["get", "head", "options", "post", "put", "patch", "delete", "trace"];
const SAFE_METHODS = new Set(["get", "head", "options", "trace"]);
const DRAFTS = new Set([
  "https://spec.openapis.org/oas/3.1/dialect/base",
  "https://json-schema.org/draft/2020-12/schema",
]);
const CREDENTIAL_HEADERS = new Set(["authorization", "proxy-authorization", "cookie", "set-cookie"]);
const RESERVED_HEADERS = new Set(["accept", "content-type"]);
const LOCATIONS = ["path", "query", "header", "cookie"];

function resolve(document, value) {
  const seen = new Set();
  while (record(value) && Object.hasOwn(value, "$ref")) {
    const ref = value.$ref;
    if (seen.has(ref) || seen.size >= 80) throw Error("Cyclic or overly deep OpenAPI reference");
    seen.add(ref);
    value = localReference(document, ref);
  }
  if (!record(value)) throw Error("Expected an OpenAPI object");
  return value;
}

function scheme(document, name, scopes) {
  const schemes = document.components?.securitySchemes;
  if (!record(schemes) || !Object.hasOwn(schemes, name)) throw Error("Undeclared OpenAPI security scheme");
  const definition = resolve(document, schemes[name]);
  if (!Array.isArray(scopes) || scopes.some((scope) => typeof scope !== "string")) throw Error("Invalid security scopes");
  const result = { scheme: name, type: definition.type, scopes };
  switch (definition.type) {
    case "apiKey":
      if (!["header", "query", "cookie"].includes(definition.in) || typeof definition.name !== "string" || !definition.name) {
        throw Error("Invalid API key location");
      }
      return { ...result, location: definition.in, parameter: definition.name };
    case "http":
      if (typeof definition.scheme !== "string" || !definition.scheme) throw Error("Invalid HTTP security scheme");
      return { ...result, protocol: definition.scheme };
    case "oauth2":
    case "openIdConnect":
    case "mutualTLS":
      return result;
    default:
      throw Error("Unsupported OpenAPI security scheme");
  }
}

function security(document, operation) {
  const requirements = Object.hasOwn(operation, "security") ? operation.security :
    Object.hasOwn(document, "security") ? document.security : [];
  if (!Array.isArray(requirements)) throw Error("Invalid OpenAPI security requirements");
  return (requirements.length ? requirements : [{}]).map((alternative) => {
    if (!record(alternative)) throw Error("Invalid OpenAPI security alternative");
    return { allOf: Object.entries(alternative).map(([name, scopes]) => scheme(document, name, scopes)) };
  });
}

function parameterKey(location, name) {
  return location + ":" + (location === "header" ? name.toLowerCase() : name);
}

function mediaTypes(content, compileSchema) {
  if (!record(content) || !Object.keys(content).length) throw Error("Expected documented content types");
  return Object.entries(content).map(([contentType, media]) => {
    if (!record(media)) throw Error("Invalid media type object");
    return {
      contentType,
      ...(Object.hasOwn(media, "schema") ? { schema: compileSchema(media.schema) } : {}),
    };
  });
}

function declaredCredentialParameters(document) {
  const result = new Set([...CREDENTIAL_HEADERS].map((header) => parameterKey("header", header)));
  for (const rawDefinition of Object.values(document.components?.securitySchemes ?? {})) {
    let definition;
    try { definition = resolve(document, rawDefinition); }
    catch { continue; }
    if (definition.type === "apiKey" && typeof definition.name === "string") {
      result.add(parameterKey(definition.in, definition.name));
    }
  }
  return result;
}

function parameterInputs(document, pathItem, operation, securityOptions, credentials, compileSchema) {
  const credentialsByAlternative = securityOptions.map(({ allOf }) => {
    const keys = new Set();
    for (const { type, location, parameter } of allOf) {
      if (type === "apiKey") keys.add(parameterKey(location, parameter));
      if (["http", "oauth2", "openIdConnect"].includes(type)) keys.add("header:authorization");
    }
    return keys;
  });

  const parameters = new Map();
  for (const list of [pathItem.parameters, operation.parameters]) {
    if (list === undefined) continue;
    if (!Array.isArray(list)) throw Error("OpenAPI parameters must be an array");
    const names = new Set();
    for (const value of list) {
      const parameter = resolve(document, value);
      if (typeof parameter.name !== "string" || !parameter.name || !LOCATIONS.includes(parameter.in)) {
        throw Error("Invalid documented parameter");
      }
      const key = parameterKey(parameter.in, parameter.name);
      if (names.has(key)) throw Error("Duplicate documented parameter");
      names.add(key);
      parameters.set(key, parameter);
    }
  }

  const sections = new Map();
  const bindings = [];
  for (const [key, parameter] of parameters) {
    const { in: location, name, style, explode } = parameter;
    if (credentials.has(key)) {
      if (parameter.required === true && credentialsByAlternative.some((alternative) => !alternative.has(key))) {
        throw Error("Required credential parameter is missing from a security alternative");
      }
      continue;
    }
    if (location === "header" && RESERVED_HEADERS.has(name.toLowerCase())) continue;
    if (location === "cookie") throw Error("Cookie parameters must be documented as a security scheme");
    const media = Object.hasOwn(parameter, "content") ? mediaTypes(parameter.content, compileSchema) : [];
    if (media.length > 1) throw Error("A parameter can specify only one content type");
    const schema = media.length ? media[0].schema : compileSchema(parameter.schema);
    if (schema === undefined) throw Error("Parameter content has no documented schema");
    if (!sections.has(location)) sections.set(location, { properties: new Map(), required: [] });
    const section = sections.get(location);
    section.properties.set(name, schema);
    if (parameter.required === true || location === "path") section.required.push(name);
    bindings.push({ in: location, name,
      ...(typeof style === "string" ? { style } : {}),
      ...(typeof explode === "boolean" ? { explode } : {}),
      ...(parameter.allowReserved === true ? { allowReserved: true } : {}),
      ...(media.length ? { contentType: media[0].contentType } : {}),
    });
  }
  return { sections, bindings };
}

function inputSchema(document, operation, sections, compileSchema) {
  const properties = new Map();
  const required = [];
  for (const [location, section] of sections) {
    properties.set(location, objectSchema(Object.fromEntries(section.properties), section.required));
    if (section.required.length) required.push(location);
  }
  if (Object.hasOwn(operation, "requestBody")) {
    const body = resolve(document, operation.requestBody);
    const variants = mediaTypes(body.content, compileSchema).map(({ contentType, schema }) => {
      if (schema === undefined) throw Error("Request body has no documented schema");
      return objectSchema({ contentType: { const: contentType }, value: schema }, ["contentType", "value"]);
    });
    properties.set("body", variants.length === 1 ? variants[0] : { oneOf: variants });
    if (body.required === true) required.push("body");
  }
  return objectSchema(Object.fromEntries(properties), required);
}

function responses(document, operation, schemaOptions) {
  if (!record(operation.responses)) throw Error("No documented HTTP responses");
  const success = Object.keys(operation.responses).filter((status) => /^2(?:[0-9]{2}|XX)$/.test(status)).sort();
  if (!success.length) throw Error("No documented 2xx response to use as a postcondition");
  return success.map((status) => {
    const response = resolve(document, operation.responses[status]);
    return {
      status,
      ...(status === "2XX" ? { exceptStatuses: success.filter((item) => item !== "2XX") } : {}),
      ...(Object.hasOwn(response, "content") ? {
        media: mediaTypes(response.content, (schema) => materializeSchema(document, schema, schemaOptions)),
      } : {}),
    };
  });
}

function servers(document, pathItem, operation) {
  const selected = operation.servers ?? pathItem.servers ?? document.servers ?? [];
  if (!Array.isArray(selected)) throw Error("Invalid OpenAPI servers");
  if (!selected.length) return ["/"];
  return selected.map((server) => {
    if (!record(server) || typeof server.url !== "string" || !server.url || /[\s\\?#]/.test(server.url)) {
      throw Error("Server URL must omit credentials, query strings and fragments");
    }
    const probe = new URL(server.url.replace(/\{[^{}]+\}/g, "placeholder"), "https://relative.invalid");
    if (!["https:", "http:"].includes(probe.protocol) || probe.username || probe.password ||
        server.url.startsWith("//")) {
      throw Error("Server URL must be an HTTP(S) URL or a relative path without credentials");
    }
    return server.url;
  });
}

export function compileOpenApi(document) {
  if (typeof document.openapi !== "string" || !/^3\.[01]\.\d+$/.test(document.openapi) ||
      (Object.hasOwn(document, "jsonSchemaDialect") && !DRAFTS.has(document.jsonSchemaDialect))) {
    throw Error("The capability compiler supports OpenAPI 3.0 and 3.1 JSON with the standard schema dialect");
  }
  if (!record(document.paths) || typeof document.info?.title !== "string" || !document.info.title.trim()) {
    throw Error("OpenAPI requires an info title and a paths object");
  }
  const schemaOptions = { openApi30: document.openapi.startsWith("3.0.") };
  const credentials = declaredCredentialParameters(document);
  const tools = [];
  const diagnostics = [];
  for (const [path, rawItem] of Object.entries(document.paths)) {
    if (path.startsWith("x-")) continue;
    const pathPointer = "#/paths/" + pointerPart(path);
    try {
      if (!path.startsWith("/") || path.startsWith("//") || /[\s\\?#]/.test(path)) throw Error("Invalid OpenAPI path");
      const item = resolve(document, rawItem);
      for (const method of METHODS) {
        if (!Object.hasOwn(item, method)) continue;
        const source = pathPointer + "/" + method;
        try {
          const operation = item[method];
          if (!record(operation)) throw Error("Invalid operation object");
          const name = operation.operationId ?? (method + path.replace(/[^A-Za-z0-9]+/g, "_").replace(/_$/, ""));
          if (!toolName(name)) throw Error("Operation requires a valid, stable tool name");
          const alternatives = security(document, operation);
          const effect = SAFE_METHODS.has(method) ? "read" : "write";
          const schemas = createSchemaCompiler(document, schemaOptions);
          const { sections, bindings } = parameterInputs(document, item, operation, alternatives, credentials, schemas.compile);
          for (const [, parameter] of path.matchAll(/\{([^{}]+)\}/g)) {
            if (!sections.get("path")?.properties.has(parameter)) throw Error("Path template parameter has no documented schema");
          }
          const description = [operation.summary, operation.description].find((value) => typeof value === "string" && value.trim());
          const tags = operation.tags;
          if (tags !== undefined && (!Array.isArray(tags) || tags.some((tag) => typeof tag !== "string" || !tag.trim()))) {
            throw Error("Invalid OpenAPI operation tags");
          }
          tools.push({
            name,
            description: description ?? method.toUpperCase() + " " + path,
            ...(tags?.length ? { tags } : {}),
            effect,
            source,
            interface: { kind: "http", method: method.toUpperCase(), path, servers: servers(document, item, operation), parameters: bindings },
            inputSchema: schemas.finish(inputSchema(document, operation, sections, schemas.compile)),
            preconditions: [{ kind: "input-schema" }, ...authorizationConditions(alternatives, effect, "trusted-server-origin")],
            postconditions: [{ kind: "http-response", alternatives: responses(document, operation, schemaOptions) }],
          });
        } catch (error) {
          diagnostics.push({ source, reason: error.message });
        }
      }
    } catch (error) {
      diagnostics.push({ source: pathPointer, reason: error.message });
    }
  }
  const counts = new Map();
  for (const { name } of tools) counts.set(name, (counts.get(name) ?? 0) + 1);
  const unique = tools.filter(({ name, source }) => {
    if (counts.get(name) === 1) return true;
    diagnostics.push({ source, reason: "Ambiguous tool name" });
    return false;
  });
  return {
    source: { kind: "openapi", title: document.info.title },
    states: [],
    navigation: [],
    tools: unique,
    diagnostics,
  };
}
