// services/wasm-get-inputs-from-picdef-string.js
// Calls the WASM function to get shape and color inputs from a json string.

import { getWasmModule, initWasmService } from './wasm-initializer.js';

/**
 * Extracts shape and color inputs from a JSON string with .mandart data.
 * @param {string} jsonString - The MandArt JSON data as a string.
 * @returns {Promise<[Object|null, Object|null]>} - Shape and color inputs or [null, null] if failed.
 */
export async function getInputsFromPicdefString(jsonString) {
    console.log("🔍 Processing Mandart JSON string with WASM:", jsonString);

    // Ensure WASM is loaded
    let wasmModule = getWasmModule();
    if (!wasmModule) {
        console.log("🔄 WASM module not initialized, initializing...");
        wasmModule = await initWasmService();
    }

    // Validate WASM module and function
    if (!wasmModule || !wasmModule.api_get_inputs_from_picdef_string) {
        console.error("❌ WASM module unavailable or missing required function.");
        return [null, null];
    }

    try {
        const result = wasmModule.api_get_inputs_from_picdef_string(jsonString);

        if (!Array.isArray(result) || result.length !== 2) {
            throw new Error("❌ WASM returned unexpected result format.");
        }

        const [shapeInputs, colorInputs] = result;

        console.log("✅ Extracted shapeInputs:", shapeInputs);
        console.log("✅ Extracted colorInputs:", colorInputs);

        if (!shapeInputs || typeof shapeInputs !== 'object') {
            console.error("❌ Invalid shapeInputs from WASM:", shapeInputs);
            return [null, null];
        }

        if (!colorInputs || typeof colorInputs !== 'object') {
            console.error("❌ Invalid colorInputs from WASM:", colorInputs);
            return [null, null];
        }

        // ✅ Return the extracted inputs (let caller handle state updates)
        return [shapeInputs, colorInputs];

    } catch (error) {
        console.error("❌ Error extracting inputs from WASM:", error.message);
        return [null, null];
    }
}
