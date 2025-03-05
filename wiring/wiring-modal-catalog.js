// wiring/wiring-modal-catalog.js
// ✅ Handles event wiring for the catalog modal.

import { getUIElement } from '../globals.js';
import { eventBus } from '../state/state-all.js';
import { fetchCatalog } from '../services/catalog-fetcher.js';
import { getMandartJsonStringFromUrl } from '../services/get-mandart-json-string-from-url.js';
import { renderCatalogUI, renderCatalogLoading, renderCatalogError } from '../render/render-catalog.js';

/**
 * ✅ **Initialize wiring for the Catalog Modal**
 */
export function initModalCatalogWiring() {
  console.log("🔗 Wiring: Initializing catalog modal events...");

  const catalogModal = getUIElement('catalogModal');
  const catalogCloseBtn = getUIElement('catalogCloseBtn');
  const mandartList = getUIElement('mandartList');

  if (!catalogModal || !catalogCloseBtn || !mandartList) {
    console.warn("⚠️ Wiring: Missing elements for catalog modal.");
    return;
  }

  // Listen for 'request-catalog' event
  eventBus.subscribe('request-catalog', async () => {
    console.log("📂 Catalog Modal: Received request-catalog event");
    
    // Show the modal
    catalogModal.style.display = 'block';
    
    // Fetch and render catalog entries
    try {
      // Show loading state
      renderCatalogLoading();
      
      // Get the catalog entries
      await fetchCatalog();
      
      // Let the render function handle updating the UI
      renderCatalogUI();
      
    } catch (error) {
      console.error('❌ Catalog Modal: Error loading catalog:', error);
      renderCatalogError('Error loading catalog.');
    }
  });

  // Close button event
  catalogCloseBtn.addEventListener('click', () => {
    console.log("📂 Catalog Modal: Close button clicked");
    catalogModal.style.display = 'none';
  });

  // Click outside to close
  catalogModal.addEventListener('click', (event) => {
    if (event.target === catalogModal) {
      catalogModal.style.display = 'none';
    }
  });

  mandartList.addEventListener('click', async (event) => {
    let target = event.target;
    
    // Find the mandart-item element if we clicked on a child
    while (target && !target.classList.contains('mandart-item')) {
      if (target === mandartList) return; // Clicked outside an item
      target = target.parentElement;
    }
    if (!target) return;
    const url = target.dataset.url;
    const name = target.dataset.name;
    if (!url) {
      console.error(`❌ Catalog Modal: No URL for selected item`);
      return;
    }
    console.log(`📂 Catalog Modal: Selected item: ${name}`);
    catalogModal.style.display = 'none';
    const jsonString = await getMandartJsonStringFromUrl(url);
    
    if (!jsonString) {
      console.error(`❌ Catalog Modal: Failed to load ${name}`);
      // Show error message to user
    }
  });



  const fileSelect = getUIElement('fileSelect');
  if (fileSelect) {
    fileSelect.addEventListener('change', async (event) => {
      const selectedValue = fileSelect.value;
      console.log(`📂 Dropdown: Selection changed: ${selectedValue}`);
      if (!selectedValue) {
        console.log("📂 Dropdown: No file selected. (Placeholder displayed)");
        return;
      }
      // Load the selected file from its URL
      const jsonString = await getMandartJsonStringFromUrl(selectedValue);
      if (!jsonString) {
        console.error("❌ Dropdown: Failed to load file from dropdown selection.");
      }
    });
  }


  console.log("✅ Catalog Modal: Wiring initialized");
}

