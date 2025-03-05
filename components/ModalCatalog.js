// components/ModalCatalog.js
// ✅ Dumb component: Only initializes and maintains structure

import { getUIElement } from '../globals.js';
import { initWiringModalCatalog } from '../wiring/wiring-modal-catalog.js';

/**
 * ✅ **ModalCatalog Component**
 * - Uses `globals.js` for UI elements.
 * - Only responsible for initialization.
 * - Uses `wiring/wiring-modal-catalog.js` for event handling.
 * - Rendering is handled by render/render-catalog.js
 */
export default class ModalCatalog {
    constructor() {
        this.element = getUIElement('catalogModal');
        this.catalogContainer = getUIElement('mandartList');

        if (!this.element || !this.catalogContainer) {
            console.error("❌ ModalCatalog: Missing required UI elements.");
            return;
        }

        // Initialize event wiring
        initWiringModalCatalog();
    }

    /**
     * ✅ **Destroy method (if needed)**
     */
    destroy() {
        console.log("🗑️ ModalCatalog: Destroyed.");
    }
}
