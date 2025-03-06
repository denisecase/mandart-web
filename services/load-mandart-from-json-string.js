// ✅ services/load-mandart-from-json-string.js
// ✅ Loads a MandArt JSON string, extracts inputs, generates an image, and updates the state.

import { getInputsFromPicdefString } from "./wasm-get-inputs-from-picdef-string.js";
import { getImageFromInputs } from "./wasm-get-image-from-inputs.js";
import { getState, updateState } from "../state/state-all.js";
import { loadColorInputsFromState } from "./load-color-inputs-from-state.js";   

let lastLoadedId = null;
/**
 * Process MandArt data and update application state.
 * @param {String} jsonString - The MandArt data as a JSON string.
 * @returns {Promise<void>}
 */
export async function loadMandartFromJsonString(jsonString) {
    try {
        console.log("✅ LOAD Starting Load from MandArt JSON String");
        if (!jsonString || jsonString.trim() === "") {
            console.error("❌ FROM URL: JSON string is empty or undefined.");
            return null;
        }
        
        // Get the current file name from state (deep copy not needed here)
        const currentFileName = getState().file.currentFilename;
        console.log("✅ LOAD starting with Current filename:", currentFileName);

        if (lastLoadedId === currentFileName) {
            console.warn(`⚠️ Skipping redundant processing for file: ${currentFileName}`);
            return;
        }
        lastLoadedId = currentFileName;

        // Extract inputs from WASM
        const [shapeInputs, colorInputs] = await getInputsFromPicdefString(jsonString);
        if (!shapeInputs || !colorInputs) {
            throw new Error("❌ Invalid inputs extracted from JSON");
        }

        // Deep copy to prevent unintended mutations
        const shapeInputsCopy = JSON.parse(JSON.stringify(shapeInputs));
        const colorInputsCopy = JSON.parse(JSON.stringify(colorInputs));

        console.log("✅ LOAD GOT Extracted Inputs:", { shapeInputs: shapeInputsCopy, colorInputs: colorInputsCopy });

        // Update state using deep copies
        updateState({
            shape: shapeInputsCopy,
            color: colorInputsCopy,
            file: {
                ...getState().file,
                lastLoaded: {
                    filename: currentFileName,
                    shapeInputs: shapeInputsCopy,
                    colorInputs: colorInputsCopy
                }
            }
        });

        // update controls
        loadColorInputsFromState(colorInputsCopy);

        // Generate image using WASM (deep copy again for safety)
        const image = await getImageFromInputs(
            JSON.parse(JSON.stringify(shapeInputsCopy)),
            JSON.parse(JSON.stringify(colorInputsCopy))
        );

        if (!image) throw new Error("❌ Image generation failed");

        console.log("✅ LOAD Extracted Image:", image);
        console.log("✅ LOAD SUCCESS: Done Loading MandArt complete.");
    } catch (error) {
        console.error(`❌ Error loading MandArt data: ${error.message}`, error);
    }
}
