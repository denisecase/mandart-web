// MandArtColorApplier.js

import { rgbToHex } from "../utils/ColorUtils.js";
import { colorGrid } from "../utils/WasmLoader.js";

/**
 * Applies colors to the MandArt grid based on the provided hues.
 */
export class MandArtColorApplier {
  constructor(useFastCalc = true) {
    this.coloredGrid = null;
    this.useFastCalc = true;
  }

  /**
   * Applies colors to the grid using the provided hues.
   * @param {Array} grid - The computed grid data.
   * @param {Array} hues - The array of hues.
   * @returns {Promise<Array>} The colored grid.
   */
  async applyColors(grid, hues) {
    this.coloredGrid = this.useFastCalc ? this.fastColor(grid, hues) : await colorGrid(grid, hues);
    console.log("🎨 Coloring complete.");
    return this.coloredGrid;
  }

  /**
   * Applies fast coloring to the grid based on the provided hues.
   * @param {Array} grid - The computed grid data.
   * @param {Array} hues - The array of hues.
   * @returns {Array} The colored grid.
   */
  fastColor(grid, hues) {
    console.log("🎨 Applying fast color...");

    if (!hues || hues.length === 0) {
      console.warn("⚠️ No hues available. Using default gray.");
      return grid.map(row => row.map(() => "#CCCCCC"));
    }

    const primaryHue = hues.find(h => h.num === 1) || hues[0];
    const color = primaryHue ? rgbToHex(primaryHue.r, primaryHue.g, primaryHue.b) : "#CCCCCC";

    console.log(`MandArtColorApplier.js:42 Color=${color}`);

    setTimeout(() => {
      const canvas = document.getElementById("mandelbrotCanvas");
      if (canvas) {
        console.log(`🎨 Setting canvas background to: ${color}`);
        canvas.style.backgroundColor = color;
      } else {
        console.warn("❌ Canvas not found! Check ID.");
      }
    }, 100);

    return grid.map(row => row.map(() => color)); // Returns a new grid instead of mutating
  }

  /**
   * Retrieves the colored grid.
   * @returns {Array|null} The colored grid or null if not available.
   */
  getColoredGrid() {
    return this.coloredGrid;
  }

  /**
  * Updates a specific hue color in the MandArt grid.
  * @param {number} hueIndex - The index of the hue to update.
  * @param {object} newColor - The new color object {r, g, b}.
  */
  updateMandColor(hueIndex, newColor) {
    console.log(`🎨 Updating MandArt Color at index ${hueIndex} to`, newColor);

    if (!this.hues || !Array.isArray(this.hues)) {
      console.error("❌ Cannot update color: Hues array is missing.");
      return;
    }

    if (hueIndex < 0 || hueIndex >= this.hues.length) {
      console.warn("⚠️ Invalid hue index:", hueIndex);
      return;
    }

    // Update the specific hue color
    this.hues[hueIndex] = {
      ...this.hues[hueIndex],
      ...newColor,
    };

    // Recolor the grid
    this.coloredGrid = this.useFastCalc
      ? this.fastColor(this.grid, this.hues)
      : colorGrid(this.grid, this.hues);

    console.log("✅ Hue updated and grid recolored.");
  }


}