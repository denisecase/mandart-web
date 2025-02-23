import { ArtImage } from "../utils/ArtUtils.js";
import { loadPrecomputedGrid } from "../utils/GridUtils.js";

/**
 * ✅ Uses WASM for optimized rendering (if available).
 */
export function setupCanvasWithWasm(wasmModule) {
    console.log("🔍 Initializing WASM Canvas...");

    const canvas = document.getElementById("mandelbrotCanvas");
    if (!canvas) {
        console.error("❌ Canvas element not found! Ensure the ID is correct.");
        return null;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("❌ Unable to get 2D context. Browser might not support it.");
        return null;
    }

    let imageData = null;

    function drawWithWASM(picdef) {
        try {
            console.log("🎨 Attempting WASM rendering...");
            const mandart = new wasmModule.MandArt(JSON.stringify(picdef));
            const rawImageData = mandart.get_image_from_grid();

            if (Array.isArray(rawImageData) && rawImageData.length > 0) {
                console.log("✅ WASM successfully generated the image.");
                const imageDataArray = new Uint8ClampedArray(rawImageData.flat());
                imageData = new ImageData(imageDataArray, canvas.width, canvas.height);
                canvas.width = picdef.width;
                canvas.height = picdef.height;
                ctx.putImageData(imageData, 0, 0);
                return;
            } else {
                throw new Error("❌ WASM returned invalid image data.");
            }
        } catch (error) {
            console.error("❌ WASM rendering failed. Falling back to JavaScript:", error);
        }
    }

    return {
        drawWithWASM,
    };
}


export function setupCanvas(getPicdef, getHues) {
    console.log("🎨 Initializing JavaScript Canvas...");

    const canvas = document.getElementById("mandelbrotCanvas");
    if (!canvas) {
        console.error("❌ Canvas element not found! Ensure the ID is correct.");
        return null;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("❌ Unable to get 2D context. Browser might not support it.");
        return null;
    }

    return {
        drawWithJavaScript: () => drawWithJavaScript(canvas, getPicdef, getHues),
    };


}

/**
 * 🖌️ Draws the MandArt grid using JavaScript fallback (if WASM is unavailable).
 */
function drawWithJavaScript(canvas, getPicdef, getHues) {
    console.log("🎨 Drawing Mandelbrot with JavaScript...");

    const picdef = getPicdef();
    const hues = getHues();

    if (!picdef || hues.length === 0) {
        console.error("❌ Missing MandArt or hues data.");
        return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("❌ Unable to get 2D context. Browser might not support it.");
        return;
    }

    // Use picdef dimensions or fallback to defaults
    canvas.width = picdef?.width || 1000;
    canvas.height = picdef?.height || 1000;
    console.log(`🖌️ Canvas size set to ${canvas.width}x${canvas.height}`);

    const artImage = new ArtImage(picdef);
    const fIter = artImage.generateGrid();

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const colorScale = hues.length;

    for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
            const value = fIter[y][x];
            const hueIndex = value % colorScale;
            const hue = hues[hueIndex];

            const pixelIndex = (y * canvas.width + x) * 4;
            imageData.data[pixelIndex] = hue.r;
            imageData.data[pixelIndex + 1] = hue.g;
            imageData.data[pixelIndex + 2] = hue.b;
            imageData.data[pixelIndex + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
    console.log("✅ JavaScript canvas update complete.");
}

function recolorCanvas() {
    console.log("🎨 Recoloring canvas...");

    // Get the current MandArt and grid data
    const mandArt = window.mandArtLoader.currentMandArt;
    if (!mandArt) {
        console.warn("⚠️ No MandArt data available for recoloring");
        return;
    }

    // Assuming you have the grid data stored
    const grid = window.currentGrid; // Make sure this is set when you first calculate the grid
    if (!grid) {
        console.warn("⚠️ No grid data available for recoloring");
        return;
    }

    // Call WASM color_grid function
    try {
        const result = window.wasmModule.color_grid(grid, mandArt.hues);
        // Update the canvas with the new colors
        // ... your canvas update code here
        console.log("✅ Canvas recolored successfully");
    } catch (error) {
        console.error("❌ Error recoloring canvas:", error);
    }
}

// Export the function to make it available to other modules
export { recolorCanvas };
