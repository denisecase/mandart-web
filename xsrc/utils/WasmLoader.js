// src/utils/WasmLoader.js
import PathConfig from '../core/PathConfig.js';
import { validateWasmFunctions, setWasmModule } from "./WasmUtils.js";
import { generateGrid } from "../core/GridProcessor.js";
import ColorApplier from "../core/ColorApplier.js";

let wasmInitialized = false;
let wasmModule = null;
// Define flags to control WASM usage
let useWasmCalcGrid = true;
let useWasmColorGrid = true;

/**
 * Initialize the WASM module on application startup.
 * This is the main entry point called from index.js.
 * @returns {Promise<void>}
 */
export async function initWasm() {
  console.log("🚀 Initializing WASM module...");
  try {
    // Use direct path for WASM module - at root level, not in src
    const wasmModulePath = '/wasm/mandart_engine_rust.js';
    console.log(`Loading WASM from: ${wasmModulePath}`);
    
    const { default: init } = await import(wasmModulePath);
    wasmModule = await init();
    
    // Share the module with WasmUtils
    setWasmModule(wasmModule);
    
    console.log("✅ WASM initialization complete");
    wasmInitialized = true;
    
    // Validate available functions
    const availableFunctions = validateWasmFunctions([
      "api_generate_png",
      "api_get_colored_grid",
      "api_load_or_compute_default_grid",
      "api_types::JsArtImageColorInputs"
    ]);
    console.log(`🔍 WASM function check complete:`, availableFunctions);
    
    // Enable WASM usage based on available functions
    useWasmCalcGrid = availableFunctions.includes("api_calc_grid_js");
    useWasmColorGrid = availableFunctions.includes("api_color_grid_js");
    
  } catch (error) {
    console.error("⚠️ WASM initialization failed:", error);
    console.log("Application will continue with JavaScript fallbacks");
    // Still mark as initialized so we don't try loading again
    wasmInitialized = true;
    
    // Disable WASM usage
    useWasmCalcGrid = false;
    useWasmColorGrid = false;
  }
}

/**
 * Safely calls a WASM function with error handling.
 * @param {string} funcName - Name of the WASM function to call
 * @param {...any} args - Arguments to pass to the WASM function
 * @returns {any} Result from the WASM function or null on failure
 */
function safeWasmCall(funcName, ...args) {
  try {
    if (!wasmModule || typeof wasmModule[funcName] !== 'function') {
      console.warn(`⚠️ WASM function ${funcName} not available`);
      return null;
    }
    return wasmModule[funcName](...args);
  } catch (error) {
    console.error(`❌ Error calling WASM function ${funcName}:`, error);
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
  if (useWasmCalcGrid && wasmInitialized) {
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
  if (useWasmColorGrid && wasmInitialized) {
    const wasmResult = safeWasmCall("api_color_grid_js", JSON.stringify(grid), JSON.stringify(hues));
    if (wasmResult) {
      console.log("✅ Grid colored using WASM.");
      return wasmResult;
    }
  }
  console.warn("⚠️ WASM unavailable for coloring. Falling back to JavaScript.");
  const colorApplier = new ColorApplier();
  return colorApplier.apply(grid, hues);
}

/**
 * Safely computes a grid with error handling.
 * @param {Object} shapeInputs - The shape inputs for computation
 * @returns {Promise<Array>} The computed grid
 */
export async function computeGridSafe(shapeInputs) {
  try {
    if (!wasmInitialized) {
      console.warn("⚠️ WASM not initialized for grid computation.");
    }
    
    return await calcGrid(shapeInputs);
  } catch (error) {
    console.error("❌ Error in computeGridSafe:", error);
    return null;
  }
}

/**
 * Sets whether to use WASM for grid calculation.
 * @param {boolean} useWasm - Whether to use WASM.
 */
export function setUseWasmCalcGrid(useWasm) {
  useWasmCalcGrid = !!useWasm;
  console.log(`🔧 WASM for grid calculation ${useWasmCalcGrid ? 'enabled' : 'disabled'}`);
}

/**
 * Sets whether to use WASM for coloring.
 * @param {boolean} useWasm - Whether to use WASM.
 */
export function setUseWasmColorGrid(useWasm) {
  useWasmColorGrid = !!useWasm;
  console.log(`🔧 WASM for coloring ${useWasmColorGrid ? 'enabled' : 'disabled'}`);
}

/**
 * Checks if WASM is initialized.
 * @returns {boolean} Whether WASM is initialized.
 */
export function isWasmInitialized() {
  return wasmInitialized;
}
