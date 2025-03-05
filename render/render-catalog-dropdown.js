// render/render-catalog-dropdown.js
import { getState, subscribeToStateChanges } from '../state/state-all.js';
import { getUIElement } from '../globals.js';
import { setCatalogSelection } from '../state/state-dropdown-file-select.js';

export function initRenderCatalogDropdown() {
    console.log("📂 Render: Initializing catalog dropdown rendering...");
    
    // Subscribe to all state changes
    subscribeToStateChanges(renderCatalogDropdown);
    
    // Initial render
    renderCatalogDropdown();
    
    console.log("✅ Render: Catalog dropdown initialization complete");
}

function renderCatalogDropdown() {
    console.log("📂 Render: Updating dropdown...");
    
    const fileSelect = getUIElement('fileSelect');
    if (!fileSelect) {
        console.warn("⚠️ Render: File select dropdown not found.");
        return;
    }
    
    // Get the entire state
    const state = getState();
    
    // Extract what we need
    const catalog = state.catalog;
    const fileState = state.file;
    const selectedFile = state.catalogSelection?.selectedFile;
    
    // Clear existing options
    fileSelect.innerHTML = '';
    
    // Add the "(Select File)" placeholder option
    const placeholderOption = document.createElement('option');
    placeholderOption.value = "";
    placeholderOption.textContent = "(Select File)";
    placeholderOption.disabled = true;
    placeholderOption.hidden = true;
    fileSelect.appendChild(placeholderOption);
    
    // Track if we've selected something
    let selectionMade = false;
    
    // Extract stem from current file if available
    let currentFileStem = null;
    if (fileState && fileState.currentFilename) {
        // Extract stem (remove extension if present)
        currentFileStem = fileState.currentFilename.split('.')[0];
        console.log(`📂 Render: Current file stem: ${currentFileStem}`);
    }
    
    // If we have a file from local machine (not in catalog)
    if (fileState && fileState.currentFilename && fileState.source === 'local-machine') {
        const customOption = document.createElement('option');
        customOption.value = "local-file";
        customOption.textContent = `Current: ${fileState.currentFilename}`;
        customOption.selected = true;
        fileSelect.appendChild(customOption);
        selectionMade = true;
        console.log(`📂 Render: Selected local file: ${fileState.currentFilename}`);
    }
    
    // Add catalog items
    catalog.forEach((item) => {
        const option = document.createElement('option');
        option.value = item.mandart_url;
        option.textContent = item.name;
        
        // Get the stem of the catalog item (assuming item.name is the filename)
        const itemStem = item.name.split('.')[0];
        
        // Select this item if it matches the selection or current file stem
        if (selectedFile === item.mandart_url) {
            option.selected = true;
            selectionMade = true;
            console.log(`📂 Render: Selected catalog item by URL: ${item.name}`);
        } else if (currentFileStem && itemStem === currentFileStem) {
            option.selected = true;
            selectionMade = true;
            // Update the catalog selection state to reflect this selection
            setCatalogSelection(itemStem);
            console.log(`📂 Render: Selected catalog item by stem match: ${item.name}`);
        }
        
        fileSelect.appendChild(option);
    });
    
    // If no selection was made, select the placeholder
    if (!selectionMade) {
        placeholderOption.selected = true;
        console.log(`📂 Render: No matching catalog item found for ${currentFileStem}, showing placeholder`);
    }
    
    console.log(`📂 Render: Dropdown updated with ${catalog.length} items, selection made: ${selectionMade}`);
}