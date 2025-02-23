import { loadPrecomputedGrid } from "../utils/GridUtils.js";
import { rgbToHex, hexToRgb } from "../utils/ColorUtils.js";
import { extractFileName } from "../utils/FileNameUtils.js";
import { reassignHueNumbers } from "../utils/HueUtils.js";
import { calcGrid, colorGrid } from "../utils/WasmLoader.js";
import { generateGrid, applyColoring } from "../utils/GridUtils.js";

export class MandArtLoader {
  constructor() {
    this.currentMandArt = null;
    this.currentSourcePath = "";
    this.currentDisplayName = "No MandArt Loaded";
    this.hues = [];
    this.uiUpdateCallbacks = [];
    this.grid = null; // computed grid
    this.coloredGrid = null; // colored grid
  }

  // Add a callback for UI updates
  addUIUpdateCallback(callback) {
    this.uiUpdateCallbacks.push(callback);
  }

  // Notify all UI elements that need updating
  notifyUIUpdate() {
    this.uiUpdateCallbacks.forEach(callback => callback({
      displayName: this.currentDisplayName,
      sourcePath: this.currentSourcePath,
      hues: this.hues,
        grid: this.grid,
        coloredGrid: this.coloredGrid
    }));
  }

  async loadFromAnywhere(source, type, jsonData = null) {
    console.log("🔍 Loading MandArt from anywhere...");
    console.log("🔍 Source:", source);
    console.log("🔍 Type:", type);
    console.log("🔍 JSON:", jsonData);

    const sources = {
      'file': {
        path: source, // The File object itself
        imagePath: '',
        displayName: source.name?.replace('.mandart', '')
      },
      'url': {
        path: source,
        imagePath: '',
        displayName: 'Custom URL'
      },
      'catalog': {
        path: `assets/MandArt_Catalog/${source}.mandart`,
        imagePath: `assets/MandArt_Catalog/${source}.png`,
        displayName: source
      },
      'dropdown': {
        path: `assets/MandArt_Catalog/${source}.mandart`,
        imagePath: `assets/MandArt_Catalog/${source}.png`,
        displayName: source
      },
      'default': {
        path: 'assets/MandArt_Catalog/Default.mandart',
        imagePath: '',
        displayName: 'Default'
      }
    };

    const config = sources[type];

    if (type === 'file') {
      console.log("🔍 Type is file:", type);
      console.log("✅ Processing MandArt JSON from file...");
      await this.loadMandArtFromFile(jsonData, config.displayName);
    } else {
      await this.loadMandArt(config.path, config.imagePath, config.displayName);
    }
  }

  async loadMandArtFromFile(jsonData, displayName) {
    console.log("📥 Loading MandArt from file...", { displayName });

    try {
      // Validate JSON structure
      if (!jsonData || !Array.isArray(jsonData.hues)) {
        throw new Error("❌ MandArt JSON is missing 'hues' or it's not an array.");
      }

      console.log("🔄 Standardizing hues...");

      // Standardize hues like loadMandArt does
      const standardizedData = {
        name: jsonData.name || displayName,
        hues: jsonData.hues.map((hue, index) => ({
          r: hue.r !== undefined ? Math.round(hue.r) : Math.round((hue.color?.red ?? 0) * 255),
          g: hue.g !== undefined ? Math.round(hue.g) : Math.round((hue.color?.green ?? 0) * 255),
          b: hue.b !== undefined ? Math.round(hue.b) : Math.round((hue.color?.blue ?? 0) * 255),
          num: hue.num !== undefined ? hue.num : index + 1
        }))
      };

      console.log("✅ Standardized MandArt JSON:", standardizedData);

      await this.processMandartData(standardizedData, displayName);
    } catch (error) {
      console.error("❌ Failed to load MandArt from file:", error);
      this.currentMandArt = null;
      this.currentDisplayName = "Error Loading MandArt";
      this.currentSourcePath = "Error";
      this.hues = [];
      this.notifyUIUpdate();
      throw error;
    }
  }

