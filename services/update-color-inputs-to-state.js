/**
 * Reads the current color input values from the UI controls
 * and updates the color state accordingly.
 * Assumes a function updateColorState exists.
 */
export function updateColorInputsToState() {
    const nBlocks = document.getElementById('nBlocks')?.value;
    const spacingColorFar = document.getElementById('spacingColorFar')?.value;
    const spacingColorNear = document.getElementById('spacingColorNear')?.value;
    const yYInput = document.getElementById('yYInput')?.value;
  
    // Convert these values to numbers as needed.
    const updates = {
      n_blocks: Number(nBlocks),
      spacing_color_far: Number(spacingColorFar),
      spacing_color_near: Number(spacingColorNear),
      y_y_input: Number(yYInput)
    };
  
    // Assuming updateColorState is available to update your color inputs.
    updateColorState(updates);
  }
  