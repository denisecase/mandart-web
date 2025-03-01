import { hexToRgb } from "../ColorEditorUtils.js";

/**
 * Manages color arrays (adding, removing, updating).
 */
class ColorListManager {
  constructor() {
    this.defaultColor = { hue: "#000000", r: 0, g: 0, b: 0 };
  }

  /**
   * Updates a color in the array.
   * @param {Array} colors - Array of colors.
   * @param {number} index - Index of color to update.
   * @param {string} hexColor - New hex color.
   * @returns {Array} Updated color array.
   */
  updateColor(colors, index, hexColor) {
    if (!Array.isArray(colors) || !colors.length) {
      console.error("❌ Invalid colors array.");
      return colors;
    }

    const newColors = [...colors];

    if (index >= 0 && index < newColors.length) {
      const rgb = hexToRgb(hexColor);
      if (rgb) {
        newColors[index] = { hue: hexColor, ...rgb };
      }
    }

    return newColors;
  }

  /**
   * Adds a new color.
   * @param {Array} colors - Array of colors.
   * @param {string} hexColor - Hex color value.
   * @returns {Array} Updated color array.
   */
  addColor(colors, hexColor = null) {
    if (!Array.isArray(colors) || !colors.length) {
      console.error("❌ Invalid colors array.");
      return colors;
    }

    const newHex =
      hexColor || `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`;
    const rgb = hexToRgb(newHex);

    const maxPosition = colors.reduce(
      (max, color) => (color.position > max ? color.position : max),
      0
    );

    return [...colors, { hue: newHex, position: maxPosition + 1, ...rgb }];
  }

  /**
   * Removes a color.
   * @param {Array} colors - Array of colors.
   * @param {number} index - Index to remove.
   * @returns {Array} Updated color array.
   */
  removeColor(colors, index) {
    if (!Array.isArray(colors) || !colors.length) {
      console.error("❌ Invalid colors array.");
      return colors;
    }

    if (colors.length <= 1) {
      console.warn("⚠️ Cannot remove the last color.");
      return colors;
    }

    return colors.filter((_, i) => i !== index);
  }
}

export default ColorListManager;
export { ColorListManager as ColorManager };
