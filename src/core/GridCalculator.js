// src/core/GridCalculator.js
import { computeGridSafe } from "../utils/WasmLoader.js";
import { getShapeInputs } from "../services/MandArtServiceInputUtils.js";
import { generateGrid } from "./GridProcessor.js";
import { loadPrecomputedGrid as loadGridFromService } from "../services/FileService.js";

/**
 * Handles Mandelbrot grid computation.
 */
class GridCalculator {
  constructor() {
    this.currentGrid = null; // Stores the last computed grid
    this.useFastCalc = false; // Default mode: detailed calculation
  }

  /**
   * Loads a precomputed grid from storage.
   * @param {string} gridName - Name of the grid to load.
   * @returns {Promise<Array|null>} The loaded grid or null if not found.
   */
  async loadPrecomputedGrid(gridName) {
    console.log(`🔍 GridCalculator: Loading precomputed grid for "${gridName}"`);
    return await loadGridFromService(gridName);
  }

  /**
   * Computes the grid based on MandArt settings.
   * @param {Object} mandArt - The MandArt object.
   * @param {number} canvasWidth - Canvas width.
   * @param {number} canvasHeight - Canvas height.
   * @returns {Promise<Array>} Computed grid (2D array).
   */
  async compute(mandArt, canvasWidth, canvasHeight) {
    if (!mandArt) {
      console.error("❌ No MandArt provided for grid computation!");
      return null;
    }

    const shapeInputs = getShapeInputs(mandArt);

    if (this.useFastCalc) {
      return this.generateDummyGrid(shapeInputs);
    }

    // Try loading a precomputed grid (if available)
    const precomputedGrid = await this.loadPrecomputedGrid(mandArt.name);
    if (precomputedGrid) {
      console.log("✅ Using precomputed grid");
      return precomputedGrid;
    }

    // Compute the grid if no precomputed data exists
    console.log("🧮 No precomputed grid found. Computing grid...");
    return this.computeGrid(shapeInputs);
  }

  /**
   * Computes the Mandelbrot grid using WASM.
   * Falls back to JavaScript if WASM fails.
   * @param {Object} shapeInputs - Extracted shape inputs.
   * @returns {Promise<Array>} Computed grid (2D array).
   */
  async computeGrid(shapeInputs) {
    console.log("🧮 Computing grid...");

    if (!shapeInputs) {
      console.error("❌ No shape inputs provided!");
      return null;
    }

    try {
      const grid = await computeGridSafe(shapeInputs);
      if (!Array.isArray(grid) || !grid.length || !Array.isArray(grid[0])) {
        console.warn("⚠️ Invalid WASM grid. Using fallback.");
        return generateGrid(shapeInputs);
      }
      return grid;
    } catch (error) {
      console.error("❌ WASM computation failed. Using fallback.");
      return generateGrid(shapeInputs);
    }
  }

  /**
   * Generates a dummy grid for fast calculation mode.
   * @param {Object} shapeInputs - Shape input details.
   * @returns {Array} A placeholder grid.
   */
  generateDummyGrid(shapeInputs) {
    console.log("⚡ FastCalc enabled: Generating dummy grid...");

    const { imageWidth = 100, imageHeight = 100 } = shapeInputs;

    return Array.from({ length: imageHeight }, () =>
      Array.from({ length: imageWidth }, () => 1)
    );
  }

  /**
   * Enables or disables fast calculation mode.
   * @param {boolean} useFast - Whether to enable fast calculation.
   */
  setFastCalc(useFast) {
    this.useFastCalc = !!useFast;
  }
}

// Export as singleton
const gridCalculator = new GridCalculator();
export default gridCalculator;