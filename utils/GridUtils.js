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


