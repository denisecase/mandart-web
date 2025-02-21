// utils/WasmLoader.js

import initWasm, { initSync } from "../wasm/mandart_engine_rust.js";
import {validateWasmFunctions} from "./WasmUtils.js";

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
    // ✅ Correctly initialize WASM using the generated init function
    const wasmModule = await initWasm();

    window.wasmModule = wasmModule;
    console.log("✅ WASM Loaded Successfully:", window.wasmModule);

    wasmInitialized = true;
    
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
