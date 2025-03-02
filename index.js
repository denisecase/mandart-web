import { fetchMandartCatalog, MANDART_CATALOG, defaultIndex } from "./src/fetch_catalog.js";
import { loadWasmModule } from "./src/wasm_loader.js";
import { IS_GITHUB_PAGES, BASE_PATH } from "./src/constants.js";
import { setWasmModule } from "./src/globals.js";
import { reorderColor } from "./src/ColorEditor.js";
import { initSavePngButton } from './src/save_png.js';
import { initSaveButton } from './src/save_mandart.js';
import { initOpenFileButton } from './src/open_mandart.js';

// Make reorderColor globally available (only do this once)
window.reorderColor = reorderColor;

// Global event listeners for drag and drop debugging and handling
document.addEventListener('dragover', (e) => {
    e.preventDefault(); // This is critical - allow drops everywhere
}, false);

document.addEventListener('drop', (e) => {
    console.log("Document drop event on:", e.target);
}, false);

// Global handler for drops on the container
document.addEventListener('DOMContentLoaded', () => {
    const hueList = document.getElementById('hueList');

    // Special handling for drops directly on the hueList container
    if (hueList) {
        hueList.addEventListener('drop', (e) => {
            e.preventDefault();
            console.log('Drop detected on hueList container');

            // Try to get the drag data
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
            if (isNaN(fromIndex)) {
                console.error('Invalid fromIndex in drag data');
                return;
            }

            // Default to the end position if dropped on container
            const toIndex = document.querySelectorAll('.hue-row').length;

            console.log(`Container drop: Moving color from ${fromIndex + 1} to position ${toIndex + 1}`);

            // Use the global reorderColor function
            if (typeof window.reorderColor === 'function') {
                window.reorderColor(fromIndex, toIndex);
            }
        });

        // Need this to allow drops
        hueList.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        console.log('Added drop handlers to hueList container');
    }

    // Add dedicated marker event handlers
    document.addEventListener('dragover', (e) => {
        // Allow drops on markers
        if (e.target.classList && e.target.classList.contains('insert-marker')) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            // Clear all active markers
            document.querySelectorAll('.insert-marker.active').forEach(m => {
                m.classList.remove('active');
            });

            // Highlight the current marker
            e.target.classList.add('active');
        }
    }, true);

    document.addEventListener('drop', (e) => {
        if (e.target.classList && e.target.classList.contains('insert-marker')) {
            e.preventDefault();
            console.log('Drop on marker', e.target);

            // Get the position from the marker
            const toIndex = parseInt(e.target.dataset.position, 10);
            const fromIndex = window.draggedIndex;

            if (!isNaN(fromIndex) && !isNaN(toIndex)) {
                console.log(`Marker drop: Moving from ${fromIndex + 1} to ${toIndex + 1}`);
                if (typeof window.reorderColor === 'function') {
                    window.reorderColor(fromIndex, toIndex);
                }
            }
        }
    }, true);

    // Run the init function from within DOMContentLoaded to ensure proper timing
    init();
});

/**
 * Simple initialization function with minimal dependencies
 */
async function init() {
    try {
        console.log("Module dependency check - ColorEditor functions available:", {
            reorderColor: typeof reorderColor === 'function',
            globalReorderColor: typeof window.reorderColor === 'function'
        });

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
        initSavePngButton();
        initSaveButton();
        initOpenFileButton();
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
