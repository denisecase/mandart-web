// models/ColorInputs.js
// Defines the color input structure for MandArt Web

export default class ColorInputs {
  /**
   * @param {Object} data - Color input values
   * @param {number} data.n_blocks - Number of color blocks
   * @param {number} data.spacing_color_far - Far color spacing
   * @param {number} data.spacing_color_near - Near color spacing
   * @param {number} data.y_y_input - Y-Y input adjustment
   * @param {Array<number>} data.mand_color - Mandelbrot RGB color
   * @param {Array<Array<number>>} data.colors - Color list in `[r, g, b]` format
   * @param {Array<Array<number>>} data.hues - Hues list in `[num, r, g, b]` format
   */
  constructor(data = {}) {
    this.n_blocks = data.n_blocks ?? 10.0;
    this.spacing_color_far = data.spacing_color_far ?? 1.0;
    this.spacing_color_near = data.spacing_color_near ?? 1.0;
    this.y_y_input = data.y_y_input ?? 0.5;
    this.mand_color =
      Array.isArray(data.mand_color)
        ? [...data.mand_color]
        : (data.mand_color && typeof data.mand_color === "object")
          ? [data.mand_color.r, data.mand_color.g, data.mand_color.b]
          : [0.0, 0.0, 0.0];

    this.colors = Array.isArray(data.colors) ? data.colors.map(c => [...c]) : [];
    //this.hues = Array.isArray(data.hues) ? data.hues.map(h => [...h]) : []; this.n_colors = this.hues.length;
  // Normalize hues so that each entry becomes an array [num, r, g, b]
  let normalizedHues = Array.isArray(data.hues)
  ? data.hues.map(h => {
      if (Array.isArray(h)) {
        // Already in array format.
        return [...h];
      } else if (h && typeof h === 'object') {
        // h.num is preserved. For the color part, if h.r is a hex string, convert it.
        let { num, r, g, b } = h;
        if (typeof r === 'string' && r.startsWith('#')) {
          // Convert hex to an RGB array.
          [r, g, b] = hexToRgb(r);
        }
        return [num, r, g, b];
      } else {
        return null;
      }
    }).filter(h => h !== null)
  : [];

// Recalculate the hue numbers based on sorted order.
// Sort by the current num (or by color if you prefer) and then update to [index+1, r, g, b].
this.hues = normalizedHues
  .sort((a, b) => a[0] - b[0])
  .map((h, index) => [index + 1, h[1], h[2], h[3]]);
   
    this.updateColorsFromHues();
    this.updateNColorsFromHues();

  }

  updateNColorsFromHues() {
    this.n_colors = this.hues.length;
  }

  /**
  * Recalculate the colors array from the hues.
  *
  * This method sorts the hues (assumed to be [num, r, g, b])
  * by the "num" value (first element) and then extracts only the
  * RGB values into the colors array.
  */
  updateColorsFromHues() {
    if (Array.isArray(this.hues)) {
      // Sort the hues array based on the num value.
      const sortedHues = [...this.hues].sort((a, b) => a[0] - b[0]);
      // Map each sorted hue to its RGB array (discarding the num).
      this.colors = sortedHues.map(hue => [hue[1], hue[2], hue[3]]);
    } else {
      this.colors = [];
    }
  }

  /**
   * ✅ Converts the object into a JSON representation
   * @returns {Object} JSON-friendly object
   */
  toJSON() {
    return {
      n_blocks: Number(this.n_blocks),
      spacing_color_far: Number(this.spacing_color_far),
      spacing_color_near: Number(this.spacing_color_near),
      y_y_input: Number(this.y_y_input),
      mand_color: Array.isArray(this.mand_color) ? this.mand_color.map(Number) : [0, 0, 0],
      colors: Array.isArray(this.colors) ? this.colors.map(arr => arr.map(Number)) : [],
      hues: Array.isArray(this.hues) ? this.hues.map(arr => arr.map(Number)) : [],
      n_colors: Number(this.n_colors)
    };
  }
  
}
