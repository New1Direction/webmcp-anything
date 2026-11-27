import { Effect } from "effect";
import { connect, executeTool, getTools, registerTool } from "@wmcp/browser/effect";

export const check = Effect.runPromise(Effect.gen(function* () {
  const context = yield* connect;
  yield* Effect.scoped(Effect.gen(function* () {
    yield* registerTool(context, {
      name: "page_title",
      description: "Read the current page title",
      execute: () => Effect.sync(() => ({ title: document.title })),
    });
    const tool = (yield* getTools(context)).find(tool => tool.name === "page_title");
    if (!tool) throw new Error("Missing registration");
    const result = JSON.parse(yield* executeTool(context, tool));
    if (result.title !== document.title) throw new Error("Unexpected result");
  }));
  if ((yield* getTools(context)).some(tool => tool.name === "page_title")) {
    throw new Error("Registration survived scope cleanup");
  }
}));
