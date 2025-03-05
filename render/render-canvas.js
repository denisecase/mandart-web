// ✅ Handles image generation & applies updates to Canvas.js.  
import { getImageFromInputs } from '../services/wasm-get-image-from-inputs.js';
import { getShapeState, subscribeToShapeState } from '../state/state-shape-inputs.js'; 
import { getColorState, subscribeToColorState } from '../state/state-color-inputs.js';
import { subscribeToFileState } from '../state/state-file.js'; // Add this import 
import { initCanvas } from '../components/Canvas.js';
import { getUIElement } from '../globals.js'; 
import { eventBus } from '../state/state-all.js'; 

let canvasInstance = null;

/**
 * Initializes the canvas instance.
 * Call this after initGlobals() has been executed.
 */
export function initRenderCanvas() {
    canvasInstance = initCanvas();
    
    // Subscribe to relevant state changes    
    subscribeToShapeState(renderCanvas);   
    subscribeToColorState(renderCanvas);   
    subscribeToFileState(onFileStateChanged); 
    

}

/**
 * Handles file state changes
 */
function onFileStateChanged(newFileState) {
    console.log("📂 RENDER: File state changed, triggering canvas update...");
    // Delay rendering to ensure other states (shape, color) are updated first
    setTimeout(() => {
        renderCanvas();
    }, 200);
}

/**
 * Renders the current state to the canvas.
 * @returns {Promise<boolean>} Success status.
 */
export async function renderCanvas() {
    console.log("🖌️ Rendering canvas...");

    try {
        // Ensure the UI canvas is available
        const canvasElement = getUIElement('canvas');
        if (!canvasElement) {
            console.error("❌ renderCanvas: Canvas element not found in the DOM.");
            return false;
        }

        const shapeInputs = getShapeState();
        const colorInputs = getColorState();
        console.log("RENDER: ColorInputs:", { colorInputs });

        if (!shapeInputs || !colorInputs) {
            console.error("❌ renderCanvas: Invalid inputs.", { shapeInputs, colorInputs });
            return false;
        }

        // Fetch image data before rendering
        const imageData = await getImageFromInputs(shapeInputs, colorInputs);

        console.log("🖌️ RENDER: Image Data Received:", imageData); // 🔍 Debugging log
        
        if (!imageData) {
            console.error("❌ renderCanvas: Failed to generate image.");
            return false;
        }
        
        if (!imageData) {
            console.error("❌ renderCanvas: Failed to generate image.");
            return false;
        }

        // Format the image data into an ImageData object.
        const formattedImageData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );


        // Ensure we have a valid canvas instance before rendering
        if (!canvasInstance) {
            console.warn("⚠️ Canvas instance is not initialized. Initializing now...");
            canvasInstance = initCanvas();
            canvasInstance.clearCanvas(); // 🔥 Ensure old image is cleared
            canvasInstance.renderCanvas(formattedImageData);
            
        }

        if (!canvasInstance) {
            console.error("❌ renderCanvas: Canvas instance is not initialized.");
            return false;
        }

        requestAnimationFrame(() => {
            canvasInstance.setCanvasDimensions(imageData.width, imageData.height);
            canvasInstance.renderCanvas(formattedImageData);
            console.log("✅ Canvas successfully updated.");
        });

        return true;
    } catch (error) {
        console.error("❌ renderCanvas: Error rendering image.", error);
        return false;
    }
}
subscribeToShapeState(renderCanvas);   
subscribeToColorState(renderCanvas);  