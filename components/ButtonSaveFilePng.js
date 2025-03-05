// components/ButtonSaveFilePng.js
// ✅ Button to save the MandArt canvas as a PNG file.

import { getUIElement } from '../globals.js';
import { initButtonSaveFilePngWiring } from '../wiring/wiring-button-save-file-png.js';

export default class ButtonSaveFilePng {
    constructor() {
        this.button = getUIElement('savePngBtn');
        if (!this.button) {
            console.error("❌ ButtonSaveFilePng: 'savePngBtn' not found in globals.");
            return;
        }
        initButtonSaveFilePngWiring(this.button);
    }
    destroy() {
        console.log("🗑️ ButtonSaveFilePng: Destroyed.");
    }
}
