import { extractFileName, convertMandArtFilename } from "../utils/FileNameUtils.js";
import { calcGrid, colorGrid } from "../utils/WasmLoader.js";
import { fetchAndParseCSV, saveGridToCSV } from "../utils/FileUtils.js";
import { MandArtDataLoader } from './MandArtDataLoader.js';
import { MandArtGridComputer } from './MandArtGridComputer.js';
import { MandArtColorApplier } from './MandArtColorApplier.js';
import { MandArtUIUpdater } from './MandArtUIUpdater.js';

/**
 * MandArtLoader class for loading and processing MandArt data.
 */
export class MandArtLoader {
  constructor() {

    this.dataLoader = new MandArtDataLoader();
    this.gridComputer = new MandArtGridComputer();
    this.colorApplier = new MandArtColorApplier();
    this.uiUpdater = new MandArtUIUpdater();
    this.uiUpdateCallbacks = [];
    this.grid = null;
  }

  /**
  * Enable full grid computation mode.
  */
  enableFullCalc() {
    console.warn("🔧 Developer Mode: Full grid computation enabled.");
    this.gridComputer.useFastCalc = false;
  }

  /**
   * Enable fast calculation mode.
   */
  enableFastCalc() {
    console.log("⚡ Fast Calculation Mode Enabled.");
    this.gridComputer.useFastCalc = true;
  }

  /**
   * Add a callback for UI updates.
   * @param {Function} callback - The callback function to be added.
   */
  addUIUpdateCallback(callback) {
    this.uiUpdateCallbacks.push(callback);
  }

  /**
   * Notify all UI elements that need updating.
   */
  notifyUIUpdate() {
    console.log("🔄 Notifying UI Update...");

    const data = {
      displayName: this.dataLoader.getDisplayName(),
      sourcePath: this.dataLoader.getCurrentSourcePath(),
      hues: this.dataLoader.getHues(),
      grid: this.grid,
      coloredGrid: this.colorApplier.getColoredGrid()
    };

    this.uiUpdater.updateUI(data); 
    this.uiUpdateCallbacks.forEach(callback => callback(data));
  }

  /**
 * Loads MandArt data from various sources.
 * @param {string} source - The source of the MandArt data.
 * @param {string} type - The type of the source (file, url, catalog, dropdown, default).
 * @param {Object} [jsonData=null] - Optional JSON data for file type.
 * @returns {Promise<void>}
 */
  async loadFromAnywhere(source, type, jsonData = null) {
    await this.dataLoader.loadFromAnywhere(source, type, jsonData);
    this.grid = await this.gridComputer.loadOrComputeGridFromFile(
      this.dataLoader.getCurrentMandArt(),
      this.dataLoader.getDisplayName()
    );
    await this.applyColors();
    this.notifyUIUpdate();
  }

  /**
  * Loads the default MandArt.
  * @returns {Promise<void>}
  */
  async loadDefaultMandArt() {
    console.log("📌 Loading Default MandArt...");
    try {
      this.picdef = await this.dataLoader.loadFromAnywhere("default", "default");
      this.hues = this.dataLoader.getHues();
      console.log("🎨 Retrieved hues:", this.hues);
      this.grid = await this.gridComputer.loadOrComputeGridFromFile(this.picdef, this.dataLoader.getDisplayName());
      await this.colorApplier.applyColors(this.grid, this.dataLoader.getHues());
      this.notifyUIUpdate();
      console.log("✅ Default MandArt loaded successfully.");
    } catch (error) {
      console.error("❌ Failed to load default MandArt:", error);
      throw error;
    }
  }

  /**
   * Loads MandArt data from a file.
   * @param {Object} jsonData - The JSON data of the MandArt file.
   * @param {string} displayName - The display name of the MandArt.
   * @returns {Promise<void>}
   */
  async loadMandArtFromFile(jsonData, displayName) {
    await this.dataLoader.loadMandArtFromFile(jsonData, displayName);
    this.grid = await this.gridComputer.loadOrComputeGridFromFile(jsonData, displayName);
    await this.applyColors();
    this.notifyUIUpdate();
  }

  /**
   * Loads MandArt data from a source path.
   * @param {string} sourcePath - The path of the MandArt source.
   * @param {string} [imagePath=""] - The path of the MandArt image.
   * @param {string} [displayName="Unnamed"] - The display name of the MandArt.
   * @returns {Promise<void>}
   */
  async loadMandArt(sourcePath, imagePath = "", displayName = "Unnamed") {
    await this.dataLoader.loadMandArt(sourcePath, imagePath, displayName);
    this.grid = await this.gridComputer.loadOrComputeGridFromFile(
      this.dataLoader.getCurrentMandArt(),
      displayName
    );
    await this.applyColors();
    this.notifyUIUpdate();
  }

  /**
  * Applies colors to the grid.
  */
  async applyColors() {
    console.log(`🎨 Applying colors...`);
    if (!this.grid || !this.dataLoader.getHues().length) {
      console.error("❌ Missing grid data or hues. Cannot process MandArt.");
      return;
    }
    this.colorApplier.applyColors(this.grid, this.dataLoader.getHues());
    this.notifyUIUpdate();
    console.log(`✅ Successfully applied colors.`);
  }

