// canvas.js

const canvas = document.getElementById("mandelbrotCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;
let imageData;

function drawMandelbrot() {
    console.log("Drawing Mandelbrot with hues:", hues);

    imageData = ctx.createImageData(canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const hueIndex = (i / 4) % hues.length;
        const hue = hues[hueIndex];

        imageData.data[i] = hue.r;
        imageData.data[i + 1] = hue.g;
        imageData.data[i + 2] = hue.b;
        imageData.data[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
}

/**
 * Recolors the canvas when hues change.
 */
function recolorCanvas() {
    if (!imageData) return;

    for (let i = 0; i < imageData.data.length; i += 4) {
        const hueIndex = (i / 4) % hues.length;
        const hue = hues[hueIndex];

        imageData.data[i] = hue.r;
        imageData.data[i + 1] = hue.g;
        imageData.data[i + 2] = hue.b;
    }

    ctx.putImageData(imageData, 0, 0);
}
