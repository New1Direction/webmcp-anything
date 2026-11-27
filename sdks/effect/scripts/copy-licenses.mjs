import { copyFile } from "node:fs/promises";

await copyFile("../../LICENSE", "dist/LICENSE");
await copyFile("node_modules/@w3c/webmcp-polyfill/LICENSE", "dist/selector/LICENSE-webmcp-polyfill");
