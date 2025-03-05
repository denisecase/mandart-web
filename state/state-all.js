// state/state-all.js
// ✅ Centralized state management for MandArt Web application

import { getColorState, updateColorState, resetColorState, subscribeToColorState } from "./state-color-inputs.js";
import { getShapeState, updateShapeState, resetShapeState, subscribeToShapeState } from "./state-shape-inputs.js";
import { getFileState, updateFileState,  subscribeToFileState } from "./state-file.js";
import { getCatalogState } from "./state-catalog.js"; // ✅ Static catalog
import {
    getCatalogSelection,
    setCatalogSelection,
    resetDropdownSelection,
    subscribeToDropdownSelection
} from "./state-dropdown-file-select.js";

// Import the centralized event bus from utils
import { eventBus } from "../utils/event-bus.js";
export { eventBus }; // Export it for use in other modules

// // ✅ Internal function to initialize state from storage (if available)
 export function initState() {
    console.log("🔄 STATE-ALL: Initializing state ...");
}

/**
 * ✅ Get the entire application state (Immutable copy)
 * @returns {Object} The current application state
 */
export function getState() {
    return {
        color: getColorState(),
        shape: getShapeState(),
        file: getFileState(),
        catalogSelection: getCatalogSelection(),
        catalog: getCatalogState(), // ✅ Catalog (static, never changes after load)
        dropdownFileSelection: getFileState()  
    };
}

/**
 * ✅ Subscribe to state changes
 * @param {Function} callback - Function to execute on state updates
 * @returns {Function} Unsubscribe function
 */
export function subscribeToStateChanges(callback) {
    const unsubColor = subscribeToColorState(() => handleStateChange(callback));
    const unsubShape = subscribeToShapeState(() => handleStateChange(callback));
    const unsubFile = subscribeToFileState(() => handleStateChange(callback));
    const unsubCatalog = subscribeToDropdownSelection(() => handleStateChange(callback));

    return () => {
        unsubColor();
        unsubShape();
        unsubFile();
        unsubCatalog();
    };
}

/**
 * ✅ Handles state updates efficiently by batching storage writes
 * @param {Function} callback - Function to execute on state updates
 */
function handleStateChange(callback) {
    callback(getState());
}


/**
 * ✅ Update specific parts of the state
 * @param {Object} updates - Object containing state updates
 */
export function updateState(updates) {
    if (updates.color) updateColorState(updates.color);
    if (updates.shape) updateShapeState(updates.shape);
    if (updates.file) updateFileState(updates.file);
    if (updates.catalogSelection) setCatalogSelection(updates.catalogSelection);
}

/**
 * ✅ Reset the entire application state
 */
export function resetState() {
    console.log("🔄 STATE-ALL: Resetting all state...");

    resetColorState();
    resetShapeState();
    resetFileState();
    resetDropdownSelection();
}
