// mandart_save_initializer.js

// Import initialization function and saveInputs
import { initSaveButton, saveInputs } from './save_mandart.js';

/**
 * Initialize the save functionality
 * This should be called after all the main modules are loaded
 */
export function initMandartSaveSystem() {
    console.log("Initializing MandArt save system");
    
    // Initialize the save button
    initSaveButton();
    
    // Make sure the button has a listener
    ensureSaveButtonWorks();
    
    console.log("MandArt save system initialized");
}

/**
 * Make sure the save button actually works
 */
function ensureSaveButtonWorks() {
    const saveMandartBtn = document.getElementById('saveMandartBtn');
    
    if (!saveMandartBtn) {
        console.error("Save button not found in DOM!");
        return;
    }
    
    // Make sure it responds to clicks
    const existingClickHandler = saveMandartBtn.onclick;
    
    if (!existingClickHandler) {
        console.log("Adding direct onclick handler to save button as backup");
        
        saveMandartBtn.onclick = function(event) {
            console.log("Save button clicked (direct handler)");
            try {
                // Try to use the module function first
                const saveModule = import('./save_mandart.js')
                    .then(module => {
                        // Now that we're properly exporting saveInputs, this should work
                if (typeof saveInputs === 'function') {
                    console.log("Calling saveInputs function directly");
                    saveInputs();
                } else if (typeof module.saveInputs === 'function') {
                    console.log("Calling saveInputs from module");
                    module.saveInputs();
                } else {
                    console.log("saveInputs function not found, using fallback");
                    simpleSave();
                }
                    })
                    .catch(err => {
                        console.error("Error importing save_mandart.js:", err);
                        simpleSave();
                    });
            } catch (error) {
                console.error("Error in save button handler:", error);
                simpleSave();
            }
        };
    }
    
    // Make it obvious that it's clickable
    saveMandartBtn.style.cursor = 'pointer';
    
    // Log button state
    console.log("Save button ready:", {
        id: saveMandartBtn.id,
        onclick: typeof saveMandartBtn.onclick,
        listeners: "Check browser DevTools"
    });
}

/**
 * Extremely simple save function as a last resort
 */
function simpleSave() {
    try {
        console.log("Using simple save function");
        
        // Get the current state directly from the DOM
        const state = {
            id: crypto.randomUUID(),
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
        
        // Extract colors from DOM
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
                    id: crypto.randomUUID(),
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
        
        // Get mand color
        const mandColorPicker = document.getElementById('mandColorPicker');
        if (mandColorPicker) {
            const hexColor = mandColorPicker.value;
            
            // Convert hex to RGB
            const r = parseInt(hexColor.slice(1, 3), 16);
            const g = parseInt(hexColor.slice(3, 5), 16);
            const b = parseInt(hexColor.slice(5, 7), 16);
            
            state.mandColor = [r, g, b];
        }
        
        // Create JSON file
        const jsonData = JSON.stringify(state, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const now = new Date();
        const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
        
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `mandart_backup_${timestamp}.mandart`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        console.log("Simple save completed");
    } catch (error) {
        console.error("Error in simpleSave:", error);
        alert("Save failed. Please check console for details.");
    }
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Allow extra time for other modules to initialize
    setTimeout(initMandartSaveSystem, 1000);
});
