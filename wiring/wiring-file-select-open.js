// wiring/wiring-file-select-open.js
// ✅ Handles event wiring for the file selection dropdown.

import { eventBus } from '../state/state-all.js';
import { getUIElement } from '../globals.js';
import { updateFileState, getFileState } from '../state/state-file.js';
import { getMandartJsonStringFromUrl} from '../services/get-mandart-json-string-from-url.js';

/**
 * ✅ Initialize wiring for the file selection dropdown.
 * @param {HTMLElement} [fileSelect] - The dropdown element.
 * @returns {Function} Cleanup function to unsubscribe all listeners.
 */
export async function initFileSelectOpenWiring(fileSelect) {
    fileSelect = fileSelect || getUIElement('fileSelect');
    if (!fileSelect) {
        console.error("❌ Wiring: 'fileSelect' dropdown not found.");
        return () => {};
    }
    console.log("📂 Wiring: Initializing file selection dropdown...");
    console.log("📂 Wiring: FILE: ", fileSelect.value);

    const unsubscribe = eventBus.subscribe("file-state-changed", () => {
        const state = getFileState();
        // If the file comes from catalog, update dropdown value; else use placeholder.
        fileSelect.value = (state.source === "catalog" && state.label) ? state.label : "(Select File)";
    });

    fileSelect.addEventListener('change', async ()  => {
        const selectedValue = fileSelect.value;
        if (!selectedValue || selectedValue === "") {
            console.warn("⚠️ Wiring: Placeholder selected. Ignoring...");
            return;
        }
        updateFileState({
            currentFilename: selectedValue,
            source: 'catalog'
        });
        console.log("📂 Wiring: File selected from dropdown.", selectedValue);
        const jsonString = await getMandartJsonStringFromUrl(selectedValue);
        console.log("📂 Wiring: File selected from dropdown. JSON string:", jsonString);
        eventBus.emit('file-selection-changed', { fileUrl: selectedValue });
        eventBus.emit('file-clean');
    });

    return () => {
        unsubscribe();
        fileSelect.removeEventListener('change', () => {});
    };
}

/**
 * ✅ Updates the dropdown based on the latest catalog state.
 * @param {HTMLElement} fileSelect - The dropdown element.
 */
function updateDropdown(fileSelect) {
    const catalog = getCatalogState();
    console.log('Catalog:', catalog);  // Log the catalog data for debugging

    fileSelect.innerHTML = ''; // reset

    // Add default option "(Select File)"
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '(Select File)';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    fileSelect.appendChild(defaultOption);

    // Populate dropdown with catalog items.
    catalog.forEach(item => {
        const option = document.createElement('option');
        option.value = item.value || item.mandart_url;
        option.textContent = item.name;
        fileSelect.appendChild(option);
    });

    // If a defaultFileUrl is provided, try to sync it with the catalog.
    if (defaultFileUrlStem) {
        const matchingItem = catalog.find(item => item.mandart_url === defaultFileUrlStem || item.name === defaultFileUrlStem);
        if (matchingItem) {
            syncDropdownSelection(fileSelect, matchingItem.name);
            console.log(`📂 Wiring: Dropdown synced with default selection - ${matchingItem.name}`);
        }
    }

    console.log("📂 Wiring: Dropdown updated with catalog items.");
}

/**
 * ✅ Syncs dropdown selection when an item is selected from the catalog modal.
 * @param {HTMLElement} fileSelect - The dropdown element.
 * @param {string} selectedItemName - The name (or identifier) of the selected catalog item.
 */
function syncDropdownSelection(fileSelect, selectedItemName) {
    Array.from(fileSelect.options).forEach((option, index) => {
        if (option.textContent === selectedItemName) {
            fileSelect.selectedIndex = index;
            console.log(`📂 Wiring: Dropdown synced with catalog selection - ${selectedItemName}`);
        }
    });
}

/**
 * ✅ Resets the dropdown when a file is loaded externally (e.g., from URL or local file).
 * @param {HTMLElement} fileSelect - The dropdown element.
 */
function resetDropdown(fileSelect) {
    console.log("🔄 Wiring: Resetting file selection dropdown.");
    // Reset to the default option.
    fileSelect.selectedIndex = 0;
}
