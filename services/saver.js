// services/saver.js



import { createPngDownloadLink } from './mandart_png_helper.js';
import { eventBus } from '../state/state-all.js';
import { getUIElement } from '../globals.js';
// // Global state getter
// let getStateFromColorEditor = null;



// // Save button initialization
// export function initSaveButton() {
//     console.log("SAVE_MANDART initSaveButton");
//     const saveMandartBtn = document.getElementById('saveMandartBtn');
    
//     if (saveMandartBtn) {
//         saveMandartBtn.addEventListener('click', () => {
//             saveInputs();
//         });
//     }
// }

// async function saveInputs() {
//     console.log("SAVE_MANDART saveInputs");
    
//     try {
//         // Get the canvas element to extract its title (filename)
//         const canvas = document.getElementById("canvas");
//         if (!canvas) {
//             console.error("Canvas not found for saving");
//             alert("Error: Canvas not found");
//             return;
//         }
        
//         // Get base filename from canvas title or use a default
//         let baseFilename = "mandart";
//         if (canvas.title && canvas.title.trim() !== "") {
//             // Extract base filename without extension if present
//             baseFilename = canvas.title.replace(/\.(mandart|json)$/i, "");
//         }
        
//         // Save MandArt file
//         const success = await saveMandartFile(baseFilename);
        
//         if (success) {
//             console.log(`Successfully saved MandArt file: ${baseFilename}.mandart`);
//         } else {
//             console.error("Failed to save MandArt file");
//             alert("Error saving MandArt file. Please try again.");
//         }
//     } catch (error) {
//         console.error("Error in saveInputs:", error);
//         alert(`Error saving file: ${error.message}`);
//     }
// }

/**
 * Save current state as a MandArt file
 * @param {string} filename - Base filename without extension
 * @returns {Promise<boolean>} Success status
 */
export async function saveMandartFile(filename) {
    try {
        // Get current state from WASM module or reconstruct it
        const mandartData = getCurrentMandartState();
        
        // Stringify with proper formatting
        const jsonData = JSON.stringify(mandartData, null, 2);
        
        // Create download link
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `${filename}.mandart`;
        
        // Add to document and trigger click
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Clean up
        document.body.removeChild(downloadLink);
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        return true;
    } catch (error) {
        console.error('Error saving MandArt file:', error);
        throw error;
    }
}

/**
 * Get current MandArt state from WASM module or UI elements
 * @returns {Object} Current state in MandArt format
 */
function getCurrentMandartState() {
    // Try to get state from ColorEditor first if the getter is available
    if (typeof getStateFromColorEditor === 'function') {
        const editorState = getStateFromColorEditor();
        if (editorState && editorState.shapeInputs && editorState.colorInputs) {
            console.log("Using state from ColorEditor");
            return createMandartStateFromInputs(editorState.shapeInputs, editorState.colorInputs);
        }
    }
    
    // If WASM module provides a function to get current state, use it
    if (window.wasmModule && typeof window.wasmModule.api_get_current_state === 'function') {
        return window.wasmModule.api_get_current_state();
    }
    
    // Otherwise, reconstruct the state from available data
    console.log("Reconstructing MandArt state from current app state");
    
    // Try to get state from global variables
    const currentShapeInputs = window.currentShapeInputs || {};
    const currentColorInputs = window.currentColorInputs || {};
    const currentHues = window.currentHues || [];
    
    // Create inputs object to pass to createMandartStateFromInputs
    const shapeInputs = {
        scale: currentShapeInputs.scale || 430,
        x_center: currentShapeInputs.x_center || -0.75,
        y_center: currentShapeInputs.y_center || 0,
        image_width: currentShapeInputs.image_width || 1100,
        image_height: currentShapeInputs.image_height || 1000,
        theta: currentShapeInputs.theta || 0,
        r_sq_limit: currentShapeInputs.r_sq_limit || 400,
        iterations_max: currentShapeInputs.iterations_max || 10000,
        d_f_iter_min: currentShapeInputs.d_f_iter_min || 0
    };
    
    const colorInputs = {
        n_blocks: currentColorInputs.n_blocks || 60,
        spacing_color_far: currentColorInputs.spacing_color_far || 5,
        spacing_color_near: currentColorInputs.spacing_color_near || 15,
        y_y_input: currentColorInputs.y_y_input || 0,
        hues: currentHues.length > 0 ? currentHues : (currentColorInputs.hues || []),
        mand_color: currentColorInputs.mand_color || [0, 0, 0]
    };
    
    return createMandartStateFromInputs(shapeInputs, colorInputs);
}

/**
 * Creates a properly formatted MandArt state object from shape and color inputs
 * @param {Object} shapeInputs - Shape inputs object
 * @param {Object} colorInputs - Color inputs object
 * @returns {Object} MandArt state object
 */
