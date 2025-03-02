// save_mandart.js

import { createPngDownloadLink } from './mandart_png_helper.js';


export function initSaveButton() {
    console.log("SAVE_MANDART initSaveButton");
    const saveMandartBtn = document.getElementById('saveMandartBtn');
    
    if (saveMandartBtn) {
        saveMandartBtn.addEventListener('click', () => {
            saveInputs();
        });
    }
}


async function saveInputs() {
    console.log("SAVE_MANDART saveInputs");
    alert("Not implemented yet");
    return;
    
}

/**
 * Save current state as a MandArt file
 * @param {string} filename - Base filename without extension
 * @returns {Promise<void>}
 */
async function saveMandartFile(filename) {
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
    // If WASM module provides a function to get current state, use it
    if (window.wasmModule && typeof window.wasmModule.api_get_current_state === 'function') {
        return window.wasmModule.api_get_current_state();
    }
    
    // Otherwise, reconstruct the state from available data
    console.log("Reconstructing MandArt state from current app state");
    
    // Create a unique ID for this state
    const id = crypto.randomUUID?.() || generateUUID();
    
    // Create base state object
    const state = {
        id: id,
        scale: 430,
        huesOptimizedForPrinter: [],
        yCenter: 0,
        imageWidth: 1100,
        nImage: 0,
        spacingColorFar: 5,
        hues: [],
        leftNumber: 1,
        theta: 0,
        rSqLimit: 400,
        iterationsMax: 10000,
        yY: 0,
        dFIterMin: 0,
        spacingColorNear: 15,
        imageHeight: 1000,
        nBlocks: 60,
        xCenter: -0.75,
        huesEstimatedPrintPreview: []
    };
    
    // Try to get shape inputs from global state
    if (window.shapeInputs) {
        state.imageWidth = window.shapeInputs.image_width || 1100;
        state.imageHeight = window.shapeInputs.image_height || 1000;
        state.iterationsMax = window.shapeInputs.iterations_max || 10000;
        state.scale = window.shapeInputs.scale || 430;
        state.xCenter = window.shapeInputs.x_center || -0.75;
        state.yCenter = window.shapeInputs.y_center || 0;
        state.theta = window.shapeInputs.theta || 0;
        state.dFIterMin = window.shapeInputs.d_f_iter_min || 0;
        state.rSqLimit = window.shapeInputs.r_sq_limit || 400;
    }
    
    // Try to get color inputs from global state
    if (window.colorInputs) {
        state.nBlocks = window.colorInputs.n_blocks || 60;
        state.spacingColorFar = window.colorInputs.spacing_color_far || 5;
        state.spacingColorNear = window.colorInputs.spacing_color_near || 15;
        state.yY = window.colorInputs.y_y_input || 0;
        
        // Get hues
        if (window.colorInputs.hues && Array.isArray(window.colorInputs.hues)) {
            state.hues = window.colorInputs.hues.map(hue => {
                // Create a hue in the expected format
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
    } else {
        // If no global state, try to extract colors from the DOM
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
    
    // Get mand color if available
    const mandColorPicker = document.getElementById('mandColorPicker');
    if (mandColorPicker) {
        const hexColor = mandColorPicker.value;
        
        // Convert hex to RGB
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        
        state.mandColor = [r, g, b];
    }
    
    return state;
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