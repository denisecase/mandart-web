import { wasmModule, canvasContainer } from "./globals.js";
import { populateColorEditor } from "./ColorEditor.js";

export async function processFile(fileObj) {
    try {
        console.log(`📂 PROCESS_FILE Processing selected file: ${fileObj.name}`);
        
        if (!fileObj) {
            console.error("❌ File object is null or undefined");
            return;
        }
        
        // Inspect WASM availability
        if (window.wasmModule) {
            console.log("🔧 Using global WASM module");
        } else if (wasmModule) {
            console.log("🔧 Using imported WASM module");
            // Make it globally available for consistency
            window.wasmModule = wasmModule;
        } else {
            console.error("❌ No WASM module available");
            return;
        }
        
        // Use whichever module is available
        const activeWasm = window.wasmModule || wasmModule;
        
        // Check for required functions
        if (!activeWasm.api_get_inputs_from_piddef_string) {
            console.error("❌ Required WASM function 'api_get_inputs_from_piddef_string' not found");
            console.log("🔧 Available functions:", Object.keys(activeWasm));
            return;
        }
        
        // Check if canvasContainer exists
        if (!canvasContainer) {
            console.error("❌ Canvas container not found");
            const containerElem = document.getElementById('canvasContainer');
            if (containerElem) {
                console.log("🔧 Found canvasContainer by ID, using it instead");
                window.canvasContainer = containerElem;
            } else {
                console.error("❌ Cannot find canvasContainer element");
                return;
            }
        }
        
        // Fetch the file
        console.log(`🔄 Fetching file from URL: ${fileObj.mandart_url}`);
        const response = await fetch(fileObj.mandart_url);
        
        if (!response.ok) {
            console.error(`❌ Failed to fetch file (status ${response.status}): ${response.statusText}`);
            throw new Error(`Failed to fetch ${fileObj.name} (status ${response.status})`);
        }
        
        const content = await response.json();
        console.log(`✅ File content loaded for ${fileObj.name}`, content);

        // Extract inputs
        console.log("🔄 Extracting shape and color inputs from file...");
        const [shapeInputs, colorInputs] = activeWasm.api_get_inputs_from_piddef_string(
            JSON.stringify(content)
        );
        
        console.log("✅ Inputs extracted:", { 
            shapeInputs: shapeInputs, 
            colorInputs: colorInputs 
        });

        // Clear previous canvas content
        const container = canvasContainer || document.getElementById('canvasContainer');
        console.log("🧹 Clearing canvas container");
        container.innerHTML = ""; 
        
        // Create canvas
        console.log("🖼️ Creating canvas with dimensions:", 
            shapeInputs.image_width || 1100, "x", shapeInputs.image_height || 1000);
            
        const canvas = document.createElement("canvas");
        canvas.id = "canvas";
        canvas.width = shapeInputs.image_width || 1100;
        canvas.height = shapeInputs.image_height || 1000;
        canvas.title = fileObj.name;
    
        
        // Add canvas to container
        container.appendChild(canvas);
        console.log("✅ Canvas added to container");
        
        // Generate image
        console.log("🔄 Generating image...");
        
        // Use whichever function your WASM module provides for generating the image
        // This might be generateMandelbrotImage, api_get_image_from_inputs, or something else
        const imageFn = activeWasm.generateMandelbrotImage || 
                        activeWasm.api_get_image_from_inputs;
                        
        if (!imageFn) {
            console.error("❌ No image generation function found in WASM module");
            console.log("🔧 Available functions:", Object.keys(activeWasm));
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

        // Populate the Color Editor
        console.log("🔄 Populating color editor...");
        await populateColorEditor(fileObj);
        console.log("✅ Color editor populated");

    } catch (error) {
        console.error(`❌ Error processing file: ${error.message}`, error);
    }
}