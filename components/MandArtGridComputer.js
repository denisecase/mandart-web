import { fetchAndParseCSV, saveGridToCSV } from "../utils/FileUtils.js";
import { calcGrid } from "../utils/WasmLoader.js";
import { convertMandArtFilename } from "../utils/FileNameUtils.js";

/**
 * Handles MandArt grid computation, including loading precomputed grids or computing new ones.
 */
export class MandArtGridComputer {
  constructor(useFastCalc = true) {
    this.grid = null;
    this.useFastCalc = useFastCalc;
  }

  /**
   * Loads or computes the grid from a MandArt file.
   * @param {Object} jsonData - The JSON data of the MandArt file.
   * @param {string} displayName - The display name of the MandArt.
   * @returns {Promise<Array>} - A promise that resolves to the grid data.
   */
  async loadOrComputeGridFromFile(jsonData, displayName) {
    console.log("🔄 Checking for precomputed grid...", { displayName });

    try {
      // Try loading the precomputed grid first
      const { newPath } = convertMandArtFilename(displayName, "csv", "assets/MandArt_Catalog");
      let csvData = await fetchAndParseCSV(newPath);
      
      if (csvData) {
        console.log(`✅ Loaded precomputed grid from ${newPath}`);
        return csvData;
      } else {
        console.warn(`⚠️ No precomputed grid found for ${displayName}.`);
      }

      // If precomputed grid isn't found, decide based on fast mode
      if (this.useFastCalc) {
        console.log("🚀 Fast mode enabled. Using a dummy grid.");
        return this.generateDummyGrid(jsonData);
      }

      // Otherwise, compute the full grid
      console.warn("🧮 No CSV found. Computing full grid in JavaScript...");
      this.grid = await calcGrid(jsonData);
      console.log("🧮 Computed Grid:", this.grid);

      // Save to CSV if full calculation was performed
      if (!this.useFastCalc) {
        console.log("💾 Saving computed grid to CSV...");
        saveGridToCSV(this.grid);
      } else {
        console.log("🚀 Fast mode enabled. Skipping CSV save.");
      }

      return this.grid;
    } catch (error) {
      console.error("❌ Error computing/loading grid from file:", error);
      throw error;
    }
  }

  /**
   * Generates a dummy grid for fast calculation mode.
   * @param {Object} picdef - The MandArt definition containing size details.
   * @returns {Array} A placeholder grid.
   */
  generateDummyGrid(picdef) {
    console.log("⚡ Generating dummy grid...");

    const width = picdef?.imageWidth || 100;
    const height = picdef?.imageHeight || 100;

    let dummyGrid = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => 1)
    );

    console.log(`✅ Dummy grid generated: ${height}x${width}`);
    return dummyGrid;
  }

  /**
   * Computes the grid manually using JavaScript (instead of WASM).
   * @param {Object} picdef - The MandArt definition containing size details.
   * @returns {Array} A computed grid.
   */
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
      Array.from({ length: width }, (_, x) => (y * width + x) % 10 + 1)
    );
  }
}
