// Export for MandArtProcessor.js (renamed from duplicate GridProcessor.js)
// src/core/MandArtProcessor.js
import gridCalculator from "./GridCalculator.js";
import { processGridColors } from "./ColorProcessor.js";

/**
 * Processes and renders a MandArt from picdef.
 * @param {HTMLCanvasElement} canvas - The canvas element.
 * @param {Object} picdef - The MandArt picdef object.
 * @param {Array} hues - Array of hues.
 * @param {boolean} fastCalc - If true, skips WASM & uses simple placeholders.
 */
export async function processMandArt(canvas, picdef, hues, fastCalc = false) {
    console.log("📂 Processing MandArt...");

    if (!canvas || !picdef || !hues) {
        console.error("❌ Missing required inputs!");
        return;
    }
    
    gridCalculator.setFastCalc(fastCalc);
    const grid = await gridCalculator.compute(picdef);
    const coloredGrid = await processGridColors(grid, hues, fastCalc);
    renderCanvas(canvas, coloredGrid);
}

/**
 * Draws the colored Mandelbrot grid onto the canvas.
 * @param {HTMLCanvasElement} canvas - The canvas element.
 * @param {Array} coloredGrid - The colored grid (2D array).
 */
export function renderCanvas(canvas, coloredGrid) {
    console.log("🖌 Rendering Mandelbrot on canvas...");

    if (!canvas || !coloredGrid || !coloredGrid.length || !coloredGrid[0].length) {
        console.error("❌ Missing canvas or colored grid!");
        return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("❌ Unable to get 2D context!");
        return;
    }

    const width = coloredGrid[0].length;
    const height = coloredGrid.length;

    canvas.width = width;
    canvas.height = height;

    const imageData = ctx.createImageData(width, height);
    let pixelIndex = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const { r, g, b } = coloredGrid[y][x];
            imageData.data[pixelIndex++] = r;
            imageData.data[pixelIndex++] = g;
            imageData.data[pixelIndex++] = b;
            imageData.data[pixelIndex++] = 255; // Alpha (opacity)
        }
    }

    ctx.putImageData(imageData, 0, 0);
    console.log("✅ Canvas rendering complete.");
}