//components/Canvas.js

import { ArtImage } from "../utils/ArtUtils.js";
import { loadPrecomputedGrid } from "../utils/GridUtils.js";



export function setupCanvas(getPicdef, getHues) {
    const canvas = document.getElementById("mandelbrotCanvas");
    if (!canvas) {
        console.error("❌ Canvas element not found! Ensure the ID is correct.");
        return null; // Prevent further errors
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("❌ Unable to get 2D context. Browser might not support it.");
        return null;
    }

    canvas.width = 1000; // Matching Default.csv size
    canvas.height = 1000; // Matching Default.csv size
    let gridData = [];
    let imageData = null;

    function draw() {
        const picdef = getPicdef();
        const hues = getHues();

        if (!picdef || hues.length === 0) {
            console.error("❌ Missing MandArt or hues data.");
            return;
        }

        if (window.wasmModule) {
            drawWithWASM(picdef);
        } else {
            console.warn("⚠️ WASM module not loaded. Using JavaScript fallback.");
            drawWithJavaScript(picdef, hues);
        }
    }

    function drawWithWASM(picdef) {
        if (!window.wasmModule) {
            console.warn("⚠️ WASM module is not yet available.");
            return;
        }

        try {
            console.log("🎨 Attempting WASM rendering...");
            const mandart = new window.wasmModule.MandArt(JSON.stringify(picdef));
            const rawImageData = mandart.get_image_from_grid();

            if (Array.isArray(rawImageData) && rawImageData.length > 0) {
                console.log("✅ WASM successfully generated the image!");

                const expectedLength = canvas.width * canvas.height * 4;
                if (rawImageData.length !== expectedLength) {
                    throw new Error(
                        `❌ Invalid ImageData length: Expected ${expectedLength}, got ${rawImageData.length}`
                    );
                }

                const imageDataArray = new Uint8ClampedArray(rawImageData.flat());
                imageData = new ImageData(imageDataArray, canvas.width, canvas.height);
                ctx.putImageData(imageData, 0, 0);
                return;
            } else {
                throw new Error("❌ WASM returned invalid image data.");
            }
        } catch (error) {
            console.error("❌ WASM failed. Falling back to JavaScript:", error);
            drawWithJavaScript(picdef, getHues());
        }
    }

    function drawWithJavaScript(picdef, hues) {
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

   

    function drawPrecomputedGrid() {
        if (!gridData.length) {
            console.warn("⚠️ Grid data is empty.");
            return;
        }

        const hues = getHues();
        imageData = ctx.createImageData(canvas.width, canvas.height);
        const colorScale = hues.length;

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const value = gridData[y][x];
                const hueIndex = Math.floor(value % colorScale);
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

    function recolorCanvas() {
        if (!imageData) {
            console.warn("⚠️ No existing image data to recolor.");
            return;
        }

        const hues = getHues();
        for (let i = 0; i < imageData.data.length; i += 4) {
            const hueIndex = (i / 4) % hues.length;
            const hue = hues[hueIndex];

            imageData.data[i] = hue.r;
            imageData.data[i + 1] = hue.g;
            imageData.data[i + 2] = hue.b;
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function drawArtSizedCanvasFromGrid(strPath, jsonData) {
        console.log("🖌️ Drawing Canvas...");

        if (window.wasmModule) {
            try {
                console.log("🎨 Using WASM to generate MandArt image...");
                const mandart = new window.wasmModule.MandArt(JSON.stringify(jsonData));
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
                console.error("❌ WASM failed. Using JavaScript fallback:", error);
            }
        }

        drawWithJavaScript(jsonData, getHues());
    }

    return {
        draw,
        loadPrecomputedGrid,
        recolorCanvas,
        drawArtSizedCanvasFromGrid
    };
}
