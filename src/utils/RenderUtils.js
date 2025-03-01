export function renderMandelbrot(canvas, hues, fIter) {
    console.log("🎨 Rendering Mandelbrot...");
    console.log("📊 Grid data preview:", grid.slice(0, 5)); // Only log first 5 rows

    if (!Array.isArray(grid) || !grid.length) {
        console.error("❌ Invalid grid data.");
        return;
    }
    if (!canvas || !hues?.length) {
        console.error("❌ Invalid canvas or hues data.");
        return;
    }

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const hue = hues[fIter[y][x] % hues.length];

            data[index] = hue.r;
            data[index + 1] = hue.g;
            data[index + 2] = hue.b;
            data[index + 3] = 255;
        }
    }

    ctx.putImageData(imgData, 0, 0);
    console.log("✅ Mandelbrot rendering completed!");
}
