// components/Catalog.js

import {loadMandArtCatalog} from "../utils/CatalogUtils.js";

export function setupCatalog(loadMandArt) {
    const catalogCloseBtn = document.getElementById("catalogCloseBtn");
    const mandartSelect = document.getElementById("mandartSelect");
    const listContainer = document.getElementById("mandartList");
    const catalogModal = document.getElementById("catalogModal");

    if (!catalogCloseBtn || !mandartSelect || !listContainer || !catalogModal) {
        console.error("❌ setupCatalog: One or more catalog elements are missing.");
        return;
    }

    catalogCloseBtn.addEventListener("click", closeCatalogModal);

    async function populateMandartDropdown() {
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

   

    function closeCatalogModal() {
        console.log("📦 Closing Catalog Modal...");
        catalogModal.style.display = "none";
    }

    return {  loadMandArtCatalog, closeCatalogModal };
}
