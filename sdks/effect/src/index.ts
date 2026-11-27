import type { WebMCP } from "webmcp-types";
import { installWebMCP } from "./runtime.js";
export { installWebMCP };
import { Effect } from "effect";

/** Resolves the native context or installs the polyfill in a secure document. */
export const connect = Effect.try(() => {
  installWebMCP();
  const context = globalThis.document?.modelContext;
  if (!context) throw new Error("WebMCP requires a secure browser document");
  return context;
});

export type EffectTool<A, E> = Omit<WebMCP.ModelContextTool, "execute"> & {
  execute: (input: Record<string, unknown>) => Effect.Effect<A, E>;
};

/** Registers until the enclosing Effect scope closes. */
export function registerTool<A, E>(
  context: WebMCP.ModelContext,
  tool: EffectTool<A, E>,
  options?: Pick<WebMCP.ModelContextRegisterToolOptions, "exposedTo">,
) {
  return Effect.acquireRelease(
    Effect.tryPromise(async () => {
      const controller = new AbortController();
      try {
        await context.registerTool({
          ...tool,
          execute: (input, { signal }) => Effect.runPromise(tool.execute(input), { signal }),
        }, { ...options, signal: controller.signal });
        return controller;
      } catch (error) {
        controller.abort();
        throw error;
      }
    }),
    controller => Effect.sync(() => controller.abort()),
  ).pipe(Effect.asVoid);
}

export function getTools(context: WebMCP.ModelContext, options?: WebMCP.ModelContextGetToolOptions) {
  return Effect.tryPromise(() => context.getTools(options));
}

/** Returns the browser's serialized result. Interrupting the Effect cancels the call. */
export function executeTool(context: WebMCP.ModelContext, tool: WebMCP.Tool, input?: object) {
  return Effect.tryPromise(signal => context.executeTool(tool, input, { signal }));
}
