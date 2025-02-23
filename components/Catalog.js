import {
  setCatalogOpen,
  getSelectedMandArt,
  getMandArtCatalogUrl,
  getMandArtCatalogBaseUrl,
} from "../utils/CatalogUtils.js";
import { MandArtLoader } from "./MandArtLoader.js";

const mandArtLoader = new MandArtLoader();

/**
 * Load the MandArt catalog (thumbnails + names) in the modal list
 */
export async function loadMandArtCatalog() {
  try {
    const catalogUrl = getMandArtCatalogUrl();
    const catalogBasePath = getMandArtCatalogBaseUrl();
    console.log("📂 Fetching MandArt discoveries JSON list from:", catalogUrl);

    const response = await fetch(catalogUrl);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    console.log("📂 Catalog Loaded:", data);

    const listContainer = document.getElementById("mandartList");
    if (!listContainer) {
      console.error("❌ Catalog container #mandartList not found.");
      return;
    }

    listContainer.innerHTML = ""; // Clear previous content


    data.forEach((item) => {
      const imagePath = `${catalogBasePath}/${item.name}.png`;
      const mandartPath = `${catalogBasePath}/${item.name}.mandart`;

      const itemDiv = document.createElement("div");
      itemDiv.className = "mandart-item";
      itemDiv.dataset.url = mandartPath;
      itemDiv.dataset.name = item.name;
      itemDiv.dataset.image = imagePath;

      itemDiv.innerHTML = `
                <img src="${imagePath}" alt="${item.name}" onerror="this.src='../assets/placeholder.png'">
                <span>${item.name}</span>
            `;

      itemDiv.addEventListener("click", async () => {
        console.log(`🎨 Loading selected MandArt: ${item.name}`);
   
        try {
          await window.mandArtLoader.loadFromAnywhere(item.name, 'catalog');

          if (window.canvasFunctions?.draw) {
            window.canvasFunctions.draw();
          }

          closeCatalogModal();
        } catch (error) {
          console.error("❌ Error loading selected MandArt:", error);
        }
      });

      listContainer.appendChild(itemDiv);
    });

    console.log("✅ MandArt Catalog Populated Successfully.");
  } catch (error) {
    console.error("❌ Failed to load MandArt Catalog:", error);
  }
}

/**
 * Initializes the MandArt Catalog
 */
export function setupCatalog() {
  console.log("📦 Initializing MandArt Catalog...");

  const catalogModal = document.getElementById("catalogModal");
  const catalogCloseBtn = document.getElementById("catalogCloseBtn");
  const openCatalogBtn = document.getElementById("openListBtn"); // Ensure button is correctly referenced
  const mandartList = document.getElementById("mandartList");

  if (!catalogModal || !catalogCloseBtn || !mandartList) {
    console.error("❌ setupCatalog: Missing required UI elements.");
    return;
  }

  console.log("✅ MandArt Catalog Ready.");

  function showCatalogModal() {
    console.log("📂 Opening Catalog Modal...");
    catalogModal.style.display = "block";
    setCatalogOpen(true);
  }

  function closeCatalogModal() {
    console.log("📦 Closing Catalog Modal...");
    catalogModal.style.display = "none";
    setCatalogOpen(false);
  }

  let mandartSelect = document.getElementById("mandartSelect");
  if (!mandartSelect) {
    console.warn("⚠️ mandartSelect not found! Creating dynamically...");
    mandartSelect = document.createElement("select");
    mandartSelect.id = "mandartSelect";
    mandartSelect.innerHTML = `<option value="">Select a MandArt</option>`;
    catalogModal.insertBefore(mandartSelect, mandartList);
  }

  function handleSelectionChange() {
    const selectedMandArt = getSelectedMandArt();
    console.log(`🎨 Selected MandArt: ${selectedMandArt}`);
  }

  catalogCloseBtn.addEventListener("click", closeCatalogModal);
  mandartSelect.addEventListener("change", handleSelectionChange);

  if (openCatalogBtn) {
    openCatalogBtn.addEventListener("click", showCatalogModal);
  } else {
    console.warn("⚠️ Open Catalog button not found.");
  }

  loadMandArtCatalog();

  return {
    loadMandArtCatalog,
    showCatalogModal,
    closeCatalogModal,
    handleSelectionChange,
  };
}

/**
 * Closes the catalog modal.
 */
export function closeCatalogModal() {
  console.log("📦 Closing Catalog Modal...");
  const catalogModal = document.getElementById("catalogModal");
  if (catalogModal) {
    catalogModal.style.display = "none";
  } else {
    console.warn("⚠️ Attempted to close catalog modal, but it was not found.");
  }
}
