// ✅ services/wasm-get-image-from-inputs.js
// ✅ Generates an image using WASM and ensures module readiness.

import { getWasmModule, initWasmService } from './wasm-initializer.js';

/**
 * Generates an image using the WASM module from shape and color inputs.
 * @param {Object} shapeInputs - Shape data for the MandArt image.
 * @param {Object} colorInputs - Color data for the MandArt image.
 * @returns {Promise<Object|null>} - Image data object or null if generation fails.
 */
export async function getImageFromInputs(shapeInputs, colorInputs) {
    console.log("🖼 WASM: Preparing to generate image...");

    // ✅ Ensure WASM is loaded before proceeding
    let wasmModule = getWasmModule();
    if (!wasmModule) {
        console.log("🔄 WASM module not initialized, waiting...");
        wasmModule = await initWasmService();
    }

    // ✅ Double-check WASM module and function
    if (!wasmModule || typeof wasmModule.api_get_image_from_inputs !== 'function') {
        console.error("❌ WASM function `api_get_image_from_inputs` is still undefined.");
        return null;
    }

    try {
        console.log("📤 WASM: Sending shape and color inputs to `api_get_image_from_inputs`.");

        const image = await wasmModule.api_get_image_from_inputs(shapeInputs, colorInputs);

        if (!image || typeof image !== 'object') {
            throw new Error("❌ WASM returned unexpected image format.");
        }

        console.log("✅ WASM: Successfully generated image.", image);
        return image;

    } catch (error) {
        console.error("❌ WASM: Error in image generation:", error);
        return null;
    }
}
