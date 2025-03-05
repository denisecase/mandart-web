// models/Catalog.js
// ✅ Defines the catalog structure for MandArt Web

export default class Catalog {
    /**
     * @param {Object} data - Catalog entry data
     * @param {string} data.name - Display name of the file
     * @param {string} data.mandart_url - URL for the MandArt file
     * @param {string} data.png_path - Path to the PNG thumbnail
     */
    constructor(data = {}) {
        this.name = data.name ?? "Unnamed Item";
        this.mandart_url = data.mandart_url ? encodeURI(data.mandart_url) : "";
        this.png_path = data.png_path ?? "";
    }

    /**
     * ✅ Converts the object into a JSON representation
     * @returns {Object} JSON-friendly object
     */
    toJSON() {
        return { 
            name: this.name, 
            mandart_url: this.mandart_url, 
            png_path: this.png_path 
        };
    }
}
