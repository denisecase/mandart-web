import { getMandArtCatalogUrl } from "./CatalogUtils.js";

export async function loadMandArtList() {
    console.log("📦 Fetching MandArt List...");

    try {
        const catSource = getMandArtCatalogUrl();
        console.log("📂 Fetching MandArt discoveries from:", catSource);
        const response = await fetch(catSource);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const mandArtList = await response.json();
        console.log("✅ MandArt list fetched:", mandArtList);
        return mandArtList;
    } catch (error) {
        console.error("❌ Failed to fetch MandArt list:", error);
        return [];
    }
}

export function populateMandartDropdown(selectElementId, mandArtList) {
    try {
      console.log(`🎨 Populating MandArt Dropdown with ${mandArtList.length} items...`);
  
      if (!mandArtList || !Array.isArray(mandArtList)) {
        throw new Error("❌ MandArt List is invalid.");
      }
  
      mandArtList.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  
      const mandartSelect = document.getElementById(selectElementId);
      if (!mandartSelect) {
        console.error(`❌ Dropdown element #${selectElementId} not found.`);
        return;
      }
  
      mandartSelect.innerHTML = `<option value="">Select a MandArt</option>`;
      mandArtList.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.name;
        option.textContent = item.name;
        mandartSelect.appendChild(option);
      });
  
      console.log("✅ Dropdown populated successfully.");
    } catch (error) {
      console.error("❌ Failed to populate MandArt dropdown:", error);
    }
  }
  
