// MandArtDataLoader.js
import { convertMandArtFilename, extractFileName } from "../utils/FileNameUtils.js";
import { fetchAndParseCSV } from "../utils/FileUtils.js";
import { colorGrid } from "../utils/WasmLoader.js";
import { MandArtGridComputer } from './MandArtGridComputer.js';


/**
 * Loads MandArt data from various sources and manages the current MandArt data.
 */
export class MandArtDataLoader {
  constructor(useFastCalc = true) {
    this.currentMandArt = null;
    this.currentSourcePath = "";
    this.currentDisplayName = "No MandArt Loaded";
    this.hues = [];
    this.useFastCalc = useFastCalc;
    this.gridComputer = new MandArtGridComputer();
  }

  /**
   * Loads MandArt data from various sources.
   * @param {string} source - The source of the MandArt data.
   * @param {string} type - The type of the source (file, url, catalog, dropdown, default).
   * @param {Object} [jsonData=null] - Optional JSON data for file type.
   * @returns {Promise<void>}
   */
  async loadFromAnywhere(source, type, jsonData = null) {
    console.log("🔍 Loading MandArt from anywhere...", { source, type, jsonData });

    const sources = {
      'file': {
        path: source,
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
      console.log("✅ Processing MandArt JSON from file...");
      await this.loadMandArtFromFile(jsonData, config.displayName);
    } else {
      await this.loadMandArt(config.path, config.imagePath, config.displayName);
    }
  }

  /**
   * Loads MandArt data from a file.
   * @param {Object} jsonData - The JSON data of the MandArt file.
   * @param {string} displayName - The display name of the MandArt.
   * @returns {Promise<void>}
   */
  async loadMandArtFromFile(jsonData, displayName) {
    console.log("📥 Loading MandArt from file...", { displayName });

    try {
      if (!jsonData || !jsonData.hues || !Array.isArray(jsonData.hues)) {
        throw new Error("❌ MandArt JSON is missing 'hues' or it's not an array.");
      }

      this.currentMandArt = jsonData;
      this.currentDisplayName = displayName || jsonData.name || "Untitled MandArt";

      this.picdef = jsonData;
      if (!this.picdef) {
        console.warn("⚠️ picdef not found in MandArt JSON.");
      }

      this.hues = jsonData.hues || [];
      if (this.hues.length === 0) {
        console.warn("⚠️ No hues found in MandArt JSON.");
      }
      console.log("🔄 Checking for precomputed grid...");
      this.grid = await this.loadOrComputeGridFromFile(jsonData, this.currentDisplayName);
      this.coloredGrid = this.useFastCalc ? this.fastColor() : await colorGrid(this.grid, this.hues);
      console.log("🎨 Coloring complete.");
      this.notifyUIUpdate();
    } catch (error) {
      console.error("❌ Failed to load MandArt from file:", error);
      this.currentMandArt = null;
      this.notifyUIUpdate();
      throw error;
    }
  }


  /**
   * Loads MandArt data from a source path.
   * @param {string} sourcePath - The path of the MandArt source.
   * @param {string} [imagePath=""] - The path of the MandArt image.
   * @param {string} [displayName="Unnamed"] - The display name of the MandArt.
   * @returns {Promise<void>}
   */
  async loadMandArt(sourcePath, imagePath = "", displayName = "Unnamed") {
    console.log(`📥 Loading MandArt...`, { sourcePath, imagePath, displayName });

    try {
      const response = await fetch(sourcePath);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const jsonData = await response.json();
      this.currentMandArt = jsonData;
      this.currentSourcePath = sourcePath;
      this.currentDisplayName = displayName || jsonData.name || "Untitled MandArt";

      this.picdef = jsonData;
      this.hues = jsonData.hues || [];

      console.log("✅ MandArt loaded:", this.currentDisplayName);

      return jsonData;  // Return JSON so MandArtLoader can continue processing
    } catch (error) {
      console.error("❌ Failed to load MandArt:", error);
      throw error;
    }
  }


  /**
   * Retrieves the current MandArt data.
   * @returns {Object|null} The current MandArt data or null if not loaded.
   */
  getCurrentMandArt() {
    return this.currentMandArt;
  }

  /**
   * Retrieves the current source path.
   * @returns {string} The current source path.
   */
  getCurrentSourcePath() {
    return this.currentSourcePath;
  }

  /**
   * Retrieves the current display name.
   * @returns {string} The current display name.
   */
  getDisplayName() {
    return this.currentDisplayName;
  }

  /**
   * Retrieves the hues array.
   * @returns {Array} The hues array.
   */
  getHues() {
    if (!this.hues || this.hues.length === 0) {
      console.warn("⚠️ getHues() returning empty array!");
      return [];
    }
    return this.hues;
  }



}