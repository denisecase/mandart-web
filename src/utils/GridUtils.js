// utils/GridUtils.js 
import { saveGridToCSV } from "../core/FileService.js";

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
 * Generates the Mandelbrot fractal grid (fallback if WASM is unavailable).
 * Auto-saves the grid if running locally (not on GitHub Pages).
 * @param {Object} shapeInputs - Contains iteration parameters.
 * @returns {Array<Array<number>>} - 2D array of iteration counts.
 */
export function generateGrid(shapeInputs) {
    console.log("🔍 Starting generateGrid with shapeInputs:", shapeInputs);
    console.log("🔍 image width = {}", shapeInputs.imageWidth);
    console.log("🔍 image height = {}", shapeInputs.imageHeight);
    console.log("🔍 iterationsMax = {}", shapeInputs.iterationsMax);

    if (!shapeInputs || typeof shapeInputs !== "object") {
        console.error("❌ Invalid or missing shapeInputs. Cannot generate grid.");
        return null;
    }
    console.log("🔍 Generating Mandelbrot iteration grid from shapeInputs...");

    const imageWidth = shapeInputs.imageWidth;
    const imageHeight = shapeInputs.imageHeight;
    const theta = shapeInputs.theta;
    const iterationsMax = shapeInputs.iterationsMax;
    const scale = shapeInputs.scale;
    const xCenter = shapeInputs.xCenter;
    const yCenter = shapeInputs.yCenter;
    const rSqLimit = shapeInputs.rSqLimit;
    const mandPowerReal = shapeInputs.mandPowerReal;

    if (window.useFastCalc){
        iterationsMax = 1000;
    }

    try {
        console.log(`🔍 Grid Size: ${imageWidth}x${imageHeight}, Max Iterations: ${iterationsMax}`);
        const grid = Array.from({ length: imageHeight }, () => new Array(imageWidth).fill(0));
        const thetaR = (Math.PI * theta) / 180;

        for (let y = 0; y < imageHeight; y++) {
            for (let x = 0; x < imageWidth; x++) {
                const dX = (x - imageWidth / 2) / scale;
                const dY = (y - imageHeight / 2) / scale;

                const x0 = xCenter + dX * Math.cos(thetaR) - dY * Math.sin(thetaR);
                const y0 = yCenter + dX * Math.sin(thetaR) + dY * Math.cos(thetaR);

                let xx = x0;
                let yy = y0;
                let rSq = xx * xx + yy * yy;
                let iter = 0;

                while (iter < iterationsMax && rSq < rSqLimit) {
                    [xx, yy] = complexPow(xx, yy, mandPowerReal);
                    xx += x0;
                    yy += y0;
                    rSq = xx * xx + yy * yy;
                    iter++;
                }

                grid[y][x] = iter;
            }
        }
        // Auto-save the grid only if NOT running on GitHub Pages
        if (!window.location.hostname.includes("github.io")) {
            saveGridToCSV(grid);
        }
        return grid;
    } catch (error) {
        console.error("❌ Error in generateGrid():", error);
        return null;
    }
}

/**
 * Computes the complex power for Mandelbrot iterations.
 * @param {number} baseX - The real part of the complex number.
 * @param {number} baseY - The imaginary part of the complex number.
 * @param {number} powerReal - The power to raise the complex number to.
 * @returns {Array<number>} - The new complex number [real, imaginary].
 */
function complexPow(baseX, baseY, powerReal) {
    const r = Math.hypot(baseX, baseY); // More numerically stable
    const theta = Math.atan2(baseY, baseX);
    const newR = Math.pow(r, powerReal);
    const newTheta = powerReal * theta;
    return [newR * Math.cos(newTheta), newR * Math.sin(newTheta)];
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

/**
 * Converts a 2D grid array to CSV format.
 * @param {Array} grid - The grid data to convert.
 * @returns {string} - CSV formatted string.
 */
export function gridToCsv(grid) {
    if (!grid || !Array.isArray(grid) || grid.length === 0) {
        console.error("❌ Invalid grid data provided for CSV conversion.");
        return "";
    }
    return grid.map(row => row.join(",")).join("\n");
}


/**
 * Parses a CSV string into a 2D numeric array.
 * @param {string} csvString - The CSV string to parse.
 * @returns {Array<Array<number>>} - 2D array of numbers.
 */
export function parseCSV(csvString) {
    if (typeof csvString !== "string") {
        console.error("❌ parseCSV: Expected a string but received:", csvString);
        return [];
    }
    console.log("🔍 Parsing CSV String:", csvString.slice(0, 100) + "..."); // Show first 100 chars for debugging
    return csvString
        .trim()
        .split("\n")  // Split into rows
        .map(row => row.split(",").map(num => {
            const parsed = Number(num);
            return isNaN(parsed) ? 0 : parsed;  // Ensure valid numbers
        }));
}

export function validateGridData(grid) {
    if (!Array.isArray(grid)) {
        console.error("❌ Expected grid as a 2D array but received:", grid);
        return false;
    }

    if (!Array.isArray(grid[0])) {
        console.error("❌ Grid does not contain nested arrays:", grid);
        return false;
    }

    console.log("✅ Grid format is valid. Dimensions:", grid.length, "x", grid[0].length);
    return true;
}

export function validateColorData(colors) {
    if (!Array.isArray(colors) || colors.length === 0) {
        console.error("❌ Expected colors as an array but received:", colors);
        return false;
    }

    if (!Array.isArray(colors[0]) || colors[0].length !== 3) {
        console.error("❌ Expected colors to be Vec<[f64; 3]> but got:", colors);
        return false;
    }

    console.log("✅ Colors are valid. Total:", colors.length);
    return true;
}

/**
 * Reshapes a flat WASM output into a 2D grid.
 * @param {Array} flatGrid - Flattened WASM output
 * @param {number} width - Expected number of columns
 * @param {number} height - Expected number of rows
 * @returns {Array<Array<number>>} - Reshaped 2D grid
 */
export function restructureGrid(flatGrid, width, height) {
    if (!Array.isArray(flatGrid) || flatGrid.length !== width * height) {
        console.error("❌ restructureGrid: Invalid input size.");
        return null;
    }

    let reshapedGrid = [];
    for (let i = 0; i < height; i++) {
        reshapedGrid.push(flatGrid.slice(i * width, (i + 1) * width));
    }
    return reshapedGrid;
}
