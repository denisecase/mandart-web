// components/ButtonSaveFileMandart.js

import { getUIElement } from '../globals.js';
import { eventBus } from '../services/event-bus.js';

export default class ButtonSaveFileMandart {
    constructor() {
        console.log("🖼️ ButtonSaveFileMandart: Initializing.");
        this.button = getUIElement('saveMandartBtn');
        if (!this.button) {
            button = getUIElement('saveMandartBtn');
        }
        if (!this.button) {
            console.error("❌ Wiring: Save MandArt button not found.");
            return;
        }
        this.button.addEventListener('click', () => {
            console.log("Clicked MandArt file save...");
            eventBus.emit('save-mandart');
        });
    }

    destroy() {
        console.log("🗑️ ButtonSaveFileMandart: Destroyed.");
    }
}