function createMandartStateFromInputs(shapeInputs, colorInputs) {
    console.log("Creating MandArt state from inputs:", { shapeInputs, colorInputs });
    
    // Create a unique ID for this state or preserve existing ID if available
    const id = (shapeInputs.id || colorInputs.id || crypto.randomUUID?.() || generateUUID());
    
    // Base state object
    const state = {
        id: id,
        // Shape parameters
        scale: shapeInputs.scale || 430,
        xCenter: shapeInputs.x_center || -0.75,
        yCenter: shapeInputs.y_center || 0,
        imageWidth: shapeInputs.image_width || 1100,
        imageHeight: shapeInputs.image_height || 1000,
        theta: shapeInputs.theta || 0,
        rSqLimit: shapeInputs.r_sq_limit || 400,
        iterationsMax: shapeInputs.iterations_max || 10000,
        dFIterMin: shapeInputs.d_f_iter_min || 0,
        
        // Color parameters
        nBlocks: colorInputs.n_blocks || 60,
        spacingColorFar: colorInputs.spacing_color_far || 5,
        spacingColorNear: colorInputs.spacing_color_near || 15,
        yY: colorInputs.y_y_input || 0,
        nImage: 0,
        leftNumber: 1,
        huesOptimizedForPrinter: [],
        huesEstimatedPrintPreview: []
    };
    
    // Add the hues list with careful extraction
    state.hues = [];
    
    // First try the most direct path from colorInputs
    if (colorInputs.hues && Array.isArray(colorInputs.hues)) {
        console.log("Extracting hues from colorInputs.hues", colorInputs.hues);
        
        state.hues = colorInputs.hues.map(hue => {
            // Make sure we create each hue in the expected format
            return {
                id: hue.id || generateUUID(),
                num: hue.num || 1,
                r: hue.r || 0,
                g: hue.g || 0,
                b: hue.b || 0,
                color: {
                    red: (hue.r || 0) / 255,
                    green: (hue.g || 0) / 255,
                    blue: (hue.b || 0) / 255
                }
            };
        });
    } 
    // If that fails, try checking for currentHues global
    else if (window.currentHues && Array.isArray(window.currentHues)) {
        console.log("Extracting hues from window.currentHues", window.currentHues);
        
        state.hues = window.currentHues.map(hue => ({
            id: hue.id || generateUUID(),
            num: hue.num || 1,
            r: hue.r || 0,
            g: hue.g || 0,
            b: hue.b || 0,
            color: {
                red: (hue.r || 0) / 255,
                green: (hue.g || 0) / 255,
                blue: (hue.b || 0) / 255
            }
        }));
    }
    // If still no hues, try extracting from the DOM as a last resort
    else {
        console.log("Extracting hues from DOM");
        const hueList = document.getElementById('hueList');
        if (hueList) {
            const hueRows = hueList.querySelectorAll('.hue-row');
            
            state.hues = Array.from(hueRows).map((row, index) => {
                const colorPicker = row.querySelector('input[type="color"]');
                const hexColor = colorPicker ? colorPicker.value : '#000000';
                
                // Convert hex to RGB
                const r = parseInt(hexColor.slice(1, 3), 16);
                const g = parseInt(hexColor.slice(3, 5), 16);
                const b = parseInt(hexColor.slice(5, 7), 16);
                
                return {
                    id: generateUUID(),
                    num: index + 1,
                    r: r,
                    g: g,
                    b: b,
                    color: {
                        red: r / 255,
                        green: g / 255,
                        blue: b / 255
                    }
                };
            });
        }
    }
    
    console.log("Final hues array:", state.hues);
    
    // Add mand color if available
    if (colorInputs.mand_color && Array.isArray(colorInputs.mand_color) && colorInputs.mand_color.length === 3) {
        state.mand_color = colorInputs.mand_color;
    } else if (window.currentColorInputs && window.currentColorInputs.mand_color) {
        state.mand_color = window.currentColorInputs.mand_color;
    } else {
        // Try to get from DOM
        const mandColorPicker = document.getElementById('mandColorPicker');
        if (mandColorPicker) {
            const hexColor = mandColorPicker.value;
            
            // Convert hex to RGB
            const r = parseInt(hexColor.slice(1, 3), 16);
            const g = parseInt(hexColor.slice(3, 5), 16);
            const b = parseInt(hexColor.slice(5, 7), 16);
            
            state.mand_color = [r, g, b];
        }
    }
    
    return state;
}

/**
 * Initialize the save system
 */
export function initMandartSaveSystem() {
    console.log("Initializing MandArt save system");
    
    // Set up state getter function
    setStateGetter();
    
    // Initialize the save button
    initSaveButton();
    
    console.log("MandArt save system initialized");
}

/**
 * Set the state getter function
 * @param {Function} stateGetterFunction - Optional function to get the current state
 */
export function setStateGetter(stateGetterFunction) {
    if (typeof stateGetterFunction === 'function') {
        getStateFromColorEditor = stateGetterFunction;
        return;
    }
    
    // Default state getter that tries to access global variables
    getStateFromColorEditor = () => {
        try {
            // Try to access the global variables from ColorEditor.js
            let shapeInputs = {};
            let colorInputs = {};
            
            if (typeof window.currentShapeInputs !== 'undefined') {
                shapeInputs = window.currentShapeInputs;
            }
            
            if (typeof window.currentColorInputs !== 'undefined') {
                colorInputs = window.currentColorInputs;
            }
            
            // Also check for currentHues from ColorEditor.js
            if (typeof window.currentHues !== 'undefined' && (!colorInputs.hues || colorInputs.hues.length === 0)) {
                console.log("Adding currentHues to colorInputs", window.currentHues);
                colorInputs.hues = window.currentHues;
            }
            
            return { shapeInputs, colorInputs };
        } catch (error) {
            console.error("Error getting ColorEditor state:", error);
            return { shapeInputs: {}, colorInputs: {} };
        }
    };
}

/**
 * Generate a UUID for unique identifiers
 * @returns {string} A random UUID
 */
function generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    
    // Fallback implementation for browsers without crypto.randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Initialize the save system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait a short time to ensure other modules are loaded
    setTimeout(initMandartSaveSystem, 500);
});