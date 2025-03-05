import { getUIElement } from '../globals.js';
import { eventBus } from '../state/state-all.js';
import { getColorState, updateColorState } from '../state/state-color-inputs.js';
import { hexToRgb } from '../utils/color-utils.js'; // Assumes you have a conversion function

export function initColorEditorControls() {
    const mandColorPicker = getUIElement('mandColorPicker');
    const addColorBtn = getUIElement('addColorBtn');

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
