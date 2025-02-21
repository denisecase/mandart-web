import { ArtImage } from "../utils/ArtUtils.js";
import { loadPrecomputedGrid } from "../utils/GridUtils.js";

/**
 * ✅ Uses WASM for optimized rendering (if available).
 */
export function setupCanvasWithWasm(wasmModule) {
    console.log("🎨 Initializing WASM Canvas...");
    
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

    canvas.width = 1000;
    canvas.height = 1000;
    let imageData = null;

    function drawWithWASM(picdef) {
        try {
            console.log("🎨 Attempting WASM rendering...");
            const mandart = new wasmModule.MandArt(JSON.stringify(picdef));
            const rawImageData = mandart.get_image_from_grid();

            if (Array.isArray(rawImageData) && rawImageData.length > 0) {
                console.log("✅ WASM successfully generated the image!");
                const imageDataArray = new Uint8ClampedArray(rawImageData.flat());
                imageData = new ImageData(imageDataArray, canvas.width, canvas.height);
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

/**
 * ✅ JavaScript Fallback (if WASM is unavailable).
 */
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

    canvas.width = 1000;
    canvas.height = 1000;
    let imageData = null;

    function drawWithJavaScript() {
        const picdef = getPicdef();
        const hues = getHues();

        if (!picdef || hues.length === 0) {
            console.error("❌ Missing MandArt or hues data.");
            return;
        }

        console.log("🖌️ Drawing Mandelbrot with JavaScript...");
        const artImage = new ArtImage(picdef);
        const fIter = artImage.generateGrid();

        imageData = ctx.createImageData(canvas.width, canvas.height);
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
    }

    return {
        drawWithJavaScript,
    };
}
