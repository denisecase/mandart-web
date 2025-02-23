// utils/fileUtils.js

/**
 * Triggers a file download for the given Blob.
 * Ensures proper cleanup of URL object to free memory.
 */
function triggerFileDownload(blob, filename) {
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
 * Reads a file from an input element and parses it as text.
 * Supports .mandart (JSON), .csv, .txt.
 */
export function readFileAsText(file, callback) {
    if (!file) return console.error("❌ No file selected.");

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            callback(e.target.result);
        } catch (error) {
            console.error("❌ Error processing file:", error);
        }
    };
    reader.readAsText(file);
}

/**
 * Saves JSON data as a .mandart file.
 */
export function saveMandArtFile(jsonData, filename = "art.mandart") {
    const jsonString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    triggerFileDownload(blob, filename);
}

/**
 * Saves PNG from a given canvas.
 */
export function saveCanvasAsPNG(canvas, filename = "art.png") {
    canvas.toBlob((blob) => triggerFileDownload(blob, filename), "image/png");
}

export function saveGridToCSV(fIter) {
    if (!fIter) {
        console.error("No grid data found.");
        return;
    }
    let displayName = "MandArt";
    try {
        if (window.mandArtLoader && typeof window.mandArtLoader.getDisplayName === "function") {
            displayName = window.mandArtLoader.getDisplayName() || "MandArt";
        }
    } catch (error) {
        console.warn("⚠️ Could not retrieve display name. Using default 'MandArt'.");
    }

    console.log(`✅ Grid '${displayName}' generated successfully.`);

    const filename = `${displayName}.csv`;
    console.log("📁 Saving file:", filename);

    // Convert grid data to CSV format
    let csvContent = fIter.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });

    // Trigger file download
    triggerFileDownload(blob, filename);

    console.log(`📂 Saved Grid CSV: ${filename}`);
}



/**
 * Fetches a CSV file and converts it to a 2D `fIter` array.
 * Optimized for large (~1000x1000) files.
 */
export async function fetchAndParseCSV(csvPath) {
    console.log(`📥 Attempting to fetch CSV: ${csvPath}`);

    try {
        const response = await fetch(csvPath);
        
        if (!response.ok) {
            console.warn(`⚠️ CSV file not found: ${csvPath} (Status: ${response.status})`);
            return null;  
        }

        const text = await response.text();
        const lines = text.trim().split("\n");

        const fIter = lines.map((line) => line.split(",").map(Number));
        console.log(`✅ Parsed CSV into fIter (${fIter.length} rows x ${fIter[0].length} cols)`);
        return fIter;
    } catch (error) {
        console.warn(`⚠️ Error fetching or parsing CSV: ${error.message}`);
        return null;
    }
}