  async loadMandArt(sourcePath, imagePath = "", displayName = "Unnamed") {
    console.log("📥 Loading MandArt...", { sourcePath, imagePath, displayName });

    try {
      let jsonData;
      let finalName = displayName;

      if (typeof sourcePath === "string") {
        if (sourcePath.startsWith("http") || sourcePath.startsWith("assets/")) {
          console.log(`🌐 Fetching MandArt JSON from: ${sourcePath}`);
          const response = await fetch(sourcePath);
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          jsonData = await response.json();
          this.currentSourcePath = sourcePath;
          finalName = extractFileName(sourcePath);
        } else {
          jsonData = JSON.parse(sourcePath);
          this.currentSourcePath = displayName;
        }
      } else {
        jsonData = sourcePath;
        this.currentSourcePath = displayName;
      }

      // Ensure JSON is processed after loading
      await this.processMandartData(jsonData, finalName);

    } catch (error) {
      console.error("❌ Failed to load MandArt:", error);
      this.currentMandArt = null;
      this.currentDisplayName = "Error Loading MandArt";
      this.currentSourcePath = "Error";
      this.hues = [];
      this.notifyUIUpdate();
      throw error;
    }
  }

  async processMandartData(jsonData, displayName) {
    console.log("🖌️ Processing MandArt data...");

    try {
      if (!jsonData || !jsonData.hues || !Array.isArray(jsonData.hues)) {
        throw new Error("❌ MandArt JSON is missing 'hues' or it's not an array.");
      }

      // Update internal state
      this.currentMandArt = jsonData;
      this.currentDisplayName = displayName || jsonData.name || "Untitled MandArt";
      this.currentSourcePath = this.currentSourcePath || "Unknown Source";

      // Process hues
      this.hues = jsonData.hues.map((hue, index) => ({
        r: hue.r !== undefined ? Math.round(hue.r) : Math.round((hue.color?.red ?? 0) * 255),
        g: hue.g !== undefined ? Math.round(hue.g) : Math.round((hue.color?.green ?? 0) * 255),
        b: hue.b !== undefined ? Math.round(hue.b) : Math.round((hue.color?.blue ?? 0) * 255),
        num: hue.num !== undefined ? hue.num : index + 1
      }));

      console.log("✅ MandArt processed successfully:", {
        name: this.currentDisplayName,
        source: this.currentSourcePath,
        hueCount: this.hues.length
      });


      // Step 1: Compute Grid using WASM
      this.grid = await calcGrid(jsonData);
      if (!this.grid) throw new Error("❌ Failed to compute grid using WASM.");
      console.log("🧮 Computed Grid:", this.grid);

      // Step 2: Color Grid using WASM
      this.coloredGrid = await colorGrid(this.grid, this.hues);
      if (!this.coloredGrid) throw new Error("❌ Failed to color grid using WASM.");
      console.log("🎨 Colored Grid:", this.coloredGrid);

      console.log("🔔 Forcing UI Update Notification");
      this.notifyUIUpdate();

    } catch (error) {
      console.error("❌ Error processing MandArt:", error);
      throw error;
    }
  }

  async loadDefaultMandArt() {
    console.log("📌 Loading Default MandArt...");
    try {
      await this.loadMandArt(
        "assets/MandArt_Catalog/Default.mandart",
        "",
        "Default"
      );
    } catch (error) {
      console.error("❌ Failed to load default MandArt:", error);
      throw error;
    }
  }

  // Keep your existing methods for handling hues
  addNewColor() {
    // Your existing code
    this.notifyUIUpdate();  // Add this line
  }

  updateMandColor(index, hexColor) {
    // Your existing code
    this.notifyUIUpdate();  // Add this line
  }

  removeHue(index) {
    // Your existing code
    this.notifyUIUpdate();  // Add this line
  }

  // Getter methods for UI components
  getDisplayName() {
    return this.currentDisplayName;
  }

  getSourcePath() {
    return this.currentSourcePath;
  }

  getCurrentMandArt() {
    return this.currentMandArt;
  }

  getHues() {
    return [...this.hues];  // Return a copy to prevent direct mutation
  }
}