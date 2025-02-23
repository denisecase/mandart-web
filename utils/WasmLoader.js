// utils/WasmLoader.js

import initWasm, { initSync } from "../wasm/mandart_engine_rust.js";
import { validateWasmFunctions, safeWasmCall } from "./WasmUtils.js";
import { generateGrid, applyColoring } from "./GridUtils.js";

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
    const wasmModule = await initWasm();

    window.wasmModule = wasmModule;
    console.log("✅ WASM Loaded Successfully:", window.wasmModule);

    wasmInitialized = true;

    validateWasmFunctions([
      "api_get_image_from_mandart_file_js",
      "api_get_image_from_mandart_json_string_js",
      "api_calc_grid_js",
      "api_color_grid_js",
    ]);

    return window.wasmModule;
  } catch (error) {
    console.error("❌ Error during WASM loading:", error);
    return null;
  }
}

/**
 * Computes the MandArt grid using WASM.
 * @param {Object} mandArtData - The MandArt JSON data
 * @returns {Promise<Array>} The computed grid or null on failure
 */
export async function calcGrid(mandArtData) {
  if (!wasmInitialized) await loadWasm();

  console.log("🧮 Calculating grid with WASM...");
  const wasmResult = safeWasmCall("api_calc_grid_js", JSON.stringify(mandArtData));
  if (wasmResult) {
    console.log("✅ Grid computed using WASM.");
    return wasmResult;
  }

  console.warn("⚠️ WASM unavailable. Falling back to JavaScript grid generation.");
  return generateGrid(100, 100); // Fallback JavaScript grid}
}
/**
 * Colors the MandArt grid using WASM if available; otherwise, falls back to JavaScript.
 * @param {Array} grid - The computed grid data
 * @param {Array} hues - Array of hues
 * @returns {Promise<Array>} The colored grid (from WASM or JavaScript)
 */
export async function colorGrid(grid, hues) {
  if (!wasmInitialized) await loadWasm();

  console.log("🎨 Attempting to color grid using WASM...");

  const wasmResult = safeWasmCall("api_color_grid_js", JSON.stringify(grid), JSON.stringify(hues));
  if (wasmResult) {
    console.log("✅ Grid colored using WASM.");
    return wasmResult;
  }

  console.warn("⚠️ WASM unavailable. Falling back to JavaScript coloring.");
  return applyColoring(grid, hues); // Fallback JavaScript coloring
}