// canvas.js

const canvas = document.getElementById("mandelbrotCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 1000; // Matching Default.csv size
canvas.height = 1000; // Matching Default.csv size
let gridData = [];

// ✅ Ensure MandArtImageData is globally available
if (typeof window.MandArtImageData === "undefined") {
  class MandArtImageData {
    constructor(width, height, data) {
      this.width = width;
      this.height = height;
      this.data = data;
    }
  }

  window.MandArtImageData = MandArtImageData; // ✅ Global reference
}

function drawMandelbrotLater() {
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
function recolorCanvasOld() {
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

/**
 * 📌 Load precomputed grid from Default.csv
 */
async function loadPrecomputedGrid(filePath) {
  try {
    console.log(`Loading Precomputed Grid: ${filePath}`);

    const response = await fetch(filePath);

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Precomputed grid file not found: ${filePath}`);
        return; // Let the caller handle the placeholder
      }
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const csvText = await response.text();
    parseCSVGrid(csvText);
  } catch (error) {
    console.error("Failed to load grid:", error);
  }
}

/**
 * 📌 Parse CSV into a 2D array
 */
function parseCSVGrid(csvText) {
  gridData = csvText
    .trim()
    .split("\n")
    .map((row) => row.split(",").map(Number));

  console.log("Parsed Grid Data:", gridData);
  drawPrecomputedGrid();
}

/**
 * 📌 Draw the Precomputed Grid onto Canvas
 */
function drawPrecomputedGrid() {
  if (!gridData.length) {
    console.warn("Grid data is empty.");
    return;
  }

  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const colorScale = hues.length; // Match hue count

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const value = gridData[y][x]; // Grid value
      const hueIndex = Math.floor(value % colorScale); // Map to hues
      const hue = hues[hueIndex];

      const pixelIndex = (y * canvas.width + x) * 4;
      imageData.data[pixelIndex] = hue.r;
      imageData.data[pixelIndex + 1] = hue.g;
      imageData.data[pixelIndex + 2] = hue.b;
      imageData.data[pixelIndex + 3] = 255; // Full opacity
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * 📌 Recolor Canvas Based on New Hues
 */
function recolorCanvas() {
  drawPrecomputedGrid(); // Just redraw with updated hues
}

// Load the Default.csv when page loads
loadPrecomputedGrid();

function drawArtSizedCanvasFromGrid(strPath, jsonData) {
  console.log("Drawing Canvas...");

  // Get the canvas
  const canvas = document.getElementById("mandelbrotCanvas");
  const ctx = canvas.getContext("2d");

  // ✅ TRY WASM FIRST
  if (window.wasmModule) {
      const f1 = window.wasmModule.api_get_image_from_mandart_file_js;
      const f2 = window.wasmModule.api_get_image_from_mandart_json_string_js;

      if (typeof f1 === "function" && typeof f2 === "function") {
          try {
              console.log("🎨 Trying WASM to generate MandArt image...");
              const fp = strPath || "../assets/MandArt_Catalog/Default.mandart";
              console.log("📝 WASM Loading MandArt file:", fp);

              // ✅ Call WASM function
              let rawImageData = f1(fp) || f2(jsonData);
              console.log("🎨 WASM outputs:", rawImageData);

              if (!Array.isArray(rawImageData) || rawImageData.length === 0 || !Array.isArray(rawImageData[0])) {
                  throw new Error("❌ WASM output is not a valid 2D array.");
              }

              // ✅ Extract dimensions from 2D array
              const width = rawImageData.length;  // Columns
              const height = rawImageData[0].length; // Rows

              console.log(`✅ Processing image with width=${width}, height=${height}`);

              // ✅ Convert 2D Column-Major RGB array → 1D Uint8ClampedArray (RGBA)
              const imageDataArray = new Uint8ClampedArray(width * height * 4);

              let index = 0;
              for (let y = 0; y < height; y++) {  // ✅ Iterate rows first
                  for (let x = 0; x < width; x++) {  // ✅ Then columns
                      const [r, g, b] = rawImageData[x][y];  // ✅ Access column-first
                      imageDataArray[index++] = r * 255; // Red
                      imageDataArray[index++] = g * 255; // Green
                      imageDataArray[index++] = b * 255; // Blue
                      imageDataArray[index++] = 255;     // Alpha (fully opaque)
                  }
              }

              // ✅ Create ImageData and draw to canvas
              const imageData = new ImageData(imageDataArray, width, height);
              ctx.putImageData(imageData, 0, 0);
              console.log("✅ Successfully rendered image from WASM!");

              return; // ✅ EXIT if WASM works
          } catch (error) {
              console.error("❌ WASM failed. Falling back to JavaScript:", error);
          }
      } else {
          console.warn("⚠️ WASM functions missing.");
      }
  } else {
      console.warn("⚠️ WASM module not loaded. Using JavaScript fallback.");
  }

  // ✅ If WASM fails, fall back to a placeholder fill
  ctx.fillStyle = "rgb(100, 100, 100)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  console.log("⚠️ Fallback: Canvas filled with grey.");
}