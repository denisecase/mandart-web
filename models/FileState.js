// models/FileState.js
// Defines the file state structure for MandArt Web

export default class FileState {
    /**
     * @param {Object} data - File state values
     * @param {string} data.currentFilename - Name of the current file
     * @param {Object|null} data.lastLoaded - Last loaded file metadata
     * @param {boolean} data.isModified - Whether the file has unsaved changes
     * @param {Array} data.catalog - The loaded catalog of available files
     * @param {Object|null} data.selectedCatalogItem - The selected item from the catalog
     */
    constructor(data = {}) {
        this.currentFilename = data.currentFilename ?? "mandart";
        this.lastLoaded = data.lastLoaded ?? null;
        this.isModified = data.isModified ?? false;
        this.catalog = Array.isArray(data.catalog) ? data.catalog : [];
        this.selectedCatalogItem = data.selectedCatalogItem ?? null;
    }

    /**
     * ✅ Converts the object into a JSON representation
     * @returns {Object} JSON-friendly object
     */
    toJSON() {
        return { ...this };
    }
}
