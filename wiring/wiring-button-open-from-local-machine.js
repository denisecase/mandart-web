// wiring/wiring-button-open-from-local-machine.js
import { getUIElement } from '../globals.js';
import { getMandartJsonStringFromLocalMachine } from '../services/get-mandart-json-string-from-local-machine.js';


export function initButtonOpenFromLocalFileWiring(button) {
    if (!button) {
        button = getUIElement('openFileBtn');
    }
    if (!button) {
        console.error("❌ Wiring: Open File button not found.");
        return;
    }
    console.log("📂 Wiring: Initializing 'Open File' button...");
    button.addEventListener('click', async () => {
        console.log("📂 Wiring: Opening local file dialog...");
        try {
            await getMandartJsonStringFromLocalMachine();
        } catch (error) {
            console.error("❌ Wiring: Error opening local file:", error);
        }
    });
    console.log("✅ Wiring: 'Open File' button initialized.");
}