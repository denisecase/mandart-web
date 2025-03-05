// wiring/wiring-button-save-file-mandart.js
// ✅ Handles wiring for the "Save MandArt File" button.

import { eventBus } from '../state/state-all.js';
import { getUIElement } from '../globals.js';


export function initButtonSaveFileMandartWiring(button) {
    if (!button) {
        button = getUIElement('saveMandartBtn');
    }
    if (!button) {
        console.error("❌ Wiring: Save MandArt button not found.");
        return;
    }
    console.log("💾 Wiring: Initializing 'Save Mandart File' button...");
    button.addEventListener('click', () => {
        console.log("💾 Wiring: Requesting MandArt file save...");
        eventBus.emit('save-mandart');
    });
}
