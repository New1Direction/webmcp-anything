# Rust registry experiment

Rust owns the tool-name index (a BTreeMap) and the registration-order ID list.
The Zig and Rust variants use the same JavaScript Wasm bridge and browser
execution path. Build from the SDK directory with Rust 1.95.0:

```sh
rustup target add wasm32-unknown-unknown
rustc experiments/rust/registry.rs --edition=2021 --crate-type=cdylib --target wasm32-unknown-unknown -C opt-level=z -C lto -C panic=abort -C strip=symbols -o experiments/rust/registry.wasm
npm exec --yes --package esbuild@0.25.12 -- esbuild experiments/rust/browser.js --bundle --minify --loader:.wasm=binary --outfile=/tmp/wmcp-rust-bench.js
```

Pass the Rust bundle to test/benchmark.py after the core bundle, W3C bundle,
Chrome executable, and Zig bundle. Each page instantiates its own registry.
