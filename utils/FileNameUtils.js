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
