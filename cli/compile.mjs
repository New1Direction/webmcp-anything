import { closeSync, constants, fstatSync, openSync, readSync } from "node:fs";
import { authorizationConditions, materializeSchema, record, toolName } from "./compile-schema.mjs";
import { compileOpenApi } from "./compile-openapi.mjs";
import { validateEndpoint } from "./mcp-read.mjs";
import { documentedSideEffect } from "./composition-contract.mjs";

const SITE_VERSION = "wmcp-site/v1";
const MAX_SOURCE_BYTES = 2_000_000;
const LANDMARK_ROLES = new Set([
  "banner", "complementary", "contentinfo", "form", "main", "navigation", "region", "search",
]);
const EFFECTS = new Set(["read", "write", "navigate"]);
const ACCESS = new Set(["public", "session"]);
const POINTER = /^(?:\/(?:[^/~]|~[01])*)*$/;

const text = (value) => typeof value === "string" && !!value.trim();
const atPath = (path) => typeof path === "string" && path.startsWith("/") &&
  !path.startsWith("//") && !/[\\?#\s{}]/.test(path) &&
  new URL(path, "https://site.invalid").pathname === path;

function optionalList(value, field) {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw Error(field + " must be an array");
  return value;
}

function parseStates(document) {
  if (!Array.isArray(document.states) || !document.states.length) throw Error("Site must document at least one state");
  const states = new Map();
  const markersByPath = new Map();
  for (const state of document.states) {
    if (!record(state) || !toolName(state.id) || !text(state.title) ||
        !atPath(state.path) || !ACCESS.has(state.access) ||
        (state.marker !== undefined && !text(state.marker))) {
      throw Error("Each state requires an id, title, same-origin path and explicit access");
    }
    if (states.has(state.id)) throw Error("Duplicate site state id");
    const markers = markersByPath.get(state.path) ?? new Set();
    if (markers.has(state.marker) || (markers.size && state.marker === undefined) || markers.has(undefined)) {
      throw Error("States sharing a path require distinct DOM markers");
    }
    markers.add(state.marker);
    markersByPath.set(state.path, markers);
    const landmarks = optionalList(state.landmarks, "State landmarks").map((landmark) => {
      if (!record(landmark) || !LANDMARK_ROLES.has(landmark.role) ||
          (landmark.name !== undefined && !text(landmark.name))) throw Error("Invalid state landmark");
      return { role: landmark.role, ...(landmark.name === undefined ? {} : { name: landmark.name }) };
    });
    states.set(state.id, {
      id: state.id,
      title: state.title,
      path: state.path,
      access: state.access,
      ...(state.marker === undefined ? {} : { marker: state.marker }),
      landmarks,
    });
  }
  return states;
}

function parseNavigation(document, states) {
  const links = new Set();
  return document.states.flatMap((state) => optionalList(state.links, "State links").map((link) => {
    if (!record(link) || !text(link.label) || !states.has(link.to)) throw Error("Link requires a label and a documented destination state");
    const key = JSON.stringify([state.id, link.to, link.label]);
    if (links.has(key)) throw Error("Duplicate documented link");
    links.add(key);
    return { from: state.id, to: link.to, label: link.label };
  }));
}

function domPrecondition(value) {
  if (!record(value) || !["visible", "enabled"].includes(value.kind) || !text(value.selector)) {
    throw Error("Expected a visible or enabled DOM precondition with a selector");
  }
  return { kind: "dom-" + value.kind, selector: value.selector };
}

function postcondition(value, states) {
  if (!record(value)) throw Error("Expected an observable postcondition");
  switch (value.kind) {
    case "state":
      if (states.has(value.state)) return { kind: "state", state: value.state };
      break;
    case "dom-visible":
      if (text(value.selector)) return { kind: value.kind, selector: value.selector };
      break;
    case "dom-count-increased":
      if (text(value.selector) && Number.isSafeInteger(value.by) && value.by > 0) {
        return { kind: value.kind, selector: value.selector, by: value.by };
      }
      break;
    case "result-schema":
      if (record(value.schema)) return { kind: value.kind, schema: materializeSchema(value.schema, value.schema) };
      break;
    case "result-matches-input":
      if (typeof value.pointer === "string" && POINTER.test(value.pointer) &&
          typeof value.inputPointer === "string" && POINTER.test(value.inputPointer)) {
        return { kind: value.kind, pointer: value.pointer, inputPointer: value.inputPointer };
      }
      break;
    case "result-equals":
      if (typeof value.pointer === "string" && POINTER.test(value.pointer) && Object.hasOwn(value, "value")) {
        return { kind: value.kind, pointer: value.pointer, value: value.value };
      }
      break;
  }
  throw Error("Invalid or unsupported observable postcondition");
}

function compileSite(document) {
  if (!record(document.site) || !text(document.site.title)) throw Error("Site requires a title and an origin");
  const origin = new URL(validateEndpoint(document.site.origin));
  if (origin.pathname !== "/" || /[?#]/.test(origin.href)) throw Error("Site origin must omit path, query and fragment");
  const states = parseStates(document);
  if (!states.has(document.site.entryState)) throw Error("Site requires a documented entry state");
  const navigation = parseNavigation(document, states);
  const names = new Set();
  const tools = optionalList(document.actions, "Site actions").map((action, index) => {
    const source = "#/actions/" + index;
    try {
      if (!record(action) || !toolName(action.name) || !text(action.description) ||
          (Object.hasOwn(action, "title") && !text(action.title)) ||
          !states.has(action.state) || !ACCESS.has(action.access) || !EFFECTS.has(action.effect)) {
        throw Error("Action requires a name, description, documented state, access and effect");
      }
      if (names.has(action.name)) throw Error("Duplicate site action name");
      names.add(action.name);
      const permissions = optionalList(action.permissions, "Session permissions");
      if (permissions.some((name) => !text(name)) || new Set(permissions).size !== permissions.length ||
          (permissions.length && action.access !== "session")) {
        throw Error("Permissions must be unique strings on a session action");
      }
      if (!record(action.inputSchema) || action.inputSchema.type !== "object") {
        throw Error("Action inputSchema must declare type object");
      }
      const inputSchema = materializeSchema(action.inputSchema, action.inputSchema);
      const postconditions = optionalList(action.postconditions, "Action postconditions")
        .map((condition) => postcondition(condition, states));
      if (!postconditions.length) throw Error("Action requires an observable postcondition");
      const destinations = postconditions.filter(({ kind }) => kind === "state");
      if (destinations.length > 1 || (action.effect === "navigate" && !destinations.length)) {
        throw Error("A navigation action requires one documented destination state");
      }
      if (action.effect === "read" && destinations.some(({ state }) => state !== action.state)) {
        throw Error("A read action cannot transition to a different state");
      }
      const sessionState = states.get(action.state).access === "session" ||
        destinations.some(({ state }) => states.get(state).access === "session");
      if (sessionState && action.access !== "session") throw Error("Action cannot declare public access to a session state");
      const allOf = action.access === "session" ? [{ type: "site-session", permissions }] : [];
      return {
        name: action.name,
        ...(action.title === undefined ? {} : { title: action.title }),
        description: action.description,
        source,
        effect: action.effect,
        ...(Object.hasOwn(action, "sideEffect") ? {
          sideEffect: documentedSideEffect(action.sideEffect, action.effect, postconditions),
        } : {}),
        interface: { kind: "webmcp", origin: origin.origin, name: action.name },
        inputSchema,
        preconditions: [
          { kind: "input-schema" },
          { kind: "state", state: action.state },
          ...authorizationConditions([{ allOf }], action.effect, origin.origin),
          ...optionalList(action.preconditions, "Action preconditions").map(domPrecondition),
        ],
        postconditions,
      };
    } catch (error) {
      throw Error(source + ": " + error.message);
    }
  });
  return {
    source: { kind: "site", title: document.site.title, origin: origin.origin },
    entryState: document.site.entryState,
    states: [...states.values()],
    navigation,
    tools,
    diagnostics: [],
  };
}

export function compileCapabilities(document) {
  if (!record(document)) throw Error("Expected an OpenAPI or WMCP site JSON object");
  const result = document.schemaVersion === SITE_VERSION ? compileSite(document) :
    Object.hasOwn(document, "openapi") ? compileOpenApi(document) : null;
  if (!result) throw Error("Expected OpenAPI 3.0/3.1 or " + SITE_VERSION + " JSON");
  return {
    schemaVersion: "wmcp-capabilities/v1",
    execution: "specification-only",
    complete: result.diagnostics.length === 0,
    ...result,
  };
}

export function readLocalJson(path, label = "Compiler source", maxBytes = MAX_SOURCE_BYTES) {
  const file = openSync(path, constants.O_RDONLY | constants.O_NONBLOCK);
  try {
    const stat = fstatSync(file);
    if (!stat.isFile() || stat.size > maxBytes) {
      throw Error(label + " must be a local JSON file no larger than " + maxBytes + " bytes");
    }
    const buffer = Buffer.alloc(maxBytes + 1);
    let bytes = 0;
    while (bytes < buffer.length) {
      const count = readSync(file, buffer, bytes, buffer.length - bytes, null);
      if (!count) break;
      bytes += count;
    }
    if (bytes > maxBytes) throw Error(label + " exceeds the file size limit");
    try { return JSON.parse(buffer.toString("utf8", 0, bytes)); }
    catch { throw Error(label + " contains invalid JSON"); }
  } finally {
    closeSync(file);
  }
}

export function compileFile(path) {
  return compileCapabilities(readLocalJson(path));
}