  /**
   * Load or compute the grid from a MandArt file.
   * @param {Object} jsonData - The JSON data of the MandArt file.
   * @param {string} displayName - The display name of the MandArt.
   * @returns {Promise<Array>} - A promise that resolves to the grid data.
   */
  async loadOrComputeGridFromFile(jsonData, displayName) {
    console.log("🔄 Loading or Computing fIter Grid from File...", { displayName });

    try {
      const { newPath } = convertMandArtFilename(displayName, "csv", "assets/MandArt_Catalog");
      let csvData = await fetchAndParseCSV(newPath);
      if (csvData) {
        console.log(`✅ Loaded precomputed fIter from ${newPath}`);
        return csvData;
      } else {
        console.warn(`⚠️ No precomputed grid found for ${displayName}.`);
      }
      if (this.useFastCalc) {
        console.log("🚀 Fast mode enabled. Using a dummy grid.");
        return this.generateDummyGrid(jsonData);
      }
      console.warn("🧮 No CSV found. Computing full grid in JavaScript...");
      this.grid = await calcGrid(jsonData);
      console.log("🧮 Computed Grid:", this.grid);
      if (!this.useFastCalc) {
        console.log("💾 Saving computed grid to CSV...");
        saveGridToCSV(this.grid);
      } else {
        console.log("🚀 Fast mode enabled. Skipping CSV save.");
      }
      return this.grid;

    } catch (error) {
      console.error("❌ Error computing/loading fIter grid from file:", error);
      throw error;
    }
  }



  async processMandartWithPrecomputedGrid() {
    console.log(`🎨 Applying precomputed grid for: ${this.currentSourcePath}`);
    try {
      this.setDisplayNames(this.currentSourcePath);
      if (!this.grid || !this.hues.length) {
        throw new Error("❌ Missing grid data or hues. Cannot process MandArt.");
      }
      this.coloredGrid = await colorGrid(this.grid, this.hues);
      this.notifyUIUpdate();
      console.log(`✅ Successfully applied precomputed grid for: ${this.getDisplayName()}`);
    } catch (error) {
      console.error("❌ Error processing MandArt with precomputed grid:", error);
      throw error;
    }
  }


  setDisplayNames(sourcePath) {
    this.currentDisplayName = extractFileName(sourcePath); // No extension
    this.mandartFileShortName = extractFileName(sourcePath, true); // Keep extension
    console.log("✅ Set Names - Display:", this.currentDisplayName, "| File Short Name:", this.mandartFileShortName);
  }

  getMandArtFileShortName() {
    return this.mandartFileShortName;
  }

  getDisplayName() {
    return this.currentDisplayName;
  }

  extractFileName(filePath, keepExtension = false) {
    if (!filePath) return "";
    const parts = filePath.split("/");
    const fileName = parts[parts.length - 1]; // Extract file name
    return keepExtension ? fileName : fileName.replace(/\.mandart$/, ""); // Remove extension if needed
  }

  async computeGridInJS(picdef) {
    console.log("🧮 Computing Grid in JavaScript...");
    if (!picdef) {
      console.warn("⚠️ No valid picdef. Using default size (10x10).");
      return Array.from({ length: 10 }, () => Array(10).fill(1));
    }
    const height = picdef.imageHeight;
    const width = picdef.imageWidth;
    console.log(`🛠️ Generating computed grid (${height} x ${width})`);
    return Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => (y * width + x) % this.hues.length + 1)
    );
  }

  generateDummyGrid(picdef) {
    console.log("⚡ Generating dummy grid...");
    const width = picdef?.imageWidth || 1000;
    const height = picdef?.imageHeight || 1000;
    let dummyGrid = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => 1)
    );
    console.log(`✅ Dummy grid generated: ${height}x${width}`);
    return dummyGrid;
  }

  /**
 * Applies fast coloring to the grid based on the provided hues.
 * @param {Array} grid - The computed grid data.
 * @param {Array} hues - The array of hues.
 * @returns {Array} The colored grid.
 */
  fastColor() {
    this.colorApplier.fastColor(this.grid, this.hues);
  }

  /**
 * Reassigns hue numbers sequentially after a deletion.
 * Ensures `num` values are unique, sequential, and ordered correctly.
 *
 * @param {Array} hues - The list of hues to be renumbered.
 * @returns {Array} - The updated hues list with corrected `num` values.
 */
  reassignHueNumbers(hues) {
    return hues.map((hue, index) => ({
      ...hue,
      num: index + 1 // ✅ Reassign sequential numbers starting from 1
    }));
  }

  /**
 * Removes a hue and updates the colored grid.
 * @param {number} index - The index of the hue to remove.
 */
  removeHue(index) {
    let hues = this.dataLoader.getHues();
    if (!hues || index < 0 || index >= hues.length) {
      console.warn("❌ Invalid hue index:", index);
      return;
    }

    console.log(`🗑 Removing hue at index: ${index}`);
    hues.splice(index, 1);

    // Reassign numbers and apply colors
    hues = hues.map((hue, i) => ({ ...hue, num: i + 1 }));
    this.colorApplier.applyColors(this.grid, hues);

    // Update UI
    this.notifyUIUpdate();
    console.log("🎨 Hue removed and UI updated.");
  }


  addHue() {
    let hues = this.dataLoader.getHues();

    if (!hues) {
      console.warn("⚠️ No hues array found. Initializing a new one.");
      hues = [];
    }

    const maxNum = hues.length > 0 ? Math.max(...hues.map(hue => hue.num)) : 0;
    const newHue = { r: 0, g: 0, b: 0, num: maxNum + 1 };

    hues.push(newHue);

    // Apply new colors
    this.colorApplier.applyColors(this.grid, hues);

    // Update UI
    this.notifyUIUpdate();
    console.log(`🎨 Added new hue:`, newHue);
  }

}
