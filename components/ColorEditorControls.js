import { getUIElement } from '../globals.js';
import { eventBus } from '../state/state-all.js';
import { getColorState, updateColorState } from '../state/state-color-inputs.js';
import { hexToRgb } from '../utils/color-utils.js'; // Assumes you have a conversion function

export function initColorEditorControls() {
    const mandColorPicker = getUIElement('mandColorPicker');
    const addColorBtn = getUIElement('addColorBtn');
    const nBlocks = getUIElement('nBlocks');
    const spacingColorFar = getUIElement('spacingColorFar');
    const spacingColorNear = getUIElement('spacingColorNear');
    const yYInput = getUIElement('yYInput');

    if (nBlocks) {
        nBlocks.addEventListener('input', (event) => {
            console.log("nBlocks changed:", event.target.value);
            updateColorState({ n_blocks: event.target.value });
            eventBus.emit('force-render-canvas');
        });
    }

    if (spacingColorFar) {
        spacingColorFar.addEventListener('input', (event) => {
            console.log("spacingColorFar changed:", event.target.value);
            updateColorState({ spacing_color_far: event.target.value });
            eventBus.emit('force-render-canvas');
        });
    }       

    if (spacingColorNear) {
        spacingColorNear.addEventListener('input', (event) => {
            console.log("spacingColorNear changed:", event.target.value);
            updateColorState({ spacing_color_near: event.target.value });
            eventBus.emit('force-render-canvas');
        });
    }
    if (yYInput) {
        yYInput.addEventListener('input', (event) => {
            console.log("yYInput changed:", event.target.value);
            updateColorState({ y_y_input: event.target.value });
            eventBus.emit('force-render-canvas');
        });
    }   

    if (mandColorPicker) {
        // When the mand color picker changes, convert hex to RGB array
        mandColorPicker.addEventListener('input', (event) => {
            console.log("Mand color changed:!!!!!!!!!!!!!!!!!!!!!", event.target.value);
            const newColor = hexToRgb(event.target.value);
            console.log("Mand color updated:", newColor);
            updateColorState({ mand_color: newColor });
            eventBus.emit('force-render-canvas');
        });
    }

    if (addColorBtn) {
        addColorBtn.addEventListener('click', () => {
            console.log("Add Color clicked.");
            // Get current state, then add a new hue.
            const colorState = getColorState();
            // Use a default color (e.g., black) and set its num to one more than current count.
            const newHue = [colorState.hues.length + 1, 0, 0, 0];
            // Create a new hues array.
            const updatedHues = [...colorState.hues, newHue];
            updateColorState({ hues: updatedHues });
            eventBus.emit('force-render-canvas');
        });
    }
}
