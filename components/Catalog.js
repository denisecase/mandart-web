import {  isCatalogOpen, setCatalogOpen, getSelectedMandArt } from "../utils/CatalogUtils.js";

/**
 * Load the MandArt catalog (thumbnails + names) in the modal list
 */
export async function loadMandArtCatalog() {
    try {
      const response = await fetch("../assets/mandart_discoveries.json");
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
  
      const data = await response.json();
      console.log("Catalog Loaded:", data);
  
      const listContainer = document.getElementById("mandartList");
      listContainer.innerHTML = ""; // Clear previous content
  
      data.forEach((item) => {
        const imagePath = `../assets/MandArt_Catalog/${item.name}.png`; // Thumbnail path
        const mandartPath = `../ssets/MandArt_Catalog/${item.name}.mandart`; // JSON path
  
        const itemDiv = document.createElement("div");
        itemDiv.className = "mandart-item";
        itemDiv.dataset.url = mandartPath;
        itemDiv.dataset.name = item.name;
        itemDiv.dataset.image = imagePath;
  
        itemDiv.innerHTML = `
                  <img src="${imagePath}" alt="${item.name}" onerror="this.src='../assets/placeholder.png'">
                  <span>${item.name}</span>
              `;
  
        itemDiv.addEventListener("click", () => {
          loadMandArt(mandartPath, imagePath, item.name);
          closeCatalogModal();
        });
  
        listContainer.appendChild(itemDiv);
      });
    } catch (error) {
      console.error("Failed to load MandArt Catalog:", error);
    }
  }
  


export function setupCatalog() {
    console.log("📦 Initializing MandArt Catalog...");

    // Get UI elements
    const catalogModal = document.getElementById("catalogModal");
    const catalogCloseBtn = document.getElementById("catalogCloseBtn");
    const mandartList = document.getElementById("mandartList");
    const openCatalogBtn = document.getElementById("openCatalogBtn");

    // ✅ Validate required elements
    if (!catalogModal || !catalogCloseBtn || !mandartList) {
        console.error("❌ setupCatalog: Missing required UI elements.");
        return;
    }

    // ✅ Ensure mandartSelect exists (Create if missing)
    let mandartSelect = document.getElementById("mandartSelect");
    if (!mandartSelect) {
        console.warn("⚠️ mandartSelect not found! Creating dynamically...");
        mandartSelect = document.createElement("select");
        mandartSelect.id = "mandartSelect";
        mandartSelect.innerHTML = `<option value="">Select a MandArt</option>`; // Default option
        catalogModal.insertBefore(mandartSelect, mandartList);
    }

    // ✅ Show the modal
    function showCatalogModal() {
        console.log("📂 Opening Catalog Modal...");
        catalogModal.style.display = "block";
        setCatalogOpen(true); // 🔥 Track state in utils
    }

    // ✅ Hide the modal
    function closeCatalogModal() {
        console.log("📦 Closing Catalog Modal...");
        catalogModal.style.display = "none";
        setCatalogOpen(false); // 🔥 Track state in utils
    }

    // ✅ Handle selection change
    function handleSelectionChange() {
        const selectedMandArt = getSelectedMandArt();
        console.log(`🎨 Selected MandArt: ${selectedMandArt}`);
        // 🔥 Trigger an update elsewhere (e.g., canvas update function)
    }

    // ✅ Attach event listeners
    catalogCloseBtn.addEventListener("click", closeCatalogModal);
    mandartSelect.addEventListener("change", handleSelectionChange);

    if (openCatalogBtn) {
        openCatalogBtn.addEventListener("click", showCatalogModal);
    } else {
        console.warn("⚠️ Open Catalog button not found.");
    }

    // ✅ Populate MandArt Dropdown
    loadMandArtCatalog(mandartSelect);

    return { loadMandArtCatalog, showCatalogModal, closeCatalogModal, handleSelectionChange };
}
