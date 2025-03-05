// src/core/FileNameUtils.js
import PathConfig from '../core/PathConfig.js';

/**
 * Converts a MandArt filename to a different format.
 * @param {string} mandartFile - The MandArt filename (e.g., "Fire.mandart").
 * @param {string} newExt - The new file extension (e.g., "csv", "png", "bmp").
 * @returns {{ original: string, newFile: string, newPath: string }} - Object with filename changes.
 */
export function convertMandArtFilename(mandartFile, newExt) {
    if (!mandartFile || typeof mandartFile !== "string") {
        console.error("❌ Invalid MandArt filename provided.");
        return null;
    }

    const baseName = mandartFile.replace(/\.mandart$/, ""); // Remove `.mandart`
    const newFile = `${baseName}.${newExt}`; 

    // Use PathConfig for path resolution
    const newPath = PathConfig.getMandArtFilePath(baseName);

    return { original: mandartFile, newFile, newPath };
}

/**
 * Extracts the filename from a given path (URL or local).
 * @param {string} path - The full file path or URL.
 * @returns {string} - The extracted filename without extension.
 */
export function extractFileName(path) {
    if (!path || typeof path !== "string") return "Unnamed";

    const fileName = path.split(/[/\\]/).pop(); 
    return fileName.includes(".") ? fileName.replace(/\.[^.]+$/, "") : fileName;
}
