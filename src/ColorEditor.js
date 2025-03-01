import ColorEditorRow from "./ColorEditorRow.js";
import { hueList, wasmModule, canvasContainer, addColorBtn, mandColorPicker } from "./globals.js";
import { rgbToHex, hexToRgb } from "./utils/color_editor_utils.js";
import Hue from "./models/Hue.js";
import ShapeInputs from "./models/ShapeInputs.js";
import ColorInputs from "./models/ColorInputs.js";
import { createShapeInputs, getShapeInputsForWasm } from "./controllers/shape_controller.js";
import { createColorInputs, updateColorInputs, getColorInputsForWasm } from "./controllers/color_controller.js";

let currentHues = [];
let selectedFile = null;
let currentShapeInputs = null;
let currentColorInputs = null;

addColorBtn.addEventListener("click", addNewColor);

mandColorPicker.addEventListener("input", (event) => {
  const newHex = event.target.value;
  const { r, g, b } = hexToRgb(newHex); // Convert HEX to RGB
  currentColorInputs.mand_color = [r, g, b];
  redrawCanvas();
});


export async function populateColorEditor(fileObj) {
  try {
    console.log(`Extracting colors from: ${fileObj.name}`);
    const fileURL = fileObj.mandart_url;
    const response = await fetch(fileURL);
    if (!response.ok) throw new Error(`Failed to fetch ${fileObj.name}`);
    const content = await response.json();
    console.log("🔥 [DEBUG] Raw hues from file before processing:", content.hues);

    currentShapeInputs = createShapeInputs(content);
    console.log("📐 Stored Shape Inputs:", currentShapeInputs);
    const huesArray = Array.isArray(content.hues) ? content.hues.map(hue => ({
      num: hue.num || 1,  // Ensure `num` exists
      r: hue.r || 0,      // Default to black if missing
      g: hue.g || 0,
      b: hue.b || 0
    })) : [];
    console.log("🔥 ColorEditor.populateColorEditor DEBUG: Raw hues from file", content.hues);
    if (!Array.isArray(content.hues) || content.hues.length === 0) {
      console.error("🚨 No hues found in input file!");
    }
    currentHues = huesArray.map(hue => new Hue(hue));

    currentColorInputs = createColorInputs({
      nBlocks: content.nBlocks || 10,
      huesLength: currentHues.length,
      spacingColorFar: content.spacingColorFar || 1.0,
      spacingColorNear: content.spacingColorNear || 0.1,
      yY: content.yY || 0,
      mandColor: content.mandColor || { r: 0, g: 0, b: 0 },
      hues: currentHues,
    });
    console.log("🎨 Stored Color Inputs:", currentColorInputs);
    hueList.innerHTML = "";
    console.log("🔍 DEBUG: currentColorInputs.hues", currentColorInputs.hues);

    currentColorInputs.hues.forEach((color, index) => {
      const row = new ColorEditorRow(index, color, updateColor, deleteColor);
      hueList.appendChild(row.element);
    });
    redrawCanvas();
  } catch (error) {
    console.error(`🚨 Error extracting colors from ${fileObj.name}:`, error);
  }
}


export function redrawCanvas() {
  console.log("🔄 Attempting to redraw canvas...");
  if (!currentShapeInputs || !currentColorInputs) {
    console.error("🚨 Missing required shape or color inputs! Cannot redraw.");
    return;
  }
  try {
    const canvas = document.querySelector("#canvasContainer canvas");
    if (!canvas) {
      console.error("🚨 Canvas element not found in DOM! Make sure it exists inside #canvasContainer.");
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("🚨 Unable to get 2D context for canvas!");
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log("🧹 Clearing WASM grid cache before generating image...");
    wasmModule.api_clear_grid_cache();

    const shapeData = getShapeInputsForWasm(currentShapeInputs);
    const colorData = getColorInputsForWasm(currentColorInputs);
    console.log("📐 Sending Shape Inputs:", shapeData);
    console.log("🎨 Sending Color Inputs:", colorData);
    const imageData = wasmModule.api_get_image_from_inputs(shapeData, colorData);

    if (!imageData || !imageData.data) {
      console.error("🚨 Invalid image data generated");
      return;
    }

    // ✅ Convert `imageData` to ImageData for canvas
    const imgData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );

    // ✅ Ensure the canvas matches the image size
    canvas.width = imageData.width;
    canvas.height = imageData.height;

    // ✅ Draw image onto canvas
    ctx.putImageData(imgData, 0, 0);

    console.log("✅ Canvas updated successfully!");
  } catch (error) {
    console.error("🚨 Error generating image:", error);
  }
}


export function updateColor(index, newColor) {
  console.log(`🖍️ColorEditor.updateColor() DEBUG: Updating color at index ${index}:`, newColor);
  if (typeof newColor !== "string") {
    newColor = rgbToHex(newColor.r, newColor.g, newColor.b);
  }
  console.log(`🎨 Updating color #${index} to ${newColor}`);
  const { r, g, b } = hexToRgb(newColor);
  // Update the hue at the given index
  currentHues[index] = new Hue({ num: index + 1, r, g, b });

  // Ensure `currentColorInputs.hues` is updated with `[num, r, g, b]`
  currentColorInputs.hues = currentHues.map(hue => hue.to_wasm());
  console.log("✅ Updated ColorInputs:", currentColorInputs);

  hueList.innerHTML = "";
  currentHues.forEach((color, i) => {
    const row = new ColorEditorRow(i, color, updateColor, deleteColor);
    hueList.appendChild(row.element);
  });
  redrawCanvas();
}


export function addNewColor() {
  console.log("🆕 ColorEditor.addNewColor() Adding new color...");
  console.log("🆕 ColorEditor.addNewColor() count of hues", currentHues.length);

  const newColor = new Hue({
    num: currentHues.length + 1,
    r: 0,
    g: 0,
    b: 0,
  });
  console.log("🆕 ColorEditor.addNewColor() Adding new color:", newColor);
  currentHues.push(newColor);
  console.log("🆕 ColorEditor.addNewColor() Updated hues after add:", currentHues.length);
  currentColorInputs = updateColorInputs(currentHues, currentColorInputs);
}


export function deleteColor(index) {
  if (index < 0 || index >= currentHues.length) {
    console.error(`🚨 Invalid color index: ${index}`);
    return;
  }

  console.log(`🗑️ Deleting color #${index}`);

  // ✅ Remove color at index
  currentHues.splice(index, 1);

  // ✅ Re-index hues so numbering stays sequential
  currentHues = currentHues.map((color, i) => new Hue({
    id: color.id,
    num: i + 1, // 🔥 Fix the numbering so it remains correct
    r: color.r,
    g: color.g,
    b: color.b
  }));

  // ✅ Ensure `currentColorInputs.hues` gets updated correctly
  currentColorInputs = updateColorInputs(currentHues, currentColorInputs);

  console.log("🎨 Updated Color Inputs after delete:", currentColorInputs);

  // ✅ Re-render UI
  hueList.innerHTML = "";
  currentHues.forEach((color, i) => {
    const row = new ColorEditorRow(i, color, updateColor, deleteColor);
    hueList.appendChild(row.element);
  });

  // ✅ Redraw the canvas with the new colors
  redrawCanvas();
}

