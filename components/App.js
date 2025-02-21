// ✅ Import Dependencies
import { setupCanvas, setupCanvasWithWasm } from "./Canvas.js";
import { setupColorEditor } from "./ColorEditor.js";
import { setupHeader } from "./Header.js";
import { setupCanvasSource, updateCanvasSource } from "./CanvasSource.js";
import { setupCatalog } from "./Catalog.js";
import { setupFileInput } from "./FileInput.js";

import { loadWasm } from "../utils/WasmLoader.js";
import { MandArtLoader } from "./MandArtLoader.js";
import {
  loadMandArtList,
  populateMandartDropdown,
} from "../utils/MandArtList.js";

// Assume we have a function that returns the currently loaded MandArt
function getCurrentMandArt() {
  return window.currentMandArt || null; // Ensure global access
}

// 🌍 Store `updateCanvasSource` globally
window.canvasSourceFunctions = setupCanvasSource();

// ✅ Global MandArt Loader Instance
const mandArtLoader = new MandArtLoader();

// ✅ Ensure app initializes after DOM loads
document.addEventListener("DOMContentLoaded", initApp);

// ✅ Initialize the MandArt Web App
export async function initApp() {
  console.log("🚀 Initializing MandArt Web...");

  // ✅ Ensure global MandArt name storage
  window.currentMandArtPath = "No MandArt Loaded";

  // ✅ Initialize the UI components first
  setupCanvasSource();

  let canvasFunctions = null;
  let wasmModule = null;

  try {
    wasmModule = await loadWasm();
    if (!wasmModule) throw new Error("⚠️ WASM module failed to initialize.");
    console.log("✅ WASM Loaded Successfully.");
  } catch (error) {
    console.warn("⚠️ WASM failed to load. Using fallback mode:", error);
  }

  try {
    setupHeader();
    await setupFileInput();
    console.log("✅ Header and File Input Setup Complete.");
  } catch (error) {
    console.error("❌ Error setting up header and file input:", error);
  }

  const mandartSelect = document.getElementById("mandartSelect");
  if (!mandartSelect) {
    console.warn(
      "⚠️ mandartSelect not found! Waiting for the DOM to fully load..."
    );
    await new Promise((resolve) => setTimeout(resolve, 100)); // Slight delay
  }

  try {
    // ✅ Try to use WASM first, fallback to JavaScript if unavailable
    if (wasmModule) {
      canvasFunctions = setupCanvasWithWasm(wasmModule);
    } else {
      canvasFunctions = setupCanvas(
        () => window.currentMandArt,
        () => window.currentHues || []
      );
    }

    // ✅ Initialize Main Components (below heade)

    setupCanvasSource();
    setupColorEditor(mandArtLoader);
    console.log("✅ Canvas and Color Editor Initialized.");
  } catch (error) {
    console.error("❌ Error initializing Canvas:", error);
  }

  try {
    // ✅ Setup Catalog
    await setupCatalog();
    console.log("✅ MandArt catalog loaded successfully.");
  } catch (error) {
    console.error("❌ Failed to set up MandArt catalog:", error);
  }

  try {
    // ✅ Now load Default MandArt, AFTER UI is set up
    console.log("📌 Loading Default MandArt at the end of UI setup...");
    await mandArtLoader.loadDefaultMandArt();
  } catch (error) {
    console.error("❌ Failed to load default MandArt:", error);
  }

  try {
    // ✅ Fetch MandArt List & Populate Dropdown
    const mandArtList = await loadMandArtList();

    if (!Array.isArray(mandArtList) || mandArtList.length === 0) {
      throw new Error("❌ No MandArt list available or it's not an array.");
    }

    console.log(`🎨 Found ${mandArtList.length} items...`);
    populateMandartDropdown("mandartSelect", mandArtList);
    console.log("✅ MandArt dropdown populated successfully.");
  } catch (error) {
    console.error("❌ Failed to load MandArt list:", error);
  }

  window.canvasSourceFunctions = {
    updateCanvasSource
};
setupCanvasSource(getCurrentMandArt);


  console.log("✅ MandArt Web initialized successfully.");
}
