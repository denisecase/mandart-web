import { safeWasmCall } from "../utils/WasmUtils.js";
import { loadPrecomputedGrid } from "../utils/GridUtils.js";

/**
 * ✅ Uses WASM for optimized rendering (if available).
 */
export function setupCanvasWithWasm() {
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
            const mandart = safeWasmCall("MandArt", JSON.stringify(picdef));
            if (!mandart) {
                console.error("❌ Failed to create MandArt instance via WASM.");
                return;
            }

            const rawImageData = safeWasmCall("api_get_image_from_grid");
            if (!Array.isArray(rawImageData) || rawImageData.length === 0) {
                throw new Error("❌ WASM returned invalid image data.");
            }

            console.log("✅ WASM successfully generated the image!");
            const imageDataArray = new Uint8ClampedArray(rawImageData.flat());
            imageData = new ImageData(imageDataArray, canvas.width, canvas.height);
            ctx.putImageData(imageData, 0, 0);
        } catch (error) {
            console.error("❌ WASM rendering failed. Falling back to JavaScript:", error);
        }
    }

    return {
        drawWithWASM,
    };
}

/**
 * Fallback JavaScript rendering for when WASM is unavailable.
 */
export function setupCanvas(getPicdef, getGrid, getHues) {
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

    function drawWithJavaScript() {
        const picdef = getPicdef();
        const grid = getGrid();
        const hues = getHues();

        if (!grid || hues.length === 0) {
            console.error("❌ Missing MandArt or hues data.");
            return;
        }

        // Set canvas size based on picdef or grid size
        canvas.width = picdef?.width || grid[0]?.length || 100;
        canvas.height = picdef?.height || grid.length || 100;

        console.log(`🖌️ Drawing grid on canvas (${canvas.width}x${canvas.height}) using JavaScript...`);

        const imageData = ctx.createImageData(canvas.width, canvas.height);

        // Fallback: Use first hue if no proper coloring is available
        const defaultHue = hues.find(hue => hue.num === 1) || { r: 0, g: 0, b: 0 };

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                let hue = grid[y] && grid[y][x] ? hues[grid[y][x] % hues.length] : defaultHue;
                if (!hue) hue = defaultHue; // Ensure there's always a color
                
                const pixelIndex = (y * canvas.width + x) * 4;
                imageData.data[pixelIndex] = hue.r;
                imageData.data[pixelIndex + 1] = hue.g;
                imageData.data[pixelIndex + 2] = hue.b;
                imageData.data[pixelIndex + 3] = 255; // Full opacity
            }
        }

        ctx.putImageData(imageData, 0, 0);
        console.log("✅ Canvas updated.");
    }

    return {
        drawWithJavaScript,
    };
}


/**
 * Recolors the existing grid using WASM.
 */
function recolorCanvas() {
    console.log("🎨 Recoloring canvas...");

    const mandArt = window.mandArtLoader?.currentMandArt;
    if (!mandArt) {
        console.warn("⚠️ No MandArt data available for recoloring");
        return;
    }

    const grid = window.currentGrid;
    if (!grid) {
        console.warn("⚠️ No grid data available for recoloring");
        return;
    }

    try {
        const coloredGrid = safeWasmCall("api_color_grid_js", grid, mandArt.hues);
        if (!coloredGrid) {
            throw new Error("❌ WASM failed to recolor grid.");
        }
        
        // TODO: Apply the coloredGrid to update the canvas image data
        console.log("✅ Canvas recolored successfully");
    } catch (error) {
        console.error("❌ Error recoloring canvas:", error);
    }
}

export { recolorCanvas };
