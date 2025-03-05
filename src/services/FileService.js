/**
 * src/services/FileService.js
 * Handles file I/O operations: reading and writing MandArt, PNG, and CSV files.
 */

import PathConfig from '../core/PathConfig.js';

// Store for the current grid data
let gridData = null;

/**
 * Reads a `.mandart` file (JSON format).
 * @param {File} file - The file to read.
 * @returns {Promise<object>} Parsed MandArt JSON data.
 */
export async function readMandArtFile(file) {
  try {
    if (!file) throw new Error("No file provided");
    console.log(`📂 Reading MandArt file: ${file.name}`);

    const fileContent = await file.text();
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("❌ Error reading MandArt file:", error);
    return null;
  }
}

/**
 * Saves a MandArt object as a `.mandart` file.
 * @param {object} data - The MandArt JSON data.
 * @param {string} filename - The filename (default: "art.mandart").
 */
export function saveMandArt(data, filename = "art.mandart") {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    triggerDownload(blob, filename);
    console.log(`✅ MandArt saved as ${filename}`);
  } catch (error) {
    console.error("❌ Error saving MandArt file:", error);
  }
}

/**
 * Saves a grid as a CSV file.
 * @param {Array<Array<number>>} grid - The grid data to save.
 * @param {string} name - Base name for the file (optional).
 */
export function saveGrid(grid, name = "grid") {
  try {
    if (!grid || !Array.isArray(grid) || !grid.length) {
      console.error("❌ Invalid grid data for saving");
      return;
    }

    const filename = `${name}_grid.csv`;
    const csvContent = grid.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });

    triggerDownload(blob, filename);
    console.log(`✅ Grid saved as ${filename}`);
  } catch (error) {
    console.error("❌ Error saving grid:", error);
  }
}

/**
 * Saves a PNG file from a given canvas element.
 * @param {HTMLCanvasElement} canvas - The canvas to save.
 * @param {string} filename - The filename (default: "art.png").
 */
export function saveCanvasAsPNG(canvas, filename = "art") {
  if (!canvas) {
    console.error("❌ Invalid canvas element.");
    return;
  }

  // Ensure filename has .png extension
  if (!filename.toLowerCase().endsWith('.png')) {
    filename = `${filename}.png`;
  }

  canvas.toBlob((blob) => {
    triggerDownload(blob, filename);
    console.log(`✅ Canvas saved as ${filename}`);
  }, "image/png");
}

/**
 * Reads and parses a CSV file.
 * @param {File} file - The CSV file.
 * @returns {Promise<Array>} Parsed CSV data as a 2D array.
 */
export async function readCSVFile(file) {
  try {
    if (!file) throw new Error("No file provided");
    console.log(`📂 Reading CSV file: ${file.name}`);

    const text = await file.text();
    return parseCSV(text);
  } catch (error) {
    console.error("❌ Error reading CSV file:", error);
    return null;
  }
}

/**
 * Parses a CSV string into a 2D array.
 * @param {string} text - The CSV text.
 * @returns {Array<Array>} Parsed CSV data.
 */
export function parseCSV(text) {
  return text.trim().split("\n").map((line) => line.split(",").map(Number));
}

/**
 * Triggers a file download.
 * @param {Blob} blob - The file content as a Blob.
 * @param {string} filename - The filename for the download.
 */
export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Loads a precomputed grid from the specified name.
 * @param {string} gridName - Name of the grid file (without extension).
 * @returns {Promise<Array|null>} The parsed grid data or null if not found.
 */
export async function loadPrecomputedGrid(gridName) {
  try {
      if (!gridName) {
          console.warn("⚠️ No grid name provided");
          return null;
      }
      
      // Convert spaces to underscores for filesystem compatibility
      const safeGridName = gridName.replace(/\s+/g, '_');
      
      // Construct path using PathConfig - use specific path for grid files
      const filePath = `${PathConfig.getCatalogPath()}/${safeGridName}.csv`;
      console.log(`📂 Loading Precomputed Grid: ${filePath}`);
      
      const response = await fetch(filePath);
      
      if (!response.ok) {
          if (response.status === 404) {
              console.warn(`⚠️ Precomputed grid file not found: ${filePath}`);
              return null;
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const csvText = await response.text();
      gridData = parseCSVGrid(csvText);
      return gridData;
  } catch (error) {
      console.error("❌ Failed to load grid:", error);
      return null;
  }
}



/**
 * Parses CSV text into a grid data structure.
 * @param {string} csvText - The CSV text to parse.
 * @returns {Array<Array<number>>} The parsed grid data.
 */
export function parseCSVGrid(csvText) {
  const parsed = csvText
    .trim()
    .split("\n")
    .map((row) => row.split(",").map(Number));

  console.log("✅ Parsed Grid Data:", parsed.length > 0 ? `${parsed.length}x${parsed[0].length}` : "Empty");
  return parsed;
}

/**
 * Saves any file data.
 * @param {Object|Array} data - The data to save.
 * @param {string} filename - The filename.
 */
export function saveFile(data, filename) {
  try {
    // Handle different file types based on extension
    if (filename.endsWith('.mandart')) {
      return saveMandArt(data, filename);
    } else if (filename.endsWith('.csv')) {
      return saveGrid(data, filename.replace('.csv', ''));
    } else {
      // Generic JSON save
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      triggerDownload(blob, filename);
      console.log(`✅ File saved as ${filename}`);
    }
  } catch (error) {
    console.error(`❌ Error saving file ${filename}:`, error);
  }
}

// Create a singleton instance
const fileService = {
  readMandArtFile,
  saveMandArt,
  saveCanvasAsPNG,
  readCSVFile,
  parseCSV,
  loadPrecomputedGrid,
  parseCSVGrid,
  saveGrid,
  saveFile
};

export default fileService;