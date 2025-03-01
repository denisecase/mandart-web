import { fetchMandartCatalog, MANDART_CATALOG, defaultIndex } from "./src/fetch_catalog.js";
import { loadWasmModule } from "./src/wasm_loader.js";
import { IS_GITHUB_PAGES, BASE_PATH } from "./src/constants.js";
import { setWasmModule } from "./src/globals.js";

/**
 * Simple initialization function with minimal dependencies
 */
async function init() {
    try {
        console.log("🚀 Initializing MandArt Web...");
        console.log(`Environment: ${IS_GITHUB_PAGES ? 'GitHub Pages' : 'Local Development'}`);
        console.log(`Base Path: ${BASE_PATH}`);

        const wasm = await loadWasmModule();
        if (!wasm) {
            console.error("Failed to load WASM module. Some features may not work.");
        }
        setWasmModule(wasm);

        console.log("Fetching catalog...");
        await fetchMandartCatalog();
        console.log("✅ MandArt Web initialized");

    } catch (error) {
        console.error("Failed to initialize:", error);
    }
}

// Register service worker for caching if supported
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        const swPath = IS_GITHUB_PAGES 
            ? `${BASE_PATH}service-worker.js` 
            : './service-worker.js';
            
        window.addEventListener('load', () => {
            navigator.serviceWorker.register(swPath)
                .then(registration => {
                    console.log('ServiceWorker registered successfully:', registration.scope);
                })
                .catch(error => {
                    console.error('ServiceWorker registration failed:', error);
                });
        });
    }
}

// Register service worker, but don't make initialization wait for it
registerServiceWorker();

// Start initialization
window.addEventListener("DOMContentLoaded", init);