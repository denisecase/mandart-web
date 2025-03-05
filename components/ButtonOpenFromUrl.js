// components/ButtonOpenFromUrl.js
// ✅ Button that prompts for a URL and fetches a MandArt file.

import { getUIElement } from '../globals.js';
import { initButtonOpenFromUrlWiring } from '../wiring/wiring-button-open-from-url.js';

export default class ButtonOpenFromUrl {
    constructor() {
        this.button = getUIElement('openUrlBtn');
        if (!this.button) {
            console.error("❌ ButtonOpenFromUrl: 'openUrlBtn' not found in globals.");
            return;
        }
        initButtonOpenFromUrlWiring(this.button);
    }

    destroy() {
        console.log("🗑️ ButtonOpenFromUrl: Destroyed.");
    }
}
