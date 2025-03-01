// controllers/color_controller.js
import Hue from "../models/Hue.js";
import ColorInputs from "../models/ColorInputs.js";
import { redrawCanvas, updateColor,deleteColor } from "../ColorEditor.js"; // Ensure canvas updates when modifying colors
import ColorEditorRow from "../ColorEditorRow.js";  // ✅ Fix missing import
import { hueList } from "../globals.js";  // Ensure UI updates correctly

/**
 * Create ColorInputs object from raw data
 * @param {Object} data
 * @returns {ColorInputs}
 */
export function createColorInputs({ nBlocks, huesLength, spacingColorFar, spacingColorNear, yY, mandColor, hues }) {
    if (!Array.isArray(hues)) {
        console.error("🚨 createColorInputs ERROR: hues is not an array!", hues);
        hues = [];  // ✅ Ensure it's at least an empty array
    }
    return new ColorInputs(
        nBlocks,
        huesLength,
        spacingColorFar,
        spacingColorNear,
        yY,
        new Hue(mandColor),
        hues.map(hue => new Hue(hue))  // ✅ Ensure `hues` are valid Hue objects
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
        mand_color: colorInputs.mand_color,  // ✅ Already an array [r, g, b]
        colors: colorInputs.colors.map(c => [c[0], c[1], c[2]]), // ✅ Convert [r, g, b] only
        hues: colorInputs.hues.map(hue => [hue.num, hue.r, hue.g, hue.b]) // ✅ Ensure [num, r, g, b] format
    };
}

export function updateColorInputs(currentHues, currentColorInputs) {
    console.log("🔄 Updating Color Inputs after CRUD operations...");
    const updatedHues = currentHues.map(hue => new Hue(hue)); 
    const updatedColorInputs = new ColorInputs(
      currentColorInputs.n_blocks,
      currentHues.length,
      currentColorInputs.spacing_color_far,
      currentColorInputs.spacing_color_near,
      currentColorInputs.y_y_input,
      new Hue(currentColorInputs.mand_color),
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
  