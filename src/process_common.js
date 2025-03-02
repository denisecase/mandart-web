// process_common.js - Common functionality for processing files

import { populateColorEditor } from './ColorEditor.js';

/**
 * Process MandArt data and update application state
 * @param {Object} mandartData - The MandArt data to process
 * @param {string} filename - Name of the file being processed
 * @returns {Promise<void>}
 */
export async function processMandartData(mandartData, filename) {
    try {
      console.log(`📂 PROCESS_COMMON Processing MandArt data for: ${filename}`);
      
      // Inspect WASM availability
      if (window.wasmModule) {
        console.log("🔧 Using global WASM module");
      } else if (typeof wasmModule !== 'undefined') {
        console.log("🔧 Using imported WASM module");
        window.wasmModule = wasmModule;
      } else {
        console.error("❌ No WASM module available");
        return;
      }
      
      // Use whichever module is available
      const activeWasm = window.wasmModule;
      
      // Check for required functions
      if (!activeWasm.api_get_inputs_from_piddef_string) {
        console.error("❌ Required WASM function 'api_get_inputs_from_piddef_string' not found");
        console.log("🔧 Available functions:", Object.keys(activeWasm));
        return;
      }
      
      console.log("🔄 Extracting shape and color inputs from data...");
      const [shapeInputs, colorInputs] = activeWasm.api_get_inputs_from_piddef_string(
        JSON.stringify(mandartData)
      );
      
      console.log("PROCESS_COMMON ✅ Inputs extracted:", { 
        shapeInputs: shapeInputs, 
        colorInputs: colorInputs 
      });
  
      // Update UI with extracted data
      await updateUIWithInputs(shapeInputs, colorInputs, filename);
      
    } catch (error) {
      console.error(`❌ Error processing MandArt data: ${error.message}`, error);
      throw error; // Re-throw to allow caller to handle
    }
  }
  
  /**
   * Update UI with shape and color inputs
   * @param {Object} shapeInputs - Shape inputs from WASM
   * @param {Object} colorInputs - Color inputs from WASM
   * @param {string} filename - Name of the file
   * @returns {Promise<void>}
   */
  async function updateUIWithInputs(shapeInputs, colorInputs, filename) {
    try {
      // Clear previous canvas content
      const container = document.getElementById('canvasContainer');
      console.log("🧹 Clearing canvas container");
      container.innerHTML = ""; 
      
      console.log("🖼️ Creating canvas with dimensions:", 
        shapeInputs.image_width || 1100, "x", shapeInputs.image_height || 1000);
        
      const canvas = document.createElement("canvas");
      canvas.id = "canvas";
      canvas.width = shapeInputs.image_width || 1100;
      canvas.height = shapeInputs.image_height || 1000;
      canvas.title = filename;
      container.appendChild(canvas);
      console.log("✅ Canvas added to container");
      
      console.log("🔄 Generating image...");
      
      // Use whichever function your WASM module provides for generating the image
      const imageFn = window.wasmModule.generateMandelbrotImage || 
                      window.wasmModule.api_get_image_from_inputs;
                        
      if (!imageFn) {
        console.error("❌ No image generation function found in WASM module");
        console.log("🔧 Available functions:", Object.keys(window.wasmModule));
        return;
      }
      
      const imageData = imageFn(shapeInputs, colorInputs);
      if (!imageData) {
        console.error("❌ No image data returned from WASM");
        return;
      }
      
      console.log("✅ Image data generated:", imageData);
      // Update canvas with image data
      const ctx = canvas.getContext("2d");
      
      // Check which format the image data is in
      if (imageData.data && imageData.width && imageData.height) {
        // Format with data, width, height properties
        const imageDataObj = new ImageData(
          new Uint8ClampedArray(imageData.data),
          imageData.width,
          imageData.height
        );
        ctx.putImageData(imageDataObj, 0, 0);
      } else if (ArrayBuffer.isView(imageData)) {
        // Raw array format
        const imageDataObj = new ImageData(
          new Uint8ClampedArray(imageData),
          canvas.width,
          canvas.height
        );
        ctx.putImageData(imageDataObj, 0, 0);
      } else {
        console.error("❌ Unknown image data format:", imageData);
        return;
      }
      console.log("✅ Canvas updated with image");
      
      // Create a fileObj structure expected by populateColorEditor
      const fileObj = {
        name: filename,
        // Add other properties if needed by populateColorEditor
      };
      
      // Call your existing color editor population function
      if (typeof populateColorEditor === 'function') {
        console.log("🔄 Populating color editor...");
        await populateColorEditor(fileObj);
        console.log("✅ Color editor populated");
      } else {
        console.warn("⚠️ populateColorEditor function not found");
      }
      
    } catch (error) {
      console.error(`❌ Error updating UI: ${error.message}`, error);
      throw error;
    }
  }