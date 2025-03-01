// src/core/PathUtils.js
import PathConfig from './PathConfig.js';

/**
 * Returns the CSV filename from a MandArt file.
 * @param {string} mandartFile - The MandArt filename.
 * @returns {string} - Corresponding CSV filename.
 */
export function getCsvNameFromMandArt(mandartFile) {
    return mandartFile.replace(/\.mandart$/, ".csv");
}

/**
 * Returns the PNG filename from a MandArt file.
 * @param {string} mandartFile - The MandArt filename.
 * @returns {string} - Corresponding PNG filename.
 */
export function getPngNameFromMandArt(mandartFile) {
    return mandartFile.replace(/\.mandart$/, ".png");
}

/**
 * Returns the BMP filename from a MandArt file.
 * @param {string} mandartFile - The MandArt filename.
 * @returns {string} - Corresponding BMP filename.
 */
export function getBmpNameFromMandArt(mandartFile) {
    return mandartFile.replace(/\.mandart$/, ".bmp");
}

/**
 * Gets the full path for a MandArt file.
 * @param {string} fileName - The MandArt filename without extension.
 * @returns {string} - Full file path.
 */
export function getMandArtFilePath(fileName) {
    return PathConfig.getMandArtFilePath(fileName);
}

/**
 * Gets the full path for an exported file.
 * @param {string} fileName - The filename.
 * @returns {string} - Full exported file path.
 */
export function getExportedFilePath(fileName) {
    return PathConfig.getExportedFilePath(fileName);
}

/**
 * Takes a .mandart path or short name and returns the short name.
 * Examples:
 *  "./assets/MandArt_Catalog/AAA1.mandart" => "AAA1"
 *  "Default.mandart" => "Default"
 *  "AAA1" => "AAA1"
 *  "./assets/MandArt_Catalog/Default.mandart" => "Default"
 */
export function getShortNameFromPath(input) {
    if (!input) return "";
  
    // If there's a slash, extract the last part (e.g. "AAA1.mandart" from "./assets/MandArt_Catalog/AAA1.mandart").
    let filePart = input;
    const lastSlash = filePart.lastIndexOf("/");
    if (lastSlash >= 0) {
      filePart = filePart.substring(lastSlash + 1);
    }
  
    // If it ends with ".mandart", remove that extension.
    if (filePart.toLowerCase().endsWith(".mandart")) {
      filePart = filePart.substring(0, filePart.length - ".mandart".length);
    }
  
    return filePart;
  }
  
