import MandArtCatalogService from '../services/MandArtCatalogService.js';

let catalogOpen = false;

/**
 * ✅ Checks if the catalog modal is open
 */
export function isCatalogOpen() {
    return catalogOpen;
}

/**
 * ✅ Updates catalog open state
 */
export function setCatalogOpen(state) {
    catalogOpen = state;
}

/**
 * ✅ Gets the selected MandArt from the dropdown
 */
export function getSelectedMandArt() {
    const mandartSelect = document.getElementById("mandartSelect");
    return mandartSelect ? mandartSelect.value : null;
}

/**
 * ✅ Populates the MandArt dropdown with available options
 */
export async function loadMandArtCatalog(mandartSelect) {
    try {
        console.log("📂 Fetching MandArt discoveries...");

        const catalogData = await MandArtCatalogService.loadCatalog();
        if (!catalogData.length) throw new Error("No MandArt files found.");

        mandartSelect.innerHTML = `<option value="">Select a MandArt</option>`;
        catalogData.sort((a, b) => a.name.localeCompare(b.name));

        catalogData.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.name;
            option.textContent = item.name;
            mandartSelect.appendChild(option);
        });

        console.log(`✅ Populated MandArt dropdown with ${catalogData.length} items.`);
    } catch (error) {
        console.error("❌ Failed to load MandArt file list:", error);
    }
}
