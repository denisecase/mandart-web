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
import { generateGrid } from "../utils/GridUtils.js";   

window.mandArtLoader = new MandArtLoader();
document.addEventListener("DOMContentLoaded", initApp);

export async function initApp() {

    try {
        console.log("🔍 Initializing MandArt Web...");
        setupCanvasSource();
        setupHeader();
        console.log("✅ Header Setup Complete.");


        // Define the fallback functions for picdef and hues
        const getPicdef = () => window.mandArtLoader.currentMandArt?.picdef || { width: 1000, height: 1000 };
        const getHues = () => window.mandArtLoader.getHues() || [{ r: 0, g: 0, b: 0, num: 1 }];

        let drawWithJavaScript;
        console.log("🔍 Attempting to set up canvas...");

        try {
            const wasmModule = await loadWasm();
            if (!wasmModule) {
                console.warn("⚠️ WASM not loaded, using fallback mode");
                setupCanvas();
            } else {
                console.log("✅ WASM Loaded Successfully");
                const canvasFunctions = setupCanvasWithWasm(wasmModule);
                drawWithJavaScript = canvasFunctions.drawWithJavaScript || (() => { });
            }
        } catch (error) {
            console.error("⚠️ WASM setup failed. Falling back to JavaScript:", error);
            const canvasFunctions = setupCanvas(getPicdef, getHues);
            drawWithJavaScript = canvasFunctions.drawWithJavaScript;
        }
        console.log("🔍 Canvas setup complete. Checking function:", drawWithJavaScript);


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

            if (typeof drawWithJavaScript !== "function") {
                console.error("❌ drawWithJavaScript is NOT a function! Canvas will not update.");
            }
        } catch (error) {
            console.error("⚠️ Could not load default MandArt:", error);
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