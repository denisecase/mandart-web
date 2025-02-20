// ✅ Import Dependencies
import { setupCanvas } from "./Canvas.js";
import { setupColorEditor } from "./ColorEditor.js";
import { setupHeader } from "./Header.js";
import { setupCanvasSource } from "./CanvasSource.js";
import { setupCatalog } from "./Catalog.js";

import { loadWasm } from "../utils/WasmLoader.js";
import { populateMandartDropdown } from "../utils/ArtUtils.js";
import { loadDefaultMandArt } from "./MandArtLoader.js"; // ✅ Imported separately

// ✅ Ensure app initializes after DOM loads
document.addEventListener("DOMContentLoaded", initApp);

export async function initApp() {
    console.log("🚀 Initializing MandArt Web...");

    let wasmModule = null;
    try {
        wasmModule = await loadWasm();
    } catch (error) {
        console.error("⚠️ WASM failed to load, continuing without it:", error);
    }

    let canvasFunctions = null;
    let canvasSource = null;
    let mandArtLoader = null;

    try {
        ({ canvasFunctions, canvasSource, mandArtLoader } = initializeUIComponents(wasmModule));
    } catch (error) {
        console.error("❌ Error initializing UI components:", error);
    }

    try {
        setupHeader();
    } catch (error) {
        console.error("❌ Header setup failed:", error);
    }

    try {
        populateMandartDropdown();
    } catch (error) {
        console.error("⚠️ Failed to populate MandArt dropdown:", error);
    }

    // ✅ Load default MandArt directly
    try {
        await loadDefaultMandArt();
    } catch (error) {
        console.error("❌ Failed to load default MandArt:", error);
    }

    console.log("✅ MandArt Web initialized successfully.");
}

/**
 * Sets up all UI components and returns necessary references.
 * @param {Object} wasmModule - The initialized WASM module
 * @returns {Object} UI Component References
 */
function initializeUIComponents(wasmModule) {
    console.log("🚀 Initializing UI Components...");
  
    // ✅ Setup Canvas
    const canvasFunctions = setupCanvas(wasmModule);
    const canvasSource = setupCanvasSource();
  
    // ✅ Setup MandArt Loader
    const mandArtLoader = setupMandArtLoader(
      canvasFunctions.getCanvas,
      canvasSource.updateCanvasSource, 
      canvasFunctions.recolorCanvas
    );
  
    // ✅ Setup Header (Now moved AFTER mandArtLoader exists)
    setupHeader(mandArtLoader.loadMandArt, populateMandartDropdown);
  
    // ✅ Setup Other UI Components
    setupColorEditor();
    setupCatalog(mandArtLoader.loadMandArt);
  
    return { canvasFunctions, canvasSource, mandArtLoader };
  }
  