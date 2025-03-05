// color_editor_extension.js

// Import the state initializer from color_editor_state.js
import { initColorEditorState } from './color_editor_state.js';
import { initSaveButton } from './save_mandart.js';

// This module should be imported after ColorEditor.js
// to set up the connection between ColorEditor and save_mandart

/**
 * Initialize the connection between ColorEditor and save_mandart
 * This should be called after ColorEditor.js has been loaded
 */
export function initColorEditorExtension() {
    console.log("Initializing ColorEditor extension for save functionality");
    
    // Check if required global variables exist
    if (typeof currentShapeInputs === 'undefined' || typeof currentColorInputs === 'undefined') {
        console.warn("ColorEditor globals not found, save functionality may be limited");
    }
    
    // Create a state getter function that will be passed to save_mandart.js
    const getColorEditorState = () => {
        try {
            // Try to access the global variables from ColorEditor.js
            // First try access in current scope
            let shapeInputs = {};
            let colorInputs = {};
            
            if (typeof currentShapeInputs !== 'undefined') {
                shapeInputs = currentShapeInputs;
                console.log("Found currentShapeInputs in current scope", currentShapeInputs);
            } else if (typeof window.currentShapeInputs !== 'undefined') {
                shapeInputs = window.currentShapeInputs;
                console.log("Found currentShapeInputs in window scope", window.currentShapeInputs);
            }
            
            if (typeof currentColorInputs !== 'undefined') {
                colorInputs = currentColorInputs;
                console.log("Found currentColorInputs in current scope", currentColorInputs);
            } else if (typeof window.currentColorInputs !== 'undefined') {
                colorInputs = window.currentColorInputs;
                console.log("Found currentColorInputs in window scope", window.currentColorInputs);
            }
            
            // Also check for currentHues from ColorEditor.js
            if (typeof window.currentHues !== 'undefined' && !colorInputs.hues) {
                console.log("Adding currentHues to colorInputs", window.currentHues);
                colorInputs.hues = window.currentHues;
            }
            
            return { shapeInputs, colorInputs };
        } catch (error) {
            console.error("Error getting ColorEditor state:", error);
            return { shapeInputs: {}, colorInputs: {} };
        }
    };
    
    // Set up the state getter in color_editor_state.js
    initColorEditorState(getColorEditorState);
    
    // Initialize the save button
    initSaveButton();
    
    console.log("ColorEditor extension initialized");
}

// Export helper functions for accessing ColorEditor state externally
export function getCurrentColorInputs() {
    return window.currentColorInputs || null;
}

export function getCurrentShapeInputs() {
    return window.currentShapeInputs || null;
}
