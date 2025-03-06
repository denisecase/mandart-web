/**
 * Updates the UI controls for color inputs based on the loaded color state.
 * Expects colorInputs to have:
 *    n_blocks, spacing_color_far, spacing_color_near, y_y_input
 */
export function loadColorInputsFromState(colorInputs) {
    const nBlocksInput = document.getElementById('nBlocks');
    const spacingColorFarInput = document.getElementById('spacingColorFar');
    const spacingColorNearInput = document.getElementById('spacingColorNear');
    const yYInputInput = document.getElementById('yYInput');
  
    if(nBlocksInput) {
      nBlocksInput.value = colorInputs.n_blocks;
      const display = document.getElementById('nBlocksDisplay');
      if(display) display.textContent = colorInputs.n_blocks;
    }
    
    if(spacingColorFarInput) {
      spacingColorFarInput.value = colorInputs.spacing_color_far;
      const display = document.getElementById('spacingColorFarDisplay');
      if(display) display.textContent = colorInputs.spacing_color_far;
    }
    
    if(spacingColorNearInput) {
      spacingColorNearInput.value = colorInputs.spacing_color_near;
      const display = document.getElementById('spacingColorNearDisplay');
      if(display) display.textContent = colorInputs.spacing_color_near;
    }
    
    if(yYInputInput) {
      yYInputInput.value = colorInputs.y_y_input;
    }
  }
  