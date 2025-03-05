// save_mandart.js

// Get the wasmModule
let wasmModule = null;
try {
    // Try to import from globals - this might fail if the module isn't available yet
    import('../globals.js').then(globals => {
        wasmModule = globals.wasmModule;
        console.log("SAVE_MANDART: Imported wasmModule from globals");
    }).catch(err => {
        console.warn("SAVE_MANDART: Could not import wasmModule from globals", err);
    });
} catch (e) {
    console.warn("SAVE_MANDART: Error importing globals", e);
}

// Flag to prevent multiple save operations
let isSaving = false;

// Save button initialization
export function initSaveButton() {
    console.log("SAVE_MANDART initSaveButton");
    const saveMandartBtn = document.getElementById('saveMandartBtn');
    
    if (saveMandartBtn) {
        // Remove any existing listeners to prevent duplicates
        const newBtn = saveMandartBtn.cloneNode(true);
        saveMandartBtn.parentNode.replaceChild(newBtn, saveMandartBtn);
        
        // Add our listener
        newBtn.addEventListener('click', async () => {
            try {
                // Prevent multiple clicks
                if (isSaving) {
                    console.log("SAVE_MANDART Already saving, please wait...");
                    return;
                }
                
                console.log("SAVE_MANDART Button clicked");
                isSaving = true;
                
                // Visual feedback
                newBtn.disabled = true;
                newBtn.textContent = "Saving...";
                
                // Save the file
                await saveInputs();
                
                // Reset button
                setTimeout(() => {
                    newBtn.disabled = false;
                    newBtn.innerHTML = '<i class="fas fa-download"></i> Save Inputs';
                    isSaving = false;
                }, 2000);
                
            } catch (error) {
                console.error("Error in save button handler:", error);
                alert("Error saving file: " + error.message);
                
                // Reset button even on error
                newBtn.disabled = false;
                newBtn.innerHTML = '<i class="fas fa-download"></i> Save Inputs';
                isSaving = false;
            }
        });
        console.log("SAVE_MANDART Save button listener attached");
    } else {
        console.warn("SAVE_MANDART Save button not found in DOM");
    }
}

// Expose the saveInputs function so it can be called from other modules
export async function saveInputs() {
    console.log("SAVE_MANDART saveInputs");
    
    try {
        // Get the canvas element to extract its title (filename)
        const canvas = document.getElementById("canvas");
        if (!canvas) {
            console.error("Canvas not found for saving");
            alert("Error: Canvas not found");
            return;
        }
        
        // Get base filename 
        let baseFilename = getProperFilename();
        console.log(`Using base filename: ${baseFilename}`);
        
        // Save MandArt file
        const success = await saveMandartFile(baseFilename);
        
        if (success) {
            console.log(`Successfully saved MandArt file: ${baseFilename}.mandart`);
        } else {
            console.error("Failed to save MandArt file");
            alert("Error saving MandArt file. Please try again.");
        }
    } catch (error) {
        console.error("Error in saveInputs:", error);
        alert(`Error saving file: ${error.message}`);
    }
}

/**
 * Get the proper filename from available sources
 * @returns {string} The proper base filename without extension
 */
