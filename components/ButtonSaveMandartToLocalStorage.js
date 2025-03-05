// components/ButtonSaveMandartToLocalStorage.js
// ✅ Button to save the MandArt file to localStorage.

import { getUIElement } from '../globals.js';
import { initButtonSaveMandartToLocalStorageWiring } from '../wiring/wiring-button-save-mandart-to-localstorage.js';

/**
 * ✅ **ButtonSaveMandartToLocalStorage Component**
 * - Uses `globals.js` to find the button reference.
 * - Wiring is handled in `wiring/wiring-button-save-mandart-to-localstorage.js`.
 * - Saves the MandArt file content to `localStorage` with a timestamped key.
 */
export default class ButtonSaveMandartToLocalStorage {
    constructor() {
        this.button = getUIElement('saveMandartBtn');

        if (!this.button) {
            console.error("❌ ButtonSaveMandartToLocalStorage: 'saveMandartBtn' not found in globals.");
            return;
        }

        // Initialize wiring for this button
        initButtonSaveMandartToLocalStorageWiring(this.button);
    }

    /**
     * ✅ **Cleanup method to remove event listeners if needed.**
     */
    destroy() {
        console.log("🗑️ ButtonSaveMandartToLocalStorage: Destroyed.");
    }
}
