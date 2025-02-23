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
 * Returns the correct URL for fetching the MandArt catalog JSON file,
 * handling both local development and GitHub Pages deployment.
 */
export function getMandArtCatalogUrl() {
    const isGitHubPages = window.location.hostname.includes("github.io");

    // ✅ Adjust URL based on environment
    return isGitHubPages
        ? "https://denisecase.github.io/mandart-web/assets/mandart_discoveries.json" // GitHub Pages
        : "../assets/mandart_discoveries.json"; // Local development
}

/**
 * Returns the correct base URL for MandArt assets,
 * handling both local development and GitHub Pages deployment.
 */
export function getMandArtCatalogBaseUrl() {
    const isGitHubPages = window.location.hostname.includes("github.io");

    return isGitHubPages
        ? "https://denisecase.github.io/mandart-web/assets/MandArt_Catalog"
        : "../assets/MandArt_Catalog";
}



/**
 * ✅ Loads MandArt options into the dropdown
 */
export async function loadMandArtCatalog(mandartSelect) {
    try {
        console.log("📂 Fetching MandArt discoveries...");
        const response = await fetch("./assets/mandart_discoveries.json");

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
