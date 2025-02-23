// utils/fileUtils.js

/**
 * Triggers a file download for the given Blob.
 * Ensures proper cleanup of URL object to free memory.
 */
export function triggerFileDownload(blob, filename) {
    if (!(blob instanceof Blob)) {
        console.error("❌ triggerFileDownload: Invalid Blob provided.");
        return;
    }

    if (typeof filename !== "string" || filename.trim() === "") {
        console.error("❌ triggerFileDownload: Invalid filename provided.");
        return;
    }

    try {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;

        document.body.appendChild(a);
        requestAnimationFrame(() => {
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
                console.log(`✅ File downloaded successfully: ${filename}`);
            }, 100);
        });
    } catch (error) {
        console.error("❌ Error triggering file download:", error);
    }
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

export function exportGridToCSV(fIter) {
    if (!fIter) {
      console.error("No grid data found.");
      return;
    }
    const filename = window.mandArtLoader.getActiveFilename("csv");
    console.log("Current filename:", filename);
    let csvContent = fIter.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    triggerFileDownload(blob, filename);
    console.log(`Saved Grid CSV: ${filename}`);
  }
  