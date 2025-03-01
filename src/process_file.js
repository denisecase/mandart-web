import { wasmModule, canvasContainer } from "./globals.js";
import { populateColorEditor } from "./ColorEditor.js";

export async function processFile(fileObj) {
    try {
        console.log(`Processing selected file: ${fileObj.name}`);
        const fileURL = fileObj.mandart_url;
        const response = await fetch(fileURL);
        if (!response.ok) throw new Error(`Failed to fetch ${fileObj.name}`);
        const content = await response.json();

        // Extract shapeInputs & colorInputs using WASM
        const [shapeInputs, colorInputs] = wasmModule.api_get_inputs_from_piddef_string(
            JSON.stringify(content)
        );

        console.log(`Processing ${fileObj.name}:`, { shapeInputs, colorInputs });

        // Process file with WASM function
        const imageData = wasmModule.api_get_image_from_inputs(shapeInputs, colorInputs);

        if (!imageData || !imageData.data || imageData.data.length === 0) {
            throw new Error("Invalid image data generated");
        }

        // Create canvas
        canvasContainer.innerHTML = ""; // Clear previous images
        const canvas = document.createElement("canvas");
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        canvas.title = fileObj.name;
        canvas.style.border = "1px solid black";
        canvas.style.margin = "10px";

        const ctx = canvas.getContext("2d");
        const imageDataObj = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );
        ctx.putImageData(imageDataObj, 0, 0);

        canvasContainer.appendChild(canvas);

        // Populate the Color Editor dynamically
        await populateColorEditor(fileObj);

    } catch (error) {
        console.error(`Error processing ${fileObj.name}:`, error);
    }
}
