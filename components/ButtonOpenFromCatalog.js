// components/ButtonOpenFromCatalog.js
// ✅ Button that triggers opening the catalog modal.

import { getUIElement } from '../globals.js';
import { initButtonOpenFromCatalogWiring } from '../wiring/wiring-button-open-from-catalog.js';

export default class ButtonOpenFromCatalog {
    constructor() {
        this.button = getUIElement('openCatalogBtn');
        if (!this.button) {
            console.error("❌ ButtonOpenFromCatalog: 'openCatalogBtn' not found in globals.");
            return;
        }
        initButtonOpenFromCatalogWiring(this.button);
    }

    destroy() {
        console.log("🗑️ ButtonOpenFromCatalog: Destroyed.");
    }
}
