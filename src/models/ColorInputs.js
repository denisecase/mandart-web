import Hue from './Hue.js';

export default class ColorInputs {
  constructor(nBlocks = 10, huesLength = 256, spacingColorFar = 1.0, spacingColorNear = 0.1, yY = 0, mandColor = {}, hues = []) {
    this.n_blocks = Number(nBlocks) || 10;
    this.n_colors = hues.length;
    this.spacing_color_far = Number(spacingColorFar) || 1.0;
    this.spacing_color_near = Number(spacingColorNear) || 0.1;
    this.y_y_input = Number(yY) || 0;

    // ✅ Ensure `mand_color` is always an array `[r, g, b]`
    this.mand_color = mandColor instanceof Hue 
      ? [mandColor.r, mandColor.g, mandColor.b] 
      : (Array.isArray(mandColor) && mandColor.length === 3) ? mandColor : [0, 0, 0];

    // ✅ Normalize hues to always be Hue objects
    this.hues = hues.map(hue => hue instanceof Hue ? hue : new Hue(hue));

    // ✅ Extract only `[r, g, b]` for the colors property
    this.colors = this.hues.map(hue => [hue.r, hue.g, hue.b]);  

    // ❌ Do not transform `hues` yet! Let `to_wasm()` handle that.
  }

  /**
   * Converts to WASM format.
   * @returns {Object}
   */
  to_wasm() {
    return {
      n_blocks: this.n_blocks,
      n_colors: this.n_colors,
      spacing_color_far: this.spacing_color_far,
      spacing_color_near: this.spacing_color_near,
      y_y_input: this.y_y_input,
      mand_color: this.mand_color,
      colors: this.colors,
      hues: this.hues.map(hue => hue.to_wasm()), // ✅ Now safely transform
    };
  }
}
