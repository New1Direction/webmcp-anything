import { PageContext } from "../src/runtime.ts";

class WasmRegistry {
  constructor(wasm) {
    this.core = new WebAssembly.Instance(new WebAssembly.Module(wasm)).exports;
    this.callbacks = new Map();
  }

  write(name) {
    // PageContext validates names as ASCII with a 128-byte maximum.
    const bytes = new Uint8Array(this.core.memory.buffer, this.core.input(), 128);
    for (let i = 0; i < name.length; i++) bytes[i] = name.charCodeAt(i);
    return name.length;
  }

  has(name) {
    return this.core.lookup(this.write(name)) !== 0;
  }

  get(name) {
    return this.callbacks.get(this.core.lookup(this.write(name)));
  }

  set(name, entry) {
    const id = this.core.insert(this.write(name));
    if (!id) throw new Error("Wasm registry insertion failed");
    this.callbacks.set(id, entry);
  }

  delete(name) {
    return this.callbacks.delete(this.core.remove(this.write(name)));
  }

  values() {
    const ids = new Uint32Array(this.core.memory.buffer, this.core.ids(), this.core.count());
    return Array.from(ids, id => this.callbacks.get(id));
  }
}

export function installRegistry(wasm) {
  if (!isSecureContext || "modelContext" in document) return;
  Object.defineProperty(document, "modelContext", {
    configurable: true,
    value: new PageContext(new WasmRegistry(wasm)),
  });
}
