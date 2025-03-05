// wiring/wiring-button-open-from-catalog.js
// ✅ Handles wiring for the "Open from Catalog" button.

import { getUIElement } from '../globals.js';
import { eventBus } from '../state/state-all.js';

/**
 * ✅ **Initialize wiring for the Open File from Catalog button.**
 * @param {HTMLElement} [button] - The button element.
 */
export function initButtonOpenFromCatalogWiring(button) {
    if (!button) {
        button = getUIElement('openCatalogBtn');
    }
    if (!button) {
        console.error("❌ Wiring: Open Catalog button not found.");
        return;
    }
    console.log("📂 Wiring: Initializing 'Open from Catalog' button...");
    button.addEventListener('click', () => {
        console.log("📂 Wiring: Requesting catalog modal open...");
        eventBus.emit('request-catalog');
    });
}