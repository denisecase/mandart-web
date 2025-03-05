// app.js - Core application logic and initialization

import { DEFAULT_MANDART_FILE_URL, DEFAULT_MANDART_FILE_STEM } from './constants.js';
import { initGlobals, getUIElement } from './globals.js';
import { eventBus, initState } from './state/state-all.js';
import { initWiring } from './wiring/wiring-all.js';
import { initWasmService as initWasm, getWasmModule } from './services/wasm-initializer.js';
import { initCanvas } from './components/Canvas.js';
import { initColorEditorControls } from './components/ColorEditorControls.js';
import { initRenderColorEditor } from './render/render-color-editor.js';
import { fetchCatalog } from './services/catalog-fetcher.js';
import { getMandartJsonStringFromUrl } from './services/get-mandart-json-string-from-url.js';
import { initRenderCatalog } from './render/render-catalog.js';
import { setCatalogSelection } from './state/state-dropdown-file-select.js';
/**
 * ✅ **Initializes the MandArt Web application**
 */
export async function initApp() {
    console.log("✅ APP INIT 1 Initializing MandArt Web application");

    try {
        // Initialize UI element references
        await initGlobals();
        console.log("✅ APP INIT 2 Global UI references initialized");

        // Initialize State Management
        initState();
        console.log("✅ APP INIT 3 State management initialized");

        // Initialize wiring (event listeners)
        initWiring();
        console.log("✅ APP INIT 4 Wiring initialized");

        // Initialize WASM
        await initWasm();
        if (!getWasmModule()) throw new Error("❌ Failed to initialize WASM module");
        console.log("✅ APP INIT 5 WASM initialized");

        // Fetch MandArt Catalog first
        await fetchCatalog();
        console.log("✅ APP INIT 6 MandArt catalog fetched");

        // Set the catalog selection to the default file
        setCatalogSelection(DEFAULT_MANDART_FILE_URL);
        console.log(`✅ APP INIT 7 Set default catalog selection to ${DEFAULT_MANDART_FILE_STEM}`);

        // Load default MandArt file from the default URL
        const jsonString = await getMandartJsonStringFromUrl(DEFAULT_MANDART_FILE_URL);
        console.log("✅ APP INIT 8 Default file loaded", jsonString);

        // Initialize UI Components
        initCanvas();
        console.log("✅ APP INIT 9 Canvas components initialized");

        initColorEditorControls();
        console.log("✅ APP INIT 10 Color editor controls initialized");

        initRenderColorEditor();
        console.log("✅ APP INIT 11 renderer initialized");

        // Initialize Catalog Rendering
        initRenderCatalog();
        console.log("✅ APP INIT 12 Catalog UI rendering initialized");

        console.log("✅ APP INIT MandArt Web application initialized successfully");
        return true;
    } catch (error) {
        console.error("❌ APP INIT Error initializing application:", error);
        return false;
    }
}
