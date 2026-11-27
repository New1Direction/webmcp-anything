"""Compare self-installing bundles: CORE W3C CHROME [ZIG [RUST]]."""

import argparse
import gzip
import hashlib
import json
import platform
import statistics
from pathlib import Path
from playwright.sync_api import sync_playwright

WORKLOAD = """async () => {
  const ctx = document.modelContext;
  const count = 32;
  const sample = async (iterations, action) => {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) await action(i);
    return 1000 * (performance.now() - start) / iterations;
  };
  const controllers = Array.from({length: count}, () => new AbortController());
  const register = await sample(count, i => ctx.registerTool({
    name: 'tool_' + i, description: 'Echo a number',
    inputSchema: {type:'object', properties:{n:{type:'number'}}},
    execute: ({n}) => ({n})
  }, {signal: controllers[i].signal}));
  const tools = await ctx.getTools();
  if (tools.length !== count) throw Error('Registration count mismatch');
  const handle = tools.find(t => t.name === 'tool_0');
  const discover = await sample(100, () => ctx.getTools());
  const execute = await sample(500, async i => {
    if (JSON.parse(await ctx.executeTool(handle, {n:i})).n !== i) throw Error('Wrong result');
  });
  controllers.forEach(controller => controller.abort());
  if ((await ctx.getTools()).length) throw Error('Cleanup failed');
  return {register, discover, execute};
}"""

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ("core", "w3c", "chrome"):
        parser.add_argument(name)
    parser.add_argument("zig", nargs="?")
    parser.add_argument("rust", nargs="?")
    parser.add_argument("--json", type=Path, help="Save individual trial timings and bundle metadata")
    args = parser.parse_args()
    core, w3c, chrome = args.core, args.w3c, args.chrome
    extras = [p for p in (args.zig, args.rust) if p]
    paths = {"Browser core": Path(core), "W3C": Path(w3c)}
    for label, bundle in zip(("Core + Zig", "Core + Rust"), extras):
        paths[label] = Path(bundle)
    results = {label: [] for label in paths}
    with sync_playwright() as pw:
        with pw.chromium.launch(executable_path=chrome, args=["--disable-features=WebMCP"]) as browser:
            version = browser.version
            print("Chrome", version)
            for pair in range(12):
                labels = list(paths)
                offset = pair % len(labels)
                order = labels[offset:] + labels[:offset]
                for label in order:
                    page = browser.new_page()
                    page.route("http://localhost/**", lambda r: r.fulfill(
                        content_type="text/html", body="<title>benchmark</title>",
                        headers={"Cross-Origin-Opener-Policy": "same-origin",
                                 "Cross-Origin-Embedder-Policy": "require-corp"}))
                    page.goto("http://localhost/")
                    assert page.evaluate("isSecureContext && !('modelContext' in document)")
                    page.add_script_tag(path=paths[label])
                    page.evaluate(WORKLOAD)
                    results[label].append(page.evaluate(WORKLOAD))
                    page.close()
    report = {"chrome": version, "platform": platform.system(), "architecture": platform.machine(),
              "timing_unit": "microseconds per operation", "bundles": {}}
    for label, samples in results.items():
        bundle = paths[label].read_bytes()
        report["bundles"][label] = {"bytes": len(bundle), "gzip_bytes": len(gzip.compress(bundle, mtime=0)),
                                    "sha256": hashlib.sha256(bundle).hexdigest(), "trials": samples}
        print(label, "bytes", len(bundle), "gzip", len(gzip.compress(bundle, mtime=0)))
        for metric in samples[0]:
            values = [sample[metric] for sample in samples]
            print(metric, "median us/op", round(statistics.median(values), 2),
                  "range", round(min(values), 2), round(max(values), 2))

    if args.json:
        args.json.write_text(json.dumps(report, indent=2) + "\n")

if __name__ == "__main__":
    main()
