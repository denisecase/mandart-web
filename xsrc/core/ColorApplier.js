// src/core/ColorApplier.js (adding the applyColoring function)
import { hexToRgb } from "../utils/ColorUtils.js";

/**
 * Applies coloring to a grid using JavaScript.
 * Exported for use by WasmLoader when WASM is unavailable.
 * @param {Array} grid - The iteration grid
 * @param {Array} hues - Array of color hues
 * @returns {Array} Colored grid with RGB values
 */
export function applyColoring(grid, hues) {
  console.log("🔄 Applying colors with JavaScript...");
  
  if (!grid?.length || !hues?.length) {
    return null;
  }
  
  const colorApplier = new ColorApplier();
  return colorApplier.apply(grid, hues);
}

/**
 * Handles applying colors to MandArt grids.
 */
class ColorApplier {
  constructor() {
    this.defaultColor = { r: 0, g: 0, b: 0 };
  }

  /**
   * Apply colors to a grid.
   * @param {Array} grid - 2D array of iteration values.
   * @param {Array} colors - Array of color objects with 'hue' or 'r,g,b' properties.
   * @returns {Array} 2D array of colored pixels with 'r,g,b' properties.
   */
  apply(grid, colors) {
    console.log("🎨 Applying colors to grid...");

    if (!grid?.length || !Array.isArray(grid)) {
      console.error("❌ Invalid grid provided.");
      return null;
    }

    if (!colors?.length || !Array.isArray(colors)) {
      console.warn("⚠️ No colors provided, using default black.");
      colors = [{ hue: "#000000", r: 0, g: 0, b: 0 }];
    }

    const processedColors = this._processColors(colors);

    return grid.map(row =>
      row.map(value => processedColors[value % processedColors.length] || this.defaultColor)
    );
  }

  /**
   * Ensures colors are in RGB format.
   * @param {Array} colors - Array of color objects.
   * @returns {Array} Array of RGB color objects.
   */
  _processColors(colors) {
    return colors.map(color => {
      if (color.r !== undefined && color.g !== undefined && color.b !== undefined) {
        return { r: color.r, g: color.g, b: color.b };
      }

      if (color.hue) {
        return hexToRgb(color.hue) || this.defaultColor;
      }

      return this.defaultColor;
    });
  }
}

export default ColorApplier;
export { ColorApplier };