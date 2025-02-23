// utils/WasmLoader.js

import initWasm from "../wasm/mandart_engine_rust.js";
import { validateWasmFunctions, safeWasmCall } from "./WasmUtils.js";
import { generateGrid, applyColoring } from "./GridUtils.js";

let wasmInitialized = false;
let useWasmCalcGrid = false;
let useWasmColorGrid = false;

const isGitHubPages = window.location.hostname.includes("github.io");
const wasmPath = isGitHubPages
  ? "../wasm/mandart_engine_rust_bg.wasm.txt"
  : "../wasm/mandart_engine_rust_bg.wasm";

/**
 * Loads and initializes the WASM module dynamically.
 * Ensures it runs only once for efficiency.
 * @returns {Promise<Object|null>} The loaded WASM module or null on failure
 */
export async function loadWasm() {
  if (wasmInitialized) {
    console.warn("⚠️ WASM is already loaded. Skipping re-load.");
    return window.wasmModule;
  }

  console.log("🔍 Loading WASM...");

  try {
    const wasmModule = await initWasm(wasmPath);
    window.wasmModule = wasmModule;
    console.log("✅ WASM Loaded Successfully:", window.wasmModule);
    wasmInitialized = true;

    const availableFunctions = validateWasmFunctions([
      "api_calc_grid_js",
      "api_color_grid_js",
    ]);

    useWasmCalcGrid = availableFunctions.includes("api_calc_grid_js");
    useWasmColorGrid = availableFunctions.includes("api_color_grid_js");
    console.log(`🔍 WASM function check complete: calc=${useWasmCalcGrid}, color=${useWasmColorGrid}`);

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
  console.log("🔍 Calculating grid...");
  if (useWasmCalcGrid) {
    const wasmResult = safeWasmCall("api_calc_grid_js", JSON.stringify(mandArtData));
    if (wasmResult) {
      console.log("✅ Grid computed using WASM.");
      return wasmResult;
    }
  }
  console.warn("⚠️ WASM unavailable for grid calculation. Falling back to JavaScript.");
  return generateGrid(mandArtData);
}

/**
 * Colors the MandArt grid using WASM if available; otherwise, falls back to JavaScript.
 * @param {Array} grid - The computed grid data
 * @param {Array} hues - Array of hues
 * @returns {Promise<Array>} The colored grid (from WASM or JavaScript)
 */
export async function colorGrid(grid, hues) {
  console.log("🔍 Coloring grid...");
  if (useWasmColorGrid) {
    const wasmResult = safeWasmCall("api_color_grid_js", JSON.stringify(grid), JSON.stringify(hues));
    if (wasmResult) {
      console.log("✅ Grid colored using WASM.");
      return wasmResult;
    }
  }
  console.warn("⚠️ WASM unavailable for coloring. Falling back to JavaScript.");
  return applyColoring(grid, hues);
}