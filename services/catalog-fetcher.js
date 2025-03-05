// services/catalog-fetcher.js
// Reads the assets MandArt discoveries JSON file to get the URLs

import { JSON_CATALOG_PATH } from '../constants.js';
import { getCatalogState, setCatalogState } from '../state/state-catalog.js';

/**
 * Fetch the MandArt catalog.
 * @param {string} [catalogPath=JSON_CATALOG_PATH] - Path to the catalog file.
 * @returns {Promise<Array<Catalog>>} The catalog data.
 */
export async function fetchCatalog(catalogPath = JSON_CATALOG_PATH) {
    console.log(`CATALOG: Fetching catalog from ${catalogPath}`);

    // Ensure we only load the catalog once
    const catalogState = getCatalogState();
    if (catalogState.length > 0) {
        console.warn("⚠️ CATALOG already loaded. Skipping fetch.");
        return catalogState;
    }

    try {
        const response = await fetch(catalogPath);
        if (!response.ok) {
            throw new Error(`Failed to fetch catalog (status ${response.status})`);
        }

        const jsonData = await response.json();
        console.log(`CATALOG: Fetched ${jsonData.length} items`);

        // Ensure that URLs in the catalog are properly encoded
        const processedCatalog = jsonData.map(item => ({
            name: item.name ?? "Unnamed Item",  // Default if 'name' is missing
            mandart_url: item.mandart_url ? encodeURI(item.mandart_url) : "",  // Encoding the mandart URL
            png_path: item.png_path ?? "",  // Default empty if 'png_path' is missing
        }));

        // Sort catalog alphabetically by name (case-insensitive)
        processedCatalog.sort((a, b) => (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: 'base' }));

        // Store in state
        setCatalogState(processedCatalog);

        return processedCatalog;
    } catch (error) {
        console.error("CATALOG: Error fetching catalog:", error);
        return [];  // Return empty array on error
    }
}
