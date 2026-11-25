// GitHub composite action entrypoint. Parses inputs into CLI arguments without
// shell interpolation, preserving Doctor's read-only execution guarantee.
import { pathToFileURL } from "node:url";
import { main } from "../../cli/wmcp.mjs";

export function actionArgs(env) {
  const endpoint = String(env.WMCP_DOCTOR_ENDPOINT || "").trim();
  const page = String(env.WMCP_DOCTOR_PAGE || "").trim();
  if (endpoint && page) throw Error("Set either endpoint or page");
  if (!endpoint && !page) throw Error("Missing required endpoint or page input");
  if ((endpoint || page).startsWith("-")) throw Error("endpoint or page must be a URL");
  const strict = String(env.WMCP_DOCTOR_STRICT ?? "true").trim().toLowerCase();
  if (strict !== "true" && strict !== "false") throw Error("strict must be true or false");
  const baseline = String(env.WMCP_DOCTOR_BASELINE || "").trim();
  // Never pass authorization secrets as command-line arguments or outputs.
  const args = page ? ["doctor", "web", page] : ["doctor", endpoint];
  const preview = String(env.WMCP_DOCTOR_ALLOW_PREVIEW ?? "false").trim().toLowerCase();
  if (preview !== "true" && preview !== "false") throw Error("allow-preview-origin must be true or false");
  const browserFlags = [
    ["--pair", env.WMCP_DOCTOR_PAIR],
    ["--chrome", env.WMCP_DOCTOR_CHROME],
    ["--wait-ms", env.WMCP_DOCTOR_WAIT],
  ];
  if (!page && (preview === "true" || browserFlags.some(([, value]) => value))) throw Error("Browser inputs require page");
  if (page && env.WMCP_API_KEY) throw Error("auth-token is available only for the endpoint check");
  for (const [flag, value] of browserFlags) {
    const argument = String(value ?? "").trim();
    if (argument.startsWith("-")) throw Error(`${flag} needs a value`);
    if (argument) args.push(flag, argument);
  }
  if (baseline.startsWith("-")) throw Error("baseline must be a file path");
  if (preview === "true") args.push("--allow-preview-origin");
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
