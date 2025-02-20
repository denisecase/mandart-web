// utils/WasmLoader.js

let wasmInitialized = false;

const isGitHubPages = window.location.hostname.includes("github.io");
const wasmPath = isGitHubPages
  ? "../wasm/mandart_engine_rust_bg.wasm.txt"
  : "../wasm/mandart_engine_rust_bg.wasm";

/**
 * Loads and initializes the WASM module dynamically.
 * Ensures it runs only once for efficiency.
 */
export async function loadWasm() {
  if (wasmInitialized) {
    console.warn("⚠️ WASM is already loaded. Skipping re-load.");
    return window.wasmModule;
  }

  console.log("🚀 Loading WASM...");

  try {
    console.log("🚀 Looking for WASM at {}", wasmPath);
    const response = await fetch(wasmPath);
    if (!response.ok) throw new Error(`❌ Failed to load WASM file: ${wasmPath}`);
    console.log("🚀 Found WASM...");

    const wasmArrayBuffer = await response.arrayBuffer();
    const wasmModule = await WebAssembly.instantiate(wasmArrayBuffer, {});
    console.log("🚀  WASMmodule instantiated...");

    window.wasmModule = wasmModule.instance.exports;
    console.log("🚀 window.wasmModule is {}", window.wasmModule);

    wasmInitialized = true; 

    console.log("✅ WASM Loaded Successfully:", window.wasmModule);

    // ✅ Validate WASM functions
    validateWasmFunctions([
      "api_get_image_from_mandart_file_js",
      "api_get_image_from_mandart_json_string_js",
    ]);

    return window.wasmModule;
  } catch (error) {
    console.error("❌ Error during WASM loading:", error);
    return null;
  }
}