function getProperFilename() {
    // First check if we have a MandArtState manager
    if (window.MandArtState && typeof window.MandArtState.getFilenameForSave === 'function') {
        const filename = window.MandArtState.getFilenameForSave();
        console.log(`SAVE_MANDART Using filename from app state: ${filename}`);
        return filename;
    }
    
    // Default filename
    let baseFilename = "mandart";
    
    try {
        // Get the dropdown element
        const fileSelect = document.getElementById('fileSelect');
        console.log("SAVE_MANDART fileSelect found:", !!fileSelect);
        
        if (fileSelect && fileSelect.options && fileSelect.options.length > 0) {
            // Get the selected option - Debug log all options
            console.log("SAVE_MANDART Options count:", fileSelect.options.length);
            console.log("SAVE_MANDART Selected index:", fileSelect.selectedIndex);
            
            // Print all options for debugging
            for (let i = 0; i < fileSelect.options.length; i++) {
                const option = fileSelect.options[i];
                console.log(`Option ${i}: value=${option.value}, text=${option.text || option.textContent || ""}`);
            }
            
            if (fileSelect.selectedIndex >= 0) {
                const option = fileSelect.options[fileSelect.selectedIndex];
                
                // Try all possible ways to get the option text
                const optionText = option.text || option.textContent || option.innerText || option.label || option.value;
                console.log("SAVE_MANDART Selected option text:", optionText);
                
                if (optionText && optionText.trim() !== "") {
                    // Clean up the filename
                    const parts = optionText.split('/');
                    const filenameWithExt = parts[parts.length - 1];
                    baseFilename = filenameWithExt.replace(/\.[^/.]+$/, "");
                    console.log(`SAVE_MANDART Using option text: ${baseFilename}`);
                    return baseFilename;
                }
            }
        }
        
        // Fall back to canvas title
        const canvas = document.getElementById("canvas");
        if (canvas && canvas.title && canvas.title.trim() !== "") {
            baseFilename = canvas.title.replace(/\.(mandart|json)$/i, "");
            console.log(`SAVE_MANDART Using canvas title: ${baseFilename}`);
            return baseFilename;
        }
    } catch (error) {
        console.error("Error getting filename:", error);
    }
    
    // Add timestamp to default name
    const now = new Date();
    baseFilename = `mandart_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    console.log(`SAVE_MANDART Using default name: ${baseFilename}`);
    
    return baseFilename;
}

/**
 * Save current state as a MandArt file
 * @param {string} filename - Base filename without extension
 * @returns {Promise<boolean>} Success status
 */
async function saveMandartFile(filename) {
    try {
        // Get current state from WASM module or reconstruct it
        const mandartData = getCurrentMandartState();
        console.log("SAVE_MANDART State data:", mandartData);
        
        // Stringify with proper formatting
        const jsonData = JSON.stringify(mandartData, null, 2);
        
        // Create a Blob for download
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Get or create the download container
        const containerId = 'download-container-mandart';
        let container = document.getElementById(containerId);
        
        if (!container) {
            console.log("SAVE_MANDART Creating new download container");
            container = document.createElement('div');
            container.id = containerId;
            
            // Add to the canvas section
            const canvasSection = document.getElementById('canvasSection');
            if (canvasSection) {
                canvasSection.appendChild(container);
            } else {
                document.body.appendChild(container);
            }
        } else {
            // Clear previous download links
            container.innerHTML = '';
        }
        
        // Create styled download link
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `${filename}.mandart`;
        downloadLink.textContent = `Download ${filename}.mandart`;
        downloadLink.className = 'mandart-download-link';
        
        // Add some basic styling to the link
        downloadLink.style.display = 'block';
        downloadLink.style.margin = '10px 0';
        downloadLink.style.padding = '5px 10px';
        downloadLink.style.backgroundColor = '#f0f0f0';
        downloadLink.style.border = '1px solid #ccc';
        downloadLink.style.borderRadius = '4px';
        downloadLink.style.textAlign = 'center';
        downloadLink.style.textDecoration = 'none';
        downloadLink.style.color = '#333';
        
        // Add to container
        container.appendChild(downloadLink);
        
        // Auto-click the link to start download
        console.log("SAVE_MANDART Auto-clicking download link");
        downloadLink.click();
        
        // Fade out the container after a few seconds
        setTimeout(() => {
            // Fade out animation
            container.style.opacity = '0';
            container.style.transition = 'opacity 1s ease';
            
            // Remove after fade
            setTimeout(() => {
                container.innerHTML = '';
                container.style.opacity = '1'; // Reset opacity for next time
                container.style.transition = '';
                
                // Release URL object
                URL.revokeObjectURL(url);
                console.log("SAVE_MANDART Cleanup completed");
            }, 1000);
        }, 3000);
        
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
    console.log("SAVE_MANDART getCurrentMandartState");
    
    try {
        // Try to directly access the wasmModule
        if (window.wasmModule && typeof window.wasmModule.api_get_current_state === 'function') {
            console.log("SAVE_MANDART Using wasmModule.api_get_current_state");
            return window.wasmModule.api_get_current_state();
        } else if (wasmModule && typeof wasmModule.api_get_current_state === 'function') {
            console.log("SAVE_MANDART Using imported wasmModule.api_get_current_state");
            return wasmModule.api_get_current_state();
        }
    } catch (error) {
        console.error("Error accessing WASM module:", error);
    }
    
    console.log("SAVE_MANDART Falling back to state reconstruction");
    
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
    
    try {
        // Try to access global variables
        if (window.currentShapeInputs) {
            console.log("SAVE_MANDART Accessing currentShapeInputs:", window.currentShapeInputs);
            state.scale = window.currentShapeInputs.scale || 430;
            state.xCenter = window.currentShapeInputs.x_center || -0.75;
            state.yCenter = window.currentShapeInputs.y_center || 0;
            state.imageWidth = window.currentShapeInputs.image_width || 1100;
            state.imageHeight = window.currentShapeInputs.image_height || 1000;
            state.theta = window.currentShapeInputs.theta || 0;
            state.rSqLimit = window.currentShapeInputs.r_sq_limit || 400;
            state.iterationsMax = window.currentShapeInputs.iterations_max || 10000;
            state.dFIterMin = window.currentShapeInputs.d_f_iter_min || 0;
        }
        
        if (window.currentColorInputs) {
            console.log("SAVE_MANDART Accessing currentColorInputs:", window.currentColorInputs);
            state.nBlocks = window.currentColorInputs.n_blocks || 60;
            state.spacingColorFar = window.currentColorInputs.spacing_color_far || 5;
            state.spacingColorNear = window.currentColorInputs.spacing_color_near || 15;
            state.yY = window.currentColorInputs.y_y_input || 0;
            
            if (window.currentColorInputs.mand_color) {
                state.mandColor = window.currentColorInputs.mand_color;
            }
        }
        
        // Extract hues from DOM if needed
        if (window.currentHues && Array.isArray(window.currentHues)) {
            console.log("SAVE_MANDART Accessing currentHues:", window.currentHues);
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
        } else {
            // Extract hues from the DOM
            console.log("SAVE_MANDART Extracting hues from DOM");
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
        
        // Get mand color from DOM if not found in globals
        if (!state.mandColor) {
            const mandColorPicker = document.getElementById('mandColorPicker');
            if (mandColorPicker) {
                const hexColor = mandColorPicker.value;
                
                // Convert hex to RGB
                const r = parseInt(hexColor.slice(1, 3), 16);
                const g = parseInt(hexColor.slice(3, 5), 16);
                const b = parseInt(hexColor.slice(5, 7), 16);
                
                state.mandColor = [r, g, b];
            }
        }
    } catch (error) {
        console.error("Error reconstructing state:", error);
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
