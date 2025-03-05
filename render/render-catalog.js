// render/render-catalog.js (updated)
// ✅ Handles catalog UI updates (dropdown & modal)

import { getCatalogState } from '../state/state-catalog.js';
import { getUIElement } from '../globals.js';
import { INPUT_PATH } from '../constants.js';
import { eventBus } from '../state/state-all.js'; 

/**
 * ✅ **Initialize Catalog Rendering**
 * - Retrieves static catalog data.
 * - Renders dropdown and thumbnails.
 */
export function initRenderCatalog() {
    console.log("📂 RENDER: Initializing catalog rendering...");

    // Perform initial render using static catalog data.
    renderCatalogUI();

    console.log("📂 RENDER: Catalog rendering initialized.");
}

/**
 * ✅ **Render the catalog UI**
 * - Updates dropdown and thumbnail grid
 */
export function renderCatalogUI() {
    console.log("📂 RENDER: Updating catalog UI...");

    const catalog = getCatalogState();
    const fileSelect = getUIElement('fileSelect');
    const catalogContainer = getUIElement('mandartList');

    if (!fileSelect || !catalogContainer) {
        console.error("❌ RENDER: Catalog UI elements not found.");
        return;
    }

    // 🔄 Update file dropdown
    fileSelect.innerHTML = ''; // Clear previous options

    // ✅ Populate dropdown with catalog items
    const dropdownFragment = document.createDocumentFragment();
    catalog.forEach(item => {
        const option = document.createElement('option');
        option.value = item.mandart_url;
        option.textContent = item.name;
        dropdownFragment.appendChild(option);
    });
    fileSelect.appendChild(dropdownFragment);

    // ✅ Disable dropdown if empty
    fileSelect.disabled = catalog.length === 0;

    // 🔄 Update catalog thumbnails
    catalogContainer.innerHTML = ''; // Clear previous items
    const catalogFragment = document.createDocumentFragment();

    catalog.forEach(item => {
        const div = document.createElement('div');
        div.className = 'mandart-item';
        div.dataset.url = item.mandart_url;
        div.dataset.name = item.name;

        const img = document.createElement('img');
        img.src = `${INPUT_PATH}${item.name}.png`;
        img.alt = item.name;
        
        img.onerror = () => {
            img.style.display = 'none';
            div.textContent = item.name;
        };

        div.appendChild(img);
        
        // Add name display
        const nameSpan = document.createElement('span');
        nameSpan.textContent = item.name;
        div.appendChild(nameSpan);
        
        catalogFragment.appendChild(div);
    });

    catalogContainer.appendChild(catalogFragment);

    console.log(`📂 RENDER: Updated UI with ${catalog.length} catalog items.`);
}

/**
 * ✅ **Render loading state in catalog modal**
 */
export function renderCatalogLoading() {
    const catalogContainer = getUIElement('mandartList');
    if (!catalogContainer) return;
    
    catalogContainer.innerHTML = '';
    const loadingEl = document.createElement('div');
    loadingEl.textContent = 'Loading catalog...';
    loadingEl.className = 'catalog-loading';
    catalogContainer.appendChild(loadingEl);
}

/**
 * ✅ **Render error state in catalog modal**
 * @param {string} message - Error message to display
 */
export function renderCatalogError(message = 'Error loading catalog.') {
    const catalogContainer = getUIElement('mandartList');
    if (!catalogContainer) return;
    
    catalogContainer.innerHTML = '';
    const errorEl = document.createElement('div');
    errorEl.textContent = message;
    errorEl.className = 'catalog-error';
    catalogContainer.appendChild(errorEl);
}
