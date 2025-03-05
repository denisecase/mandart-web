// utils/MandArtList.js
// NON UI UTILITY Shared by the 
// open from catalog button in the header
// and the MandArt dropdown in the header.

import { getMandArtCatalogUrl } from "./CatalogUtils.js";

/**
 * Fetches and sorts the MandArt catalog list.
 * @returns {Promise<Array>} A sorted list of MandArt objects.
 */
export async function fetchMandArtList() {
  console.log("📦 Fetching MandArt List...");

  try {
    const catSource = getMandArtCatalogUrl();
    console.log("📂 Fetching MandArt discoveries from:", catSource);
    const response = await fetch(catSource);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const mandArtList = await response.json();
    if (!Array.isArray(mandArtList)) {
      throw new Error("❌ Invalid MandArt list format.");
    }
    mandArtList.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
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
