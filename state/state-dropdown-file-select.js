import { eventBus } from '../utils/event-bus.js';
import { getFileState, setCurrentFilename, updateFileState } from "./state-file.js";

// Internal state to track catalog selection
let selectedFileUrl = null;

/**
 * ✅ Initialize dropdown file selection handling.
 * This function subscribes to file state changes so that when a file is loaded from
 * the catalog (source === 'catalog'), the internal selectedFileUrl is updated.
 */
export function initDropdownFileSelect() {
    console.log("🔄 DROPDOWN: Initializing dropdown file selection...");
    
    // Listen for file state changes
    eventBus.subscribe('file-state-changed', () => {
        const state = getFileState();
        // If the file came from the catalog, update internal state; otherwise, clear it.
        if (state.source === 'catalog' && state.currentFilename) {
            selectedFileUrl = state.currentFilename;
            console.log(`📂 DROPDOWN: Updated catalog selection from file state: ${selectedFileUrl}`);
        } else {
            selectedFileUrl = null;
            console.log("📂 DROPDOWN: File state not from catalog; resetting selection.");
        }
    });
    
    // (Optional) You can also add a change listener for user selections:
    const fileSelect = document.getElementById('fileSelect');
    if (fileSelect) {
        fileSelect.addEventListener('change', () => {
            const selectedValue = fileSelect.value;
            console.log('Dropdown changed by user. New value:', selectedValue);
            // When a user selects an option, update the file state accordingly.
            if (selectedValue) {
                setCurrentFilename(selectedValue);
                updateFileState({
                    currentFilename: selectedValue,
                    source: 'catalog',
                    lastLoadedJson: null
                });
            }
        });
    }
}

/**
 * ✅ Get the currently selected catalog item URL.
 * @returns {string|null} The selected file URL or null if none selected.
 */
export function getCatalogSelection() {
    return selectedFileUrl;
}

/**
 * ✅ Set the selected catalog item.
 * @param {string|null} fileUrl - The URL of the selected file or null to reset.
 */
export function setCatalogSelection(fileUrl) {
    console.log(`📂 DROPDOWN: Setting selection to ${fileUrl || "(None)"}`);
    selectedFileUrl = fileUrl;
    // Do not emit an event here; file state updates already emit "file-state-changed"
}

/**
 * ✅ Reset dropdown selection state.
 */
export function resetDropdownSelection() {
    console.log("🔄 DROPDOWN: Resetting selection");
    selectedFileUrl = null;
    // No event emission here; file state updates handle UI changes.
}

/**
 * ✅ Subscribe to catalog selection changes.
 * @param {Function} callback - Function to call when selection changes.
 * @returns {Function} Unsubscribe function.
 */
export function subscribeToDropdownSelection(callback) {
    return eventBus.subscribe("file-state-changed", callback);
}

/**
 * ✅ Returns the label to display in the dropdown.
 * If a catalog file is selected, it returns the filename (without extension);
 * otherwise, it returns a placeholder "(Select File)".
 *
 * @returns {string} The label for the dropdown.
 */
export function getDropdownLabel() {
    if (selectedFileUrl) {
        return selectedFileUrl.split('/').pop().replace('.mandart', '');
    }
    return "(Select File)";
}
