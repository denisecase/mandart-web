//utils/PathUtils.js

/**
 * Converts a given MandArt file name to other formats.
 * @param {string} mandartPath - The path or filename of the MandArt file.
 * @returns {object} An object containing variations (csv, png, bmp) with paths.
 */
export function getFileVariations(mandartPath) {
    const baseName = mandartPath.replace(/^.*[\\/]/, "").replace(".mandart", ""); // Extract file name without extension
    const directory = mandartPath.substring(0, mandartPath.lastIndexOf("/") + 1) || "./";

    return {
        csv: { name: `${baseName}.csv`, path: `${directory}${baseName}.csv` },
        png: { name: `${baseName}.png`, path: `${directory}${baseName}.png` },
        bmp: { name: `${baseName}.bmp`, path: `${directory}${baseName}.bmp` }
    };
}
