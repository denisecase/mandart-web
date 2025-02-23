import { loadPrecomputedGrid } from "../utils/GridUtils.js";
import { rgbToHex, hexToRgb } from "../utils/ColorUtils.js";
import { extractFileName, convertMandArtFilename } from "../utils/FileNameUtils.js";
import { calcGrid, colorGrid } from "../utils/WasmLoader.js";
import { generateGrid, applyColoring } from "../utils/GridUtils.js";
import { fetchAndParseCSV, saveGridToCSV } from "../utils/FileUtils.js";

export class MandArtLoader {
  constructor() {
    this.currentMandArt = null;
    this.currentSourcePath = "";
    this.currentDisplayName = "No MandArt Loaded";
    this.hues = [];
    this.uiUpdateCallbacks = [];
    this.grid = null; // computed grid
    this.coloredGrid = null; // colored grid
    this.useFastCalc = true;  // ✅ Default to fast calcs
  }

  // ✅ Allow toggling the setting at runtime
  enableFullCalc() {
    console.warn("🔧 Developer Mode: Full grid computation enabled.");
    this.useFastCalc = false;
  }

  enableFastCalc() {
    console.log("⚡ Fast Calculation Mode Enabled.");
    this.useFastCalc = true;
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
      if (!jsonData || !jsonData.hues || !Array.isArray(jsonData.hues)) {
        throw new Error("❌ MandArt JSON is missing 'hues' or it's not an array.");
      }

      this.currentMandArt = jsonData;
      this.currentDisplayName = displayName || jsonData.name || "Untitled MandArt";

      // ✅ Extract `picdef`
      this.picdef = jsonData.picdef || null;
      if (!this.picdef) {
        console.warn("⚠️ picdef not found in MandArt JSON.");
      }

      // ✅ Extract hues
      this.hues = jsonData.hues || [];
      if (this.hues.length === 0) {
        console.warn("⚠️ No hues found in MandArt JSON.");
      }

      // ✅ Load or Compute Grid
      console.log("🔄 Checking for precomputed grid...");
      this.grid = await this.loadOrComputeGridFromFile(jsonData, this.currentDisplayName);

      // ✅ Apply Coloring (fast if `useFastCalc` is true)
      this.coloredGrid = this.useFastCalc ? this.fastColor() : await colorGrid(this.grid, this.hues);
      console.log("🎨 Coloring complete.");

      // ✅ Final UI update
      this.notifyUIUpdate();

    } catch (error) {
      console.error("❌ Failed to load MandArt from file:", error);
      this.currentMandArt = null;
      this.notifyUIUpdate();
      throw error;
    }
  }


  async loadMandArt(sourcePath, imagePath = "", displayName = "Unnamed") {
    console.log(`📥 Loading MandArt...`, { sourcePath, imagePath, displayName });

    try {
      let jsonData;
      let finalName = displayName;

      // ✅ If Default.mandart → Load Fast or Compute
      if (displayName === "Default" || sourcePath.includes("Default.mandart")) {
        console.log("🚀 Default.mandart detected. Loading precomputed grid...");

        const { newPath } = convertMandArtFilename("Default.mandart", "csv", "assets/MandArt_Catalog");

        // ✅ Fetch CSV **and** JSON in parallel
        const [csvData, response] = await Promise.all([
          fetchAndParseCSV(newPath),
          fetch(sourcePath)
        ]);

        // ✅ Load MandArt JSON
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        jsonData = await response.json();
        this.currentSourcePath = sourcePath;
        finalName = extractFileName(sourcePath);

        // ✅ Set displayName **before** any UI updates
        this.currentDisplayName = finalName;

        // ✅ Extract `picdef`
        this.picdef = jsonData;
        if (!this.picdef) console.warn("⚠️ picdef not found in MandArt JSON.");

        // ✅ Extract hues
        this.hues = this.picdef.hues || [];
        if (this.hues.length === 0) console.warn("⚠️ No hues found in MandArt JSON.");

        // ✅ Use CSV if available, otherwise decide based on `useFastCalc`
        if (csvData) {
          this.grid = csvData;
          console.log(`✅ Loaded precomputed grid from ${newPath}`);
        } else {
          if (this.useFastCalc) {
            console.warn("⚠️ No precomputed grid found. Using dummy grid.");
            this.grid = this.generateDummyGrid();
          } else {
            console.warn("⚠️ No precomputed grid found. Computing grid in JS.");
            this.grid = await this.computeGridInJS(jsonData);
          }
        }

        // ✅ Fast UI Update
        this.notifyUIUpdate();

        // ✅ Apply Coloring (fast if `useFastCalc` is true)
        this.coloredGrid = this.useFastCalc ? this.fastColor() : await colorGrid(this.grid, this.hues);
        console.log("🎨 Coloring complete.");

        // ✅ Final UI update
        this.notifyUIUpdate();
        return;
      }

      // ✅ If not Default, load JSON normally
      const response = await fetch(sourcePath);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      jsonData = await response.json();

      this.currentSourcePath = sourcePath;
      finalName = extractFileName(sourcePath);

      // ✅ Process MandArt JSON directly
      this.currentMandArt = jsonData;
      this.currentDisplayName = finalName || jsonData.name || "Untitled MandArt";
      this.currentSourcePath = sourcePath;

      // ✅ Extract picdef
      this.picdef = jsonData;
      if (!this.picdef) console.warn("⚠️ picdef not found in MandArt JSON.");

      // ✅ Extract hues
      this.hues = jsonData.hues || [];
      if (this.hues.length === 0) console.warn("⚠️ No hues found in MandArt JSON.");

      // ✅ Compute or Load Grid
      this.grid = await this.loadOrComputeGridFromFile(jsonData, finalName);

      // ✅ Apply Fast or Normal Coloring
      this.coloredGrid = this.useFastCalc ? this.fastColor() : await colorGrid(this.grid, this.hues);
      console.log("🎨 Coloring complete.");

      // ✅ Final UI update
      this.notifyUIUpdate();

    } catch (error) {
      console.error("❌ Failed to load MandArt:", error);
      this.notifyUIUpdate();
      throw error;
    }
  }


  async loadOrComputeGridFromFile(jsonData, displayName) {
    console.log("🔄 Loading or Computing fIter Grid from File...", { displayName });

    try {
      const { newPath } = convertMandArtFilename(displayName, "csv", "assets/MandArt_Catalog");

      // ✅ Try to fetch CSV
      let csvData = await fetchAndParseCSV(newPath);
      if (csvData) {
        console.log(`✅ Loaded precomputed fIter from ${newPath}`);
        return csvData;  // ✅ Fast case - return precomputed grid
      } else {
        console.warn(`⚠️ No precomputed grid found for ${displayName}.`);
      }

      // ✅ FAST MODE: Generate placeholder grid instead of computing
      if (this.useFastCalc) {
        console.log("🚀 Fast mode enabled. Using a dummy grid.");
        return this.generateDummyGrid(jsonData);
      }

      // ✅ Compute grid (only if NOT in fast mode)
      console.warn("🧮 No CSV found. Computing full grid in JavaScript...");
      this.grid = await calcGrid(jsonData);
      console.log("🧮 Computed Grid:", this.grid);

      // ✅ Only save the CSV when **not in fast mode**
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
      // ✅ Ensure display name is set before applying the precomputed grid
      this.setDisplayNames(this.currentSourcePath);

      // ✅ Check if grid and hues exist before processing
      if (!this.grid || !this.hues.length) {
        throw new Error("❌ Missing grid data or hues. Cannot process MandArt.");
      }

      // ✅ Apply color transformation
      this.coloredGrid = await colorGrid(this.grid, this.hues);

      // ✅ Force UI update
      this.notifyUIUpdate();

      console.log(`✅ Successfully applied precomputed grid for: ${this.getDisplayName()}`);
    } catch (error) {
      console.error("❌ Error processing MandArt with precomputed grid:", error);
      throw error;
    }
  }

  async loadDefaultMandArt() {
    console.log("📌 Loading Default MandArt...");
    try {
      await this.loadFromAnywhere("default", "default");
    } catch (error) {
      console.error("❌ Failed to load default MandArt:", error);
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

  fastColor() {
    console.log("🎨 Applying fast color...");

    if (!this.hues || this.hues.length === 0) {
      console.warn("⚠️ No hues available. Using default gray.");
      return this.grid.map(row => row.map(() => "#CCCCCC"));
    }

    // ✅ Find `num === 1` hue
    const primaryHue = this.hues.find(h => h.num === 1);
    if (!primaryHue) {
      console.warn("⚠️ No num===1 hue found. Using first available hue.");
    }

    const color = primaryHue ? rgbToHex(primaryHue.r, primaryHue.g, primaryHue.b) : "#CCCCCC";
    console.log("MandArtLoader.js:374 Color={}", color);

    // ✅ Apply color to all grid cells
    this.coloredGrid = this.grid.map(row => row.map(() => color));

    // ✅ Apply background color to `mandelbrotCanvas`
    setTimeout(() => {
      const canvas = document.getElementById("mandelbrotCanvas");
      if (canvas) {
        console.log(`🎨 Setting canvas background to: ${color}`);
        canvas.style.backgroundColor = color;
      } else {
        console.warn("❌ Canvas not found! Check ID.");
      }
    }, 100); // Slight delay to ensure DOM updates first

    return this.coloredGrid;
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

  removeHue(index) {
    if (!this.hues || index < 0 || index >= this.hues.length) {
      console.warn("❌ Invalid hue index:", index);
      return;
    }

    console.log(`🗑 Removing hue at index: ${index}`);

    // ✅ Remove the hue at the given index
    this.hues.splice(index, 1);

    // ✅ Reassign hue numbers sequentially
    this.hues = this.reassignHueNumbers(this.hues);

    // ✅ Reapply colors based on updated hues
    this.coloredGrid = this.useFastCalc
      ? this.fastColor()
      : colorGrid(this.grid, this.hues);

    // ✅ Ensure UI updates
    this.notifyUIUpdate();

    console.log("🎨 Hue removed and UI updated.");
  }


  addHue() {
    if (!this.hues) {
      console.warn("⚠️ No hues array found. Initializing a new one.");
      this.hues = [];
    }

    // ✅ Find the highest existing `num` value
    const maxNum = this.hues.length > 0
      ? Math.max(...this.hues.map(hue => hue.num))
      : 0;

    // ✅ Create a new black hue
    const newHue = {
      r: 0,
      g: 0,
      b: 0,
      num: maxNum + 1 // New hue number
    };

    // ✅ Append the new hue
    this.hues.push(newHue);

    // ✅ Reapply colors
    this.coloredGrid = this.useFastCalc
      ? this.fastColor()
      : colorGrid(this.grid, this.hues);

    // ✅ Ensure UI updates
    this.notifyUIUpdate();

    console.log(`🎨 Added new hue:`, newHue);
  }



}
