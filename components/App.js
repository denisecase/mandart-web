// App.js
import { setupCanvas, setupCanvasWithWasm } from "./Canvas.js";
import { setupColorEditor } from "./ColorEditor.js";
import { setupHeader } from "./Header.js";
import { setupCanvasSource } from "./CanvasSource.js";
import { setupCatalog } from "./Catalog.js";
import { loadWasm } from "../utils/WasmLoader.js";
import { MandArtLoader } from "./MandArtLoader.js";
import {
    loadMandArtList,
    populateMandartDropdown,
} from "../utils/MandArtList.js";

window.mandArtLoader = new MandArtLoader();
document.addEventListener("DOMContentLoaded", initApp);

export async function initApp() {

    try {
        console.log("🚀 Initializing MandArt Web...");
        setupCanvasSource();
        setupHeader();
        console.log("✅ Header Setup Complete.");


        // Define the fallback functions for picdef and hues
        const getPicdef = () => window.mandArtLoader.currentMandArt?.picdef || { width: 1000, height: 1000 };
        const getHues = () => window.mandArtLoader.getHues() || [{ r: 0, g: 0, b: 0, num: 1 }];

        let drawWithJavaScript;

        try {
            const wasmModule = await loadWasm();
            if (!wasmModule) {
                console.warn("⚠️ WASM not loaded, using fallback mode");
                setupCanvas();
            } else {
                console.log("✅ WASM Loaded Successfully");
                setupCanvasWithWasm(wasmModule);
            }
        } catch (error) {
            console.error("⚠️ WASM setup failed. Falling back to JavaScript:", error);
            const canvasFunctions = setupCanvas(getPicdef, getHues);
            drawWithJavaScript = canvasFunctions.drawWithJavaScript;
        }

        setupColorEditor();
        await setupCatalog();

        const mandArtList = await loadMandArtList();
        if (Array.isArray(mandArtList) && mandArtList.length > 0) {
            console.log(`🎨 Found ${mandArtList.length} items...`);
            populateMandartDropdown("mandartSelect", mandArtList);
        }

        try {
            await window.mandArtLoader.loadDefaultMandArt();
            console.log("✅ Default MandArt loaded successfully");
        } catch (error) {
            console.error("⚠️ Could not load default MandArt:", error);
            // App can continue - UI will show "No MandArt Loaded"
        }

        console.log("✅ MandArt Web initialized successfully.");
    } catch (error) {
        console.error("❌ Critical initialization error:", error);
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Failed to initialize MandArt Web. Please refresh the page.';
        document.body.appendChild(errorMsg);
    }
}