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
//loadPrecomputedGrid();

function drawArtSizedCanvasFromGrid(strPath, jsonData) {
  console.log("Drawing Canvas...");

  // Get the canvas
  const canvas = document.getElementById("mandelbrotCanvas");
  const ctx = canvas.getContext("2d");

  // ✅ TRY WASM FIRST - Only use strPath within this block
  if (window.wasmModule) {
    const f1 = window.wasmModule.api_get_image_from_mandart_file_js;
    const f2 = window.wasmModule.api_get_image_from_mandart_json_string_js;

    if (typeof f1 === "function" && typeof f2 === "function") {
      try {
        console.log("🎨 Trying WASM to generate MandArt image...");

        const fp = strPath || "../assets/MandArt_Catalog/Default.mandart";
        console.log("📝 WASM Loading MandArt file:", fp);

        if (!f1) {
          throw new Error(
            "WASM f1 `api_get_image_from_mandart_file_js` is not available."
          );
        }
        console.log("📝 WASM f1 exists:", f1);

        if (!f2) {
          throw new Error(
            "WASM function `api_get_image_from_mandart_json_string_js` is not available."
          );
        }
        console.log("📝 WASM f2 exists:", f2);

        let r1 = null;
        try {
          console.log("🎨 Calling WASM f1...");
          r1 = f1(fp);
          console.log("🎨 WASM f1 Generated Image:", r1);
        } catch (error) {
          console.warn("⚠️ WASM f1 function  failed:", error);
        }

        let r2 = null;
        try {
          console.log("🎨 Calling WASM r2...");
          r2 = f2(jsonData);
          console.log("🎨 WASM f2 Generated Image:", r2);
        } catch (error) {
          console.warn("⚠️ WASM f2 function  failed:", error);
        }

        // Pick the first valid response
        const rawImageData = r1 || r2;

        console.log("🎨 Debug: rawImageData Length:", rawImageData.length);
        console.log("🎨 Debug: First 10 values:", rawImageData.slice(0, 10));
        
        console.log("🎨 WASM outputs", rawImageData);

        if (Array.isArray(rawImageData) && rawImageData.length > 0) {
          console.log("✅ WASM successfully generated the image!");

          // ✅ Validate Length Before Creating ImageData
          const expectedLength = canvas.width * canvas.height * 4;
          if (rawImageData.length !== expectedLength) {
            throw new Error(
              `❌ Invalid ImageData length: Expected ${expectedLength}, got ${rawImageData.length}`
            );
          }
          // Convert WASM output to an ImageData object
           // Convert WASM output to an ImageData object
           const mandartImage = new MandArtImageData(
            canvas.width,
            canvas.height,
            rawImageData
          );
          const imageDataArray = new Uint8ClampedArray(mandartImage.data.flat());
          const imageData = new ImageData(
            imageDataArray,
            mandartImage.width,
            mandartImage.height
          );

          ctx.putImageData(imageData, 0, 0);;
          return; // ✅ EXIT if WASM works
        } else {
          throw new Error("WASM returned invalid image data.");
        }
      } catch (error) {
        console.error("❌ WASM failed. Falling back to JavaScript:", error);
      }
    } else {
      console.warn(
        "⚠️ WASM function `api_get_image_from_mandart_file_js` is missing."
      );
    }
  } else {
    console.warn("⚠️ WASM module not loaded. Using JavaScript fallback.");
  }

  // OTHERWISE CONTINUE

  // Ensure hues exist
  if (!hues || hues.length === 0) {
    console.warn("No hues available. Cannot draw placeholder.");
    return;
  }

  // Find the hue where num = 1
  let primaryHue = hues.find((h) => h.num === 1);

  // Fallback: If not found, use the first hue
  if (!primaryHue) {
    console.warn("Hue with num=1 not found. Using first available hue.");
    primaryHue = hues[0];
  }
  if (!primaryHue) {
    console.error("No hues available. Using grey.");
    primaryHue = { r: 128, g: 128, b: 128 };
  }
  const fillColor = `rgb(${primaryHue.r}, ${primaryHue.g}, ${primaryHue.b})`;
  console.log("Using Primary Hue:", primaryHue);

  // Fill the entire canvas with this color
  ctx.fillStyle = fillColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  console.log(`Canvas filled with color: ${fillColor}`);
}
