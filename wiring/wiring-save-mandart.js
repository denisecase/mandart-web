// listens and saves

import { eventBus } from '../state/state-all.js';
import { saveMandArtFile } from '../services/save-mandart-file.js'


export async function initSaveMandart() {
    console.log("💾 Wiring: Subscribing to save mandart");

    eventBus.subscribe('save-mandart', async () => {
        console.debug("💾 Wiring: Got notice changed, triggering save Mandart file.");
        await saveMandArtFile();
    });
}
