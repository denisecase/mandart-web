import { getColorState, subscribeToColorState } from '../state/state-color-inputs.js';
import { getUIElement } from '../globals.js';
import { ColorEditorRow } from '../components/ColorEditorRow.js';
import { rgbToHex } from '../utils/color-utils.js';
import { enhanceDragAndDrop } from '../components/ColorEditorRow.js';   

let renderAttemptCount = 0;
const MAX_RENDER_ATTEMPTS = 3;

export function initRenderColorEditor() {
    // Subscribe to state changes so that renderColorEditor() is called whenever the state updates.
    subscribeToColorState(renderColorEditor);

    // Initial render (with slight delay for the DOM to settle).
    setTimeout(() => renderColorEditor(), 100);
}

export function renderColorEditor() {
    const colorState = getColorState();
    // Update mand color picker display
    const mandColorPicker = getUIElement('mandColorPicker');
    if (mandColorPicker && colorState.mand_color) {
        // Convert RGB array to hex string (assuming you have rgbToHex)
        mandColorPicker.value = rgbToHex(...colorState.mand_color);
    }

    // Render the hue list.
    const hueListElement = getUIElement('hueList');
    if (!hueListElement) {
        renderAttemptCount++;
        if (renderAttemptCount < MAX_RENDER_ATTEMPTS) {
            setTimeout(renderColorEditor, 500);
        }
        return;
    }
    renderAttemptCount = 0;
    hueListElement.innerHTML = '';

    if (colorState.hues && colorState.hues.length > 0) {
        colorState.hues.forEach((hue, index) => {
            try {
                const row = new ColorEditorRow({ index, hue });
                hueListElement.appendChild(row.getElement());
            } catch (error) {
                console.error("Error rendering hue row:", error);
            }
        });
    } else {
        const noHuesMsg = document.createElement('div');
        noHuesMsg.textContent = 'No colors defined. Click "Add Color" to add your first color.';
        hueListElement.appendChild(noHuesMsg);
    }
    enhanceDragAndDrop()

}
