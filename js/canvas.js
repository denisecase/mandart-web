// canvas.js

const canvas = document.getElementById("mandelbrotCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 1000; // Matching Default.csv size
canvas.height = 1000; // Matching Default.csv size
let gridData = [];

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

  // ✅ TRY WASM FIRST - Only use strPath within this block
  if (window.wasmModule) {
    const wasmFunc1 = window.wasmModule.api_get_image_from_mandart_file_js;
    const wasmFunc2 =
      window.wasmModule.api_get_image_from_mandart_json_string_js;

    if (typeof wasmFunc1 === "function" && typeof wasmFunc2 === "function") {
      try {
        console.log("🎨 Trying WASM to generate MandArt image...");

        const wasmFilePath =
          strPath || "../assets/MandArt_Catalog/Default.mandart";
        console.log("📝 WASM Loading MandArt file:", wasmFilePath);

        if (!wasmFunc1) {
          throw new Error(
            "WASM function `api_get_image_from_mandart_file_js` is not available."
          );
        }
        console.log("📝 WASM function1 exists:", wasmFunc1);
        if (!wasmFunc2) {
          throw new Error(
            "WASM function `api_get_image_from_mandart_json_string_js` is not available."
          );
        }
        console.log("📝 WASM function2 exists:", wasmFunc2);

        // ✅ Call WASM function - Option 1 (File)
        let rawImageData1 = null;
        try {
          console.log("🎨 Calling WASM function1...");
          rawImageData1 = window.wasmModule.api_get_image_from_mandart_file_js(wasmFilePath);
          console.log("🎨 WASM File Generated Image:", rawImageData1);
        } catch (error) {
          console.warn("⚠️ WASM File function failed:", error);
        }

        // ✅ Call WASM function - Option 2 (JSON)
        let rawImageData2 = null;
        try {
          console.log("🎨 Calling WASM function2...");
          rawImageData2 = wasmFunc2(jsonData);
          console.log("🎨 WASM JSON Generated Image:", rawImageData2);
        } catch (error) {
          console.warn("⚠️ WASM JSON function failed:", error);
        }
        // Pick the first valid response
        const rawImageData = rawImageData1 || rawImageData2;
        console.log("🎨 WASM outputs", rawImageData1);

        if (Array.isArray(rawImageData) && rawImageData.length > 0) {
          console.log("✅ WASM successfully generated the image!");

          // Convert WASM output to an ImageData object
          const mandartImage = new MandArtImageData(
            canvas.width,
            canvas.height,
            rawImageData
          );
          const imageDataArray = new Uint8ClampedArray(
            mandartImage.data.flat()
          );
          const imageData = new ImageData(
            imageDataArray,
            mandartImage.width,
            mandartImage.height
          );

          ctx.putImageData(imageData, 0, 0);
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
