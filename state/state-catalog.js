// state/state-catalog.js
// ✅ Manages the static catalog list (not selections)
import Catalog from "../models/Catalog.js";

// ✅ Catalog state (static list, never modified after load)
let catalog = [];

// ✅ Track whether catalog is already loaded
let isCatalogLoaded = false;

/**
 * ✅ Get the current catalog state (Immutable copy)
 * @returns {Array<Catalog>} The current catalog
 */
export function getCatalogState() {
    console.log("📂 CATALOG-STATE: Getting catalog state...");
    return catalog.map(item => new Catalog(item)); // Deep copy to prevent mutation
}

/**
 * ✅ Set the catalog state (only called once on load)
 * @param {Array<Object>} newCatalog - New catalog data
 * @returns {boolean} Success status
 */
export function setCatalogState(newCatalog) {
    console.log("📂 CATALOG-STATE: Setting catalog state...");
    if (isCatalogLoaded) {
        console.warn("⚠️ CATALOG-STATE: Catalog already loaded. Ignoring duplicate call.");
        return false;
    }

    if (!Array.isArray(newCatalog)) {
        console.error("❌ CATALOG-STATE: Invalid catalog data. Expected an array.");
        return false;
    }

    console.log(`📂 CATALOG-STATE: Loaded ${newCatalog.length} items.`);
    catalog = newCatalog.map(item => new Catalog(item)); // Store a deep copy

    // ✅ Mark catalog as loaded
    isCatalogLoaded = true;
    return true;
}
