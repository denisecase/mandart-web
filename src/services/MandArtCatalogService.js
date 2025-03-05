//src/services/MandArtCatalogService.js
// Service for fetching MandArt catalog data.

import PathConfig from '../core/PathConfig.js';

/**
 *  src/services/MandArtCatalogService.js
 * Service for fetching MandArt catalog data.
 */
class MandArtCatalogService {
    constructor() {
        this.catalogData = null; // Cached data
    }

    /**
     * Fetch and cache MandArt catalog data
     * @returns {Promise<Array>} List of MandArt items
     */
    async loadCatalog() {
        if (this.catalogData) return this.catalogData; // Return cached data if available

        try {
            const catalogUrl = PathConfig.getMandArtIndexPath();
            const response = await fetch(catalogUrl);
            if (!response.ok) throw new Error(`Failed to fetch MandArt catalog. Status: ${response.status}`);

            this.catalogData = await response.json();
            return this.catalogData;
        } catch (error) {
            console.error("❌ Error loading MandArt catalog:", error);
            return [];
        }
    }

    /**
     * Get all MandArt `.mandart` file URLs
     * @returns {Promise<Array>} List of `.mandart` file URLs
     */
    async getMandArtFileUrls() {
        const catalog = await this.loadCatalog();
        return catalog.map(item => PathConfig.getMandArtFilePath(item.name));
    }

    /**
     * Get all MandArt `.png` preview URLs
     * @returns {Promise<Array>} List of `.png` preview URLs
     */
    async getMandArtThumbnailUrls() {
        const catalog = await this.loadCatalog();
        return catalog.map(item => PathConfig.getMandArtImagePath(item.name));
    }

    /**
     * Get a specific MandArt item by name
     * @param {string} name - The name of the MandArt file
     * @returns {Promise<Object|null>} MandArt item or null if not found
     */
    async getMandArtByName(name) {
        const catalog = await this.loadCatalog();
        return catalog.find(item => item.name === name) || null;
    }
}

export default new MandArtCatalogService();
