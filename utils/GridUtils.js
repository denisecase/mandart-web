// utils/GridUtils.js 

/**
 * Saves a 2D grid array as a CSV file.
 * @param {Array<Array<number>>} gridData - 2D array representing grid.
 * @param {string} filename - File name (default: "grid.csv").
 */
export function saveGridToCSV(gridData, filename = "grid.csv") {
    if (!Array.isArray(gridData) || !gridData.length) {
        console.error("❌ Invalid grid data.");
        return;
    }

    const csvContent = gridData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    triggerFileDownload(blob, filename);
}

/**
 * Loads a CSV file and parses it into a 2D array.
 * Calls the provided callback with parsed data.
 */
export function loadGridFromCSV(file, callback) {
    readFileAsText(file, (csvText) => {
        const gridData = csvText
            .trim()
            .split("\n")
            .map((row) => row.split(",").map(Number));
        
        callback(gridData);
    });
}

export async function loadPrecomputedGrid(filePath) {
    try {
        console.log(`📂 Loading Precomputed Grid: ${filePath}`);
        const response = await fetch(filePath);

        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`⚠️ Precomputed grid file not found: ${filePath}`);
                return false;
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const csvText = await response.text();
        parseCSVGrid(csvText);
        return true;
    } catch (error) {
        console.error("❌ Failed to load grid:", error);
        return false;
    }
}

export function parseCSVGrid(csvText) {
    gridData = csvText
        .trim()
        .split("\n")
        .map((row) => row.split(",").map(Number));

    console.log("✅ Parsed Grid Data:", gridData);
    drawPrecomputedGrid();
}

/**
 * Generates a basic grid as a fallback when WASM is unavailable.
 * @param {number} width - Width of the grid
 * @param {number} height - Height of the grid
 * @returns {Array} - 2D array representing the grid
 */
export function generateGrid(width, height) {
    console.log("🧮 Generating grid using JavaScript fallback...");
    const grid = new Array(height).fill(0).map(() =>
        new Array(width).fill(0).map(() => Math.floor(Math.random() * 10)) // Simple random values
    );
    return grid;
}

/**
 * Applies color mapping to a grid as a fallback when WASM is unavailable.
 * @param {Array} grid - 2D array of grid values
 * @param {Array} hues - Array of hues
 * @returns {Array} - Colored grid
 */
export function applyColoring(grid, hues) {
    console.log("🎨 Coloring grid using JavaScript fallback...");
    return grid.map(row => row.map(value => {
        const hueIndex = value % hues.length;
        return hues[hueIndex]; // Assign the appropriate color from hues
    }));
}

/**
 * Saves the computed grid automatically (if possible).
 * - Uses File System Access API if available.
 * - Falls back to `localStorage` if file access isn't available.
 * - Logs a warning on GitHub Pages.
 * @param {Array<Array<number>>} gridData - The computed grid.
 */
export async function autoSaveGrid(gridData) {
    if (!Array.isArray(gridData) || !gridData.length) {
        console.error("❌ Invalid grid data. Cannot auto-save.");
        return;
    }

    const csvContent = gridData.map(row => row.join(",")).join("\n");

    // Check if we're running on GitHub Pages
    if (window.location.hostname.includes("github.io")) {
        console.warn("⚠️ Running on GitHub Pages. Auto-save disabled.");
        return;
    }

    // Try using File System Access API (Modern Browsers)
    if (window.showSaveFilePicker) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: "grid.csv",
                types: [{ description: "CSV Files", accept: { "text/csv": [".csv"] } }],
            });

            const writable = await handle.createWritable();
            await writable.write(csvContent);
            await writable.close();
            console.log("✅ Grid auto-saved to file.");
            return;
        } catch (error) {
            console.warn("⚠️ File System Access API failed. Falling back to localStorage.");
        }
    }

    // Fallback: Save to localStorage
    try {
        localStorage.setItem("lastGrid", csvContent);
        console.log("✅ Grid auto-saved to localStorage.");
    } catch (error) {
        console.error("❌ Failed to save grid to localStorage:", error);
    }
}
