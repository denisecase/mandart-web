// services/get-mandart-json-string-from-catalog.js
// Fetches a MandArt JSON file based on a catalog selection.

import { getUrlFromCatalogSelection } from './catalog-fetcher.js';
import { getMandartJsonStringFromUrl } from './get-mandart-json-string-from-url.js';
import { setCatalogSelection } from '../state/state-dropdown-file-select.js';


/**
 * Processes a MandArt file selected from the catalog.
 * @param {string} itemName - The MandArt file name selected from the catalog.
 * @returns {Promise<string|null>} JSON string of the file or null if failed.
 */
export async function getMandartJsonStringFromCatalog(itemName) {
    try {
        console.log(`📂 PROCESS-CATALOG: Loading file "${itemName}" from catalog...`);
        const fileUrl = await getUrlFromCatalogSelection(itemName);
        if (!fileUrl) {
            throw new Error(`❌ PROCESS-CATALOG: No URL found for "${itemName}"`);
        }
        setCatalogSelection(fileUrl);
        const jsonString = await getMandartJsonStringFromUrl(fileUrl);
        if (!jsonString) {
            throw new Error(`❌ PROCESS-CATALOG: Failed to fetch data from URL: ${fileUrl}`);
        }
        console.log(`✅ PROCESS-CATALOG: Successfully loaded "${itemName}"`);
        return jsonString;
    } catch (error) {
        console.error("❌ PROCESS-CATALOG: Error processing file from catalog:", error.message);
        return null;
    }
}
