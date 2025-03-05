// wiring/wiring-button-open-from-url.js
// ✅ Handles wiring for the "Open from URL" button.

import { eventBus } from '../state/state-all.js';
import { getUIElement } from '../globals.js';


export function initButtonOpenFromUrlWiring(button) {
    if (!button) {
        button = getUIElement('openUrlBtn');
    }
    if (!button) {
        console.error("❌ Wiring: Open URL button not found.");
        return;
    }
    console.log("🌍 Wiring: Initializing 'Open from URL' button...");
    button.addEventListener('click', () => {
        console.log("🌍 Wiring: Requesting URL input...");
        eventBus.emit('request-url');
    });
}
