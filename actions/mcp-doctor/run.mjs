// GitHub composite action entrypoint. Parses inputs into CLI arguments without
// shell interpolation, preserving Doctor's read-only execution guarantee.
import { pathToFileURL } from "node:url";
import { main } from "../../cli/wmcp.mjs";

export function actionArgs(env) {
  const endpoint = String(env.WMCP_DOCTOR_ENDPOINT || "").trim();
  if (!endpoint) throw Error("Missing required endpoint input");
  const strict = String(env.WMCP_DOCTOR_STRICT ?? "true").trim().toLowerCase();
  if (strict !== "true" && strict !== "false") throw Error("strict must be true or false");
  const baseline = String(env.WMCP_DOCTOR_BASELINE || "").trim();
  // Never pass authorization secrets as command-line arguments or outputs.
  const args = ["doctor", endpoint];
  if (strict === "true") args.push("--strict");
  if (baseline) args.push("--baseline", baseline);
  return args;
}

export async function actionRun(env = process.env, runCli = main) {
  try {
    const args = actionArgs(env);
    return await runCli(args, { apiKey: String(env.WMCP_API_KEY || "") });
  } catch (error) {
    console.error("WMCP Doctor action: " + String(error.message || error));
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await actionRun();
}
