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
 * ✅ Loads MandArt options into the dropdown
 */
export async function loadMandArtCatalog(mandartSelect) {
    try {
        console.log("📂 Fetching MandArt discoveries...");
        const response = await fetch("assets/mandart_discoveries.json");

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("✅ Loaded MandArt Discoveries:", data);

        mandartSelect.innerHTML = `<option value="">Select a MandArt</option>`;
        data.sort((a, b) => a.name.localeCompare(b.name));

        data.forEach((item) => {
            const option = document.createElement("option");
            option.value = item.name;
            option.textContent = item.name;
            mandartSelect.appendChild(option);
        });
    } catch (error) {
        console.error("❌ Failed to load MandArt file list:", error);
    }
}
