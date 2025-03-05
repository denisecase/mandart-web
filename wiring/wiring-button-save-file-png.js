// wiring/wiring-button-save-file-png.js
// ✅ Handles wiring for the "Save PNG File" button.

import { eventBus } from '../state/state-all.js';
import { getUIElement } from '../globals.js';


export function initButtonSaveFilePngWiring(button) {
    if (!button) {
        button = getUIElement('savePngBtn');
    }
    if (!button) {
        console.error("❌ Wiring: Save PNG button not found.");
        return;
    }
    console.log("💾 Wiring: Initializing 'Save PNG File' button...");
    button.addEventListener('click', () => {
        console.log("💾 Wiring: Requesting PNG file save...");
        eventBus.emit('save-png');
    });
}
