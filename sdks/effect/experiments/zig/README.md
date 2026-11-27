# Zig registry experiment

Zig 0.14.1 owns the ordered tool-name index and assigns integer IDs. JavaScript
retains the callback objects and browser descriptors. Both registry variants
use the same PageContext and browser execution path.

From the SDK directory, build the self-installing benchmark bundle:

```sh
zig build-exe experiments/zig/registry.zig -target wasm32-freestanding -O ReleaseSmall -fno-entry -rdynamic -femit-bin=experiments/zig/registry.wasm
npm exec --yes --package esbuild@0.25.12 -- esbuild experiments/zig/browser.js --bundle --minify --loader:.wasm=binary --outfile=/tmp/wmcp-zig-bench.js
```

Pass the bundle as the fourth argument to test/benchmark.py after the Effect
bundle, W3C bundle, and Chrome executable. The bundle embeds the Wasm bytes.
