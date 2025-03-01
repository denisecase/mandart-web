import { fetchMandartCatalog, MANDART_CATALOG, defaultIndex } from "./src/fetch_catalog.js";
import { processFile } from "./src/process_file.js";
import { loadWasmModule } from "./src/wasm_loader.js";
import { setWasmModule, wasmModule } from "./src/globals.js";

// App version - update this when you deploy new changes
const APP_VERSION = '1.0.0';

// Register service worker for caching if supported
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('🔄 ServiceWorker registered successfully:', registration.scope);
                })
                .catch(error => {
                    console.error('❌ ServiceWorker registration failed:', error);
                });
        });
    } else {
        console.log('⚠️ Service workers not supported in this browser');
    }
}

// Add version parameter to resource URLs when they're fetched
function addVersionToFetch() {
    // Store the original fetch function
    const originalFetch = window.fetch;

    // Override the fetch function to add version parameters to local URLs
    window.fetch = function (url, options) {
        // Only add version to local URLs (not external APIs)
        if (typeof url === 'string' && url.startsWith('/') &&
            !url.includes('?') &&
            (url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.wasm'))) {
            url = `${url}?v=${APP_VERSION}`;
        }

        // Call the original fetch with the possibly modified URL
        return originalFetch(url, options);
    };

    console.log('🔄 Resource versioning enabled for cache control');
}

async function init() {
    try {
        console.log("Initializing MandArt Web...");

        // Enable caching strategies
        registerServiceWorker();
        addVersionToFetch();

        // Load WASM module
        const wasm = await loadWasmModule();
        setWasmModule(wasm);
        if (!wasm) return;

        // Fetch catalog and populate UI
        await fetchMandartCatalog();

    } catch (error) {
        console.error("Failed to initialize:", error);
    }
}

window.addEventListener("DOMContentLoaded", init);
