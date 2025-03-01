import Hue from './Hue.js';

export default class ColorInputs {
  constructor(
    nBlocks = 60,
    spacingColorFar = 5,
    spacingColorNear = 15,
    yY = 0,
    mandColor = [0, 0, 0],
    hues = []
  ) {
    console.log("ColorInputs constructor parameters:", {
      nBlocks,
      spacingColorFar,
      spacingColorNear,
      yY,
      mandColor: Array.isArray(mandColor) ? `[${mandColor.join(',')}]` : mandColor,
      hues: Array.isArray(hues) ? `Array(${hues.length})` : hues
    });

    // Store basic properties with validation
    this.n_blocks = Number(nBlocks) || 60;
    this.spacing_color_far = Number(spacingColorFar) || 5;
    this.spacing_color_near = Number(spacingColorNear) || 15;
    this.y_y_input = Number(yY) || 0;
    
    // Process hues - ensure it's always an array of Hue objects
    if (!Array.isArray(hues)) {
      console.error("❌ hues is not an array!", hues);
      this.hues = []; // Use empty array as fallback
    } else {
      // Convert each item to a Hue instance if it isn't already
      this.hues = hues.map(hue => (hue instanceof Hue) ? hue : new Hue(hue));
    }
    
    // Set n_colors based on actual hues array length
    this.n_colors = this.hues.length;
    
    // Process mandColor - ensure it's an RGB array
    this.mand_color = this.parseMandColor(mandColor);
    
    // Generate colors array from hues
    this.updateColors();
    
    console.log("ColorInputs instance created with:", {
      n_blocks: this.n_blocks,
      n_colors: this.n_colors,
      hues_length: this.hues.length,
      mand_color: this.mand_color
    });
  }

  /**
   * Ensures mandColor is converted to [r,g,b] format
   */
  parseMandColor(input) {
    try {
      // Handle array format (preferred)
      if (Array.isArray(input) && input.length === 3) {
        return input.map(val => Number(val) || 0);
      }
      
      // Handle object with r,g,b properties
      if (typeof input === 'object' && input !== null && 'r' in input && 'g' in input && 'b' in input) {
        return [Number(input.r) || 0, Number(input.g) || 0, Number(input.b) || 0];
      }
      
      // Handle Hue instance (not recommended)
      if (input instanceof Hue) {
        console.warn("⚠️ mandColor is a Hue object - converting to array");
        return [Number(input.r) || 0, Number(input.g) || 0, Number(input.b) || 0];
      }
      
      // Default fallback
      console.warn(`Invalid mandColor format: ${JSON.stringify(input)}, using [0,0,0]`);
      return [0, 0, 0];
    } catch (error) {
      console.error("Error parsing mandColor:", error);
      return [0, 0, 0];
    }
  }

  /**
   * Rebuilds the colors array from hues
   */
  updateColors() {
    if (!Array.isArray(this.hues)) {
      console.warn("⚠️ hues is not an array in updateColors");
      this.hues = [];
    }
    
    // Create RGB arrays from each hue
    this.colors = this.hues.map(hue => [
      Number(hue.r) || 0, 
      Number(hue.g) || 0, 
      Number(hue.b) || 0
    ]);
    
    // Keep n_colors in sync with hues length
    this.n_colors = this.hues.length;
  }

  /**
   * Prepares data for WASM
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
      hues: this.hues.map(hue => [
        Number(hue.num) || 0, 
        Number(hue.r) || 0, 
        Number(hue.g) || 0, 
        Number(hue.b) || 0
      ])
    };
  }
}