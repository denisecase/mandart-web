// wiring/wiring-background-load.js
// ✅ Handles background loading of a new MandArt file.
// This listens for "file-json-fetched" (to store JSON) and "file-clean" (to trigger the load).

import { eventBus } from '../state/state-all.js';
import { loadMandartFromJsonString } from '../services/load-mandart-from-json-string.js';

let lastJsonString = null;
let isProcessing = false; 

const handleFileJsonFetched = (jsonString) => {
    if (!jsonString || jsonString.trim() === "") {
        console.warn("⚠️ Wiring Background Load: Received empty JSON string from 'file-json-fetched'.");
        return;
    }
    lastJsonString = jsonString;
    console.log("🔄 Wiring Background Load: Stored JSON string for processing.");
};

// ✅ When "file-clean" is emitted, trigger loading.
const handleFileClean = async () => {
    if (isProcessing) {
        console.warn("⚠️ Wiring Background Load: Skipping duplicate 'file-clean' event.");
        return;
    }

    if (!lastJsonString || lastJsonString.trim() === "") {
       // console.error("❌ Wiring Background Load: 'file-clean' triggered but JSON is missing.");
        return;
    }

    isProcessing = true; // 🚨 Mark as processing to prevent loops.

    console.log("📂 Wiring Background Load: 'file-clean' event received. Processing JSON...");

    try {
        await loadMandartFromJsonString(lastJsonString);
        console.log("✅ Wiring Background Load: MandArt JSON successfully loaded.");
    } catch (error) {
        console.error("❌ Wiring Background Load: Error processing MandArt JSON.", error);
    }

    setTimeout(() => { isProcessing = false; }, 500); // 🔄 Reset after 500ms
};

/**
 * Initializes the background load wiring.
 * @returns {Function} Cleanup function to unsubscribe from events.
 */
export function initBackgroundLoadWiring() {
    console.log("🔄 Wiring Background Load: Initializing event listeners...");

    eventBus.subscribe("file-json-fetched", handleFileJsonFetched);
    eventBus.subscribe("file-clean", handleFileClean);

    return () => {
        eventBus.unsubscribe("file-json-fetched", handleFileJsonFetched);
        eventBus.unsubscribe("file-clean", handleFileClean);
        console.log("🔄 Wiring Background Load: Event listeners cleaned up.");
    };
}

// Ensure "file-clean" always triggers the handler
eventBus.subscribe("file-clean", handleFileClean);
