import Hue from "../models/Hue.js";
import ColorInputs from "../models/ColorInputs.js";
import { redrawCanvas, updateColor, deleteColor } from "../ColorEditor.js"; 
import ColorEditorRow from "../ColorEditorRow.js";
import { hueList } from "../globals.js";

/**
 * Create ColorInputs object from raw data
 * @param {Object} data
 * @returns {ColorInputs}
 */
export function createColorInputs({ nBlocks, spacingColorFar, spacingColorNear, yY, mandColor, hues }) {
    // Note: removed huesLength parameter - it was causing the issue
    
    if (!Array.isArray(hues)) {
        console.error("🚨 createColorInputs ERROR: hues is not an array!", hues);
        hues = [];  // Ensure it's at least an empty array
    }
    
    // IMPORTANT: mandColor should be an array [r,g,b], not a Hue object
    return new ColorInputs(
        nBlocks,
        spacingColorFar,
        spacingColorNear,
        yY,
        mandColor, // Pass as array, not as new Hue(mandColor)
        hues.map(hue => hue instanceof Hue ? hue : new Hue(hue))
    );
}

/**
 * Format ColorInputs object for WASM
 * @param {ColorInputs} colorInputs
 * @returns {Object}
 */
export function getColorInputsForWasm(colorInputs) {
    return {
        n_blocks: colorInputs.n_blocks,
        n_colors: colorInputs.n_colors,
        spacing_color_far: colorInputs.spacing_color_far,
        spacing_color_near: colorInputs.spacing_color_near,
        y_y_input: colorInputs.y_y_input,
        mand_color: colorInputs.mand_color,  // Already an array [r, g, b]
        colors: colorInputs.colors.map(c => [c[0], c[1], c[2]]), // Convert [r, g, b] only
        hues: colorInputs.hues.map(hue => [hue.num, hue.r, hue.g, hue.b]) // Ensure [num, r, g, b] format
    };
}

export function updateColorInputs(currentHues, currentColorInputs) {
    console.log("🔄 Updating Color Inputs after CRUD operations...");
    
    const mandColor = Array.isArray(currentColorInputs.mand_color)
        ? currentColorInputs.mand_color  // Already a valid array, use as is
        : (currentColorInputs.mand_color instanceof Hue
            ? [currentColorInputs.mand_color.r, currentColorInputs.mand_color.g, currentColorInputs.mand_color.b]
            : [0, 0, 0]); // Default to black if undefined 
        
    const updatedHues = currentHues.map(hue => new Hue(hue)); 
    
    // IMPORTANT: Don't pass huesLength to constructor
    const updatedColorInputs = new ColorInputs(
        currentColorInputs.n_blocks,
        currentColorInputs.spacing_color_far,
        currentColorInputs.spacing_color_near,
        currentColorInputs.y_y_input,
        mandColor, // Pass array, not Hue object
        updatedHues
    );
    
    console.log("🎨 Updated ColorInputs:", updatedColorInputs);
  
    hueList.innerHTML = "";
    currentHues.forEach((color, i) => {
      const row = new ColorEditorRow(i, color, updateColor, deleteColor);  
      hueList.appendChild(row.element);
    });
    
    redrawCanvas();
    
    return updatedColorInputs;  
}