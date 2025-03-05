// listens and saves

import { eventBus } from '../state/state-all.js';
import { savePngFile } from '../services/save-png-file.js'


export async function initSavePng() {
    console.log("💾 Wiring: Subscribing to save png");

    eventBus.subscribe('save-png', async () => {
        console.debug("💾 Wiring: Got notice changed, triggering save PNG file.");
        await savePngFile();
    });
}
