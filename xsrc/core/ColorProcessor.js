// src/core/ColorProcessor.js
import { colorGrid } from "../utils/WasmLoader.js";
import ColorApplier from "./ColorApplier.js";

/**
 * Handles the processing and application of colors to Mandelbrot grids.
 */
class ColorProcessor {
  constructor() {
    this.colorApplier = new ColorApplier();
  }

  /**
   * Applies colors to a computed grid.
   * @param {Array} grid - The computed iteration grid.
   * @param {Array|Object} colorInputs - Color inputs (array of hues or object with hues property).
   * @param {boolean} fastCalc - If true, skips WASM & applies simple coloring.
   * @returns {Promise<Array>} Colored grid (2D array).
   */
  async applyColors(grid, colorInputs, fastCalc = false) {
    console.log("🎨 Processing colors...");

    if (!grid?.length) {
      console.error("❌ Missing grid! Cannot apply colors.");
      return null;
    }

    // Handle different input formats (array or object with hues property)
    const hues = Array.isArray(colorInputs) ? colorInputs : colorInputs?.hues;

    if (!hues?.length) {
      console.error("❌ Missing hues! Returning blank grid.");
      return grid.map(row => row.map(() => ({ r: 0, g: 0, b: 0 })));
    }

    try {
      // Use WASM if available and not in fast calculation mode
      if (!fastCalc) {
        const wasmResult = await colorGrid(grid, hues);
        if (wasmResult) {
          console.log("✅ Grid colored using WASM.");
          return wasmResult;
        }
      }

      // Fall back to JavaScript implementation
      console.log(fastCalc ? "⚡ Using fast coloring." : "⚠️ WASM unavailable. Using JS fallback.");
      return this.colorApplier.apply(grid, hues);
    } catch (error) {
      console.error("❌ Error applying colors:", error);
      return this.colorApplier.apply(grid, hues);
    }
  }

  /**
   * Process grid colors - standalone function for compatibility with existing code.
   * @param {Array} grid - The computed iteration grid.
   * @param {Array} hues - Array of hues.
   * @param {boolean} fastCalc - If true, skips WASM & applies simple coloring.
   * @returns {Promise<Array>} Colored grid (2D array).
   */
  async processGridColors(grid, hues, fastCalc = false) {
    return this.applyColors(grid, hues, fastCalc);
  }
}

// Export as singleton
const colorProcessor = new ColorProcessor();
export default colorProcessor;

// Also export the standalone function for backward compatibility
export async function processGridColors(grid, hues, fastCalc = false) {
  console.log("🎨 Processing colors...");

  if (!grid?.length || !hues?.length) {
    console.error("❌ Missing grid or hues! Returning blank grid.");
    return grid.map(row => row.map(() => "#000000"));
  }

  const colorApplier = new ColorApplier();
  return fastCalc 
    ? colorApplier.apply(grid, hues) 
    : (await colorGrid(grid, hues)) ?? colorApplier.apply(grid, hues);
}