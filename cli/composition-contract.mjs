import { isDeepStrictEqual } from "node:util";
import { record, toolName } from "./compile-schema.mjs";

export const POINTER = /^(?:\/(?:[^/~]|~[01])*)*$/;
export const isPointer = (value) => typeof value === "string" && POINTER.test(value);
export const keysAt = (pointer) => pointer ? pointer.slice(1).split("/").map((key) => key.replace(/~1/g, "/").replace(/~0/g, "~")) : [];

export function valueAt(value, pointer) {
  for (const key of keysAt(pointer)) {
    if (value === null || typeof value !== "object" || !Object.hasOwn(value, key)) return undefined;
    value = value[key];
  }
  return value;
}

export function documentedSideEffect(declaration, effect, postconditions) {
  if (!record(declaration)) throw Error("Tool has no documented composition side effect");
  const states = postconditions.filter(({ kind }) => kind === "state");
  if (effect === "read" && declaration.kind === "none" && Object.keys(declaration).length === 1) {
    return { kind: "none" };
  }
  if (effect === "navigate" && declaration.kind === "navigate" && Object.keys(declaration).length === 2 &&
      states.length === 1 && states[0].state === declaration.state) return { ...declaration };
  if (effect === "write" && declaration.kind === "write" && Object.keys(declaration).length === 6 &&
      toolName(declaration.operation) && isPointer(declaration.target) && isPointer(declaration.resultTarget) &&
      isPointer(declaration.outcome) && Object.hasOwn(declaration, "value") && declaration.outcome !== declaration.resultTarget &&
      postconditions.some(({ kind, pointer, inputPointer }) => kind === "result-matches-input" &&
        pointer === declaration.resultTarget && inputPointer === declaration.target) &&
      postconditions.some(({ kind, pointer, value }) => kind === "result-equals" &&
        pointer === declaration.outcome && isDeepStrictEqual(value, declaration.value))) {
    return { ...declaration };
  }
  throw Error("Composition side effect lacks matching documented outcome evidence");
}
