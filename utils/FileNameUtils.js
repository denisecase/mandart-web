// utils/FileNmaeUtils.js

/**
 * Converts a MandArt filename to a different format.
 * Returns an object containing both the new filename and its expected asset path.
 * 
 * @param {string} mandartFile - The MandArt filename (e.g., "Fire.mandart").
 * @param {string} newExt - The new file extension (e.g., "csv", "png", "bmp").
 * @param {string} [folderPath="assets/MandArt_Catalog"] - (Optional) Folder path for the new file.
 * @returns {{ original: string, newFile: string, newPath: string }} - Object with filename changes.
 */
export function convertMandArtFilename(mandartFile, newExt, folderPath = "assets/MandArt_Catalog") {
    if (!mandartFile || typeof mandartFile !== "string") {
        console.error("❌ Invalid MandArt filename provided.");
        return null;
    }

    const newFile = mandartFile.replace(/\.mandart$/, `.${newExt}`);
    const newPath = `${folderPath}/${newFile}`;

    return {
        original: mandartFile,  // Original MandArt file name
        newFile,                // New filename with extension
        newPath                 // Full asset path
    };
}



/**
 * Extracts the filename from a given file path or URL.
 * Removes extensions like .mandart if present.
 *
 * @param {string} path - The full file path or URL.
 * @returns {string} - The extracted filename without extension.
 */
export function extractFileName(path) {
    if (!path || typeof path !== "string") return "Unnamed";

    // ✅ Handle both Windows `\` and Unix `/` paths
    const fileName = path.split(/[/\\]/).pop();

    // ✅ Ensure there's an extension before removing it
    return fileName.includes(".") ? fileName.replace(/\.[^.]+$/, "") : fileName;
}
