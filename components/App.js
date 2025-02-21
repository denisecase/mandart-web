// ✅ Import Dependencies
import { setupCanvas, setupCanvasWithWasm } from "./Canvas.js";
import { setupColorEditor } from "./ColorEditor.js";
import { setupHeader } from "./Header.js";
import { setupCanvasSource } from "./CanvasSource.js";
import { setupCatalog } from "./Catalog.js";
import { setupFileInput } from "./FileInput.js";

import { loadWasm } from "../utils/WasmLoader.js";
import { MandArtLoader } from "./MandArtLoader.js";
import {
  loadMandArtList,
  populateMandartDropdown,
} from "../utils/MandArtList.js";

// ✅ Global MandArt Loader Instance
const mandArtLoader = new MandArtLoader();

// ✅ Ensure app initializes after DOM loads
document.addEventListener("DOMContentLoaded", initApp);

export async function initApp() {
  console.log("🚀 Initializing MandArt Web...");

  let canvasFunctions = null;
  let canvasSource = null;
  let wasmModule = null;

  try {
    wasmModule = await loadWasm();
    if (!wasmModule) throw new Error("⚠️ WASM module failed to initialize.");
    console.log("✅ WASM Loaded Successfully.");
  } catch (error) {
    console.warn("⚠️ WASM failed to load. Using fallback mode:", error);
  }

  try {
    setupHeader(); // ✅ Setup header first
    await setupFileInput(); // ✅ Ensure file input setup happens once
    console.log("✅ Header and File Input Setup Complete.");
  } catch (error) {
    console.error("❌ Error initializing UI components:", error);
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


    setupCanvasSource();
    setupColorEditor(mandArtLoader, getCanvas, recolorCanvas);
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
    // ✅ Fetch MandArt List & Populate Dropdown
    const mandArtList = await loadMandArtList();

    if (!Array.isArray(mandArtList) || mandArtList.length === 0) {
      throw new Error("❌ No MandArt list available or it's not an array.");
    }

    console.log(
      `🎨 Populating MandArt Dropdown with ${mandArtList.length} items...`
    );
    populateMandartDropdown("mandartSelect", mandArtList);
    console.log("✅ MandArt dropdown populated successfully.");
  } catch (error) {
    console.error("❌ Failed to load MandArt list:", error);
  }

  try {
    await mandArtLoader.loadDefaultMandArt();
  } catch (error) {
    console.error("❌ Failed to load default MandArt:", error);
  }

  console.log("✅ MandArt Web initialized successfully.");
}
