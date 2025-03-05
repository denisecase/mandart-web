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
