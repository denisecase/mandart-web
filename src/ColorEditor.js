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
  console.log(`🎨 Updating mand_color to [${r}, ${g}, ${b}]`);
  currentColorInputs.mand_color = [r, g, b];
  redrawCanvas();
});


export async function populateColorEditor(fileObj) {
  if (!fileObj || !fileObj.mandart_url) {
    console.error("🚨 Invalid file object or missing URL");
    return;
  }

  let content = null; 
  try {
    console.log(`Extracting colors from: ${fileObj.name}`);
    const fileURL = fileObj.mandart_url;
    const response = await fetch(fileURL);
    if (!response.ok) throw new Error(`Failed to fetch ${fileObj.name}`);
    
    // Fix: Remove the 'const' declaration to use the outer scope variable
    content = await response.json();
    
    // Basic validation of the content
    if (!content || typeof content !== 'object') {
      throw new Error("Invalid JSON content received");
    }
    
    console.log("🔥 [DEBUG] Raw content:", content);
    console.log("🔥 [DEBUG] Raw hues:", content.hues);

    // Create shape inputs with validation
    try {
      currentShapeInputs = createShapeInputs(content);
      console.log("📐 Stored Shape Inputs:", currentShapeInputs);
    } catch (shapeError) {
      console.error("🚨 Error creating shape inputs:", shapeError);
      // Continue with other parts if possible
    }

    // Process hues with careful validation
    const huesArray = Array.isArray(content.hues)
      ? content.hues.map(hue => ({
        num: hue?.num || 1, // Ensure `num` exists and handle null/undefined hue
        r: hue?.r || 0,
        g: hue?.g || 0,
        b: hue?.b || 0,
      }))
      : [];

    console.log("🔥 Processed hues array:", huesArray);

    if (huesArray.length === 0) {
      console.warn("⚠️ No hues found in input file, using default values");
      // Add at least one default hue to prevent errors
      huesArray.push({ num: 1, r: 0, g: 0, b: 0 });
    }

    // Convert to Hue objects
    currentHues = huesArray.map(hue => new Hue(hue));
    console.log("🔥 Created Hue objects:", currentHues);

  } catch (error) {
    console.error(`🚨 Error extracting colors from ${fileObj.name}:`, error);
    // Set up minimal valid content to continue
    content = { 
      nBlocks: 10,
      spacingColorFar: 1.0,
      spacingColorNear: 0.1,
      yY: 0,
      colors: []
    };
    // Create a default hue to avoid empty arrays
    currentHues = [new Hue({ num: 1, r: 0, g: 0, b: 0 })];
  }

  // Process mandColor with fallback values
  let mandColorFixed = [0, 0, 0]; // Default black
  try {
    // Safe function to ensure mandColor is always valid
    const safeMandColor = (input) => {
      if (Array.isArray(input) && input.length === 3) {
        return input.map(val => Number(val) || 0); // Convert to number, default to 0 if NaN
      }
      if (typeof input === "object" && input !== null && "r" in input && "g" in input && "b" in input) {
        return [Number(input.r) || 0, Number(input.g) || 0, Number(input.b) || 0]; 
      }
      return [0, 0, 0]; // Default to black
    };

    console.log("mandColor input:", content?.mandColor);
    mandColorFixed = safeMandColor(content?.mandColor);
    console.log("safeMandColor result:", mandColorFixed);
  }
  catch (error) {
    console.error("🚨 Error processing mandColor:", error);
    // Continue with default black
  }

  try {
    // Ensure we have valid inputs for createColorInputs
    const safeContent = content || {};
    const validHues = currentHues || [new Hue({ num: 1, r: 0, g: 0, b: 0 })];
    
    // Create a complete and valid parameters object
    const colorParams = {
      nBlocks: safeContent.nBlocks || 10,
      // REMOVED: huesLength - this was causing parameter mismatch
      spacingColorFar: safeContent.spacingColorFar || 1.0,
      spacingColorNear: safeContent.spacingColorNear || 0.1,
      yY: safeContent.yY || 0,
      mandColor: mandColorFixed,
      hues: validHues
    };
    
    console.log("🎨 Creating ColorInputs with:", colorParams);
    
    // Create a wrapper that catches errors
    try {
      currentColorInputs = createColorInputs(colorParams);
      console.log("✅ Successfully created ColorInputs");
    } catch (createError) {
      console.error("🚨 Error in createColorInputs:", createError);
      // Try a more minimal approach if the first attempt fails
      try {
        // Minimal fallback approach
        currentColorInputs = {
          hues: validHues,
          colors: [],
          mand_color: mandColorFixed,
          updateColors: () => console.log("Using fallback updateColors")
        };
        console.log("⚠️ Using fallback ColorInputs object");
      } catch (fallbackError) {
        console.error("💥 Even fallback approach failed:", fallbackError);
      }
    }

    // Clear and rebuild the color editor UI
    try {
      // Clear the hue list
      if (hueList) {
        hueList.innerHTML = "";
      } else {
        console.warn("⚠️ hueList element not found");
      }

      console.log("🔍 currentColorInputs:", currentColorInputs);
      
      // Handle rendering the color editor rows
      if (currentColorInputs && Array.isArray(currentColorInputs.hues)) {
        console.log("🔍 Rendering color rows for hues:", currentColorInputs.hues);
        
        currentColorInputs.hues.forEach((color, index) => {
          try {
            const row = new ColorEditorRow(index, color, updateColor, deleteColor);
            if (row && row.element) {
              hueList.appendChild(row.element);
            }
          } catch (rowError) {
            console.error(`🚨 Error creating color row #${index}:`, rowError);
          }
        });
      } else {
        console.warn("⚠️ No valid hues available to display in the color editor");
      }
      
      // Update the canvas with our current state
      redrawCanvas();
    } catch (uiError) {
      console.error("🚨 Error updating the color editor UI:", uiError);
    }
  } catch (error) {
    console.error(`🚨 Error in color editor setup for ${fileObj?.name || 'unknown file'}:`, error);
  }
}


export function redrawCanvas() {
  console.log("🔄 Attempting to redraw canvas...");
  
  // Check if we have the required inputs
  if (!currentShapeInputs || !currentColorInputs) {
    console.error("🚨 Missing required shape or color inputs! Cannot redraw.");
    return;
  }
  
  try {
    // Find the canvas element
    const canvas = document.querySelector("#canvasContainer canvas");
    if (!canvas) {
      console.error("🚨 Canvas element not found in DOM! Make sure it exists inside #canvasContainer.");
      
      // Try to create a canvas if it doesn't exist
      try {
        const container = document.querySelector("#canvasContainer");
        if (container) {
          const newCanvas = document.createElement("canvas");
          newCanvas.width = 800;
          newCanvas.height = 600;
          container.appendChild(newCanvas);
          console.log("🖼️ Created a new canvas element");
          // Continue with the new canvas
          redrawCanvas();
          return;
        }
      } catch (canvasCreateError) {
        console.error("🚨 Failed to create canvas:", canvasCreateError);
      }
      return;
    }
    
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("🚨 Unable to get 2D context for canvas!");
      return;
    }
    
    // Clear the canvas and WASM cache
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Make sure wasmModule exists before calling methods
    if (!wasmModule || typeof wasmModule.api_clear_grid_cache !== 'function') {
      console.error("🚨 WASM module not properly initialized or missing required methods");
      return;
    }
    
    console.log("🧹 Clearing WASM grid cache before generating image...");
    try {
      wasmModule.api_clear_grid_cache();
    } catch (wasmError) {
      console.error("🚨 Error clearing WASM grid cache:", wasmError);
      // Continue anyway
    }

    // Get data for WASM with error handling
    let shapeData, colorData;
    try {
      shapeData = getShapeInputsForWasm(currentShapeInputs);
      console.log("📐 Sending Shape Inputs:", shapeData);
    } catch (shapeError) {
      console.error("🚨 Error preparing shape data for WASM:", shapeError);
      return;
    }
    
    try {
      colorData = getColorInputsForWasm(currentColorInputs);
      console.log("🎨 Sending Color Inputs:", colorData);
    } catch (colorError) {
      console.error("🚨 Error preparing color data for WASM:", colorError);
      return;
    }
    
    // Generate the image using WASM
    let imageData;
    try {
      imageData = wasmModule.api_get_image_from_inputs(shapeData, colorData);
    } catch (imageGenError) {
      console.error("🚨 Error generating image in WASM:", imageGenError);
      return;
    }

    // Validate the image data
    if (!imageData || !imageData.data || !imageData.width || !imageData.height) {
      console.error("🚨 Invalid image data generated:", imageData);
      return;
    }

    try {
      // Convert `imageData` to ImageData for canvas
      const imgData = new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
      );

      // Ensure the canvas matches the image size
      canvas.width = imageData.width;
      canvas.height = imageData.height;

      // Draw image onto canvas
      ctx.putImageData(imgData, 0, 0);

      console.log("✅ Canvas updated successfully!");
    } catch (renderError) {
      console.error("🚨 Error rendering image data to canvas:", renderError);
    }
  } catch (error) {
    console.error("🚨 Error in redrawCanvas:", error);
  }
}


export function updateColor(index, newColor) {
  console.log(`🖍️ ColorEditor.updateColor() DEBUG: Updating color at index ${index}:`, newColor);
  if (typeof newColor !== "string") {
    newColor = rgbToHex(newColor.r, newColor.g, newColor.b);
  }
  console.log(`🎨 Updating color #${index} to ${newColor}`);
  const { r, g, b } = hexToRgb(newColor);

  // ✅ Update the hue at the given index
  currentHues[index] = new Hue({ num: index + 1, r, g, b });

  // ✅ Ensure hues in currentColorInputs are updated
  currentColorInputs.hues = [...currentHues];

  // ✅ Update colors in currentColorInputs if the method exists
  if (currentColorInputs && typeof currentColorInputs.updateColors === 'function') {
    currentColorInputs.updateColors();
  }

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

  const newHue = new Hue({ num: currentHues.length + 1, r: 0, g: 0, b: 0 });

  // ✅ Create a new, immutable hues array with a new Hue
  currentHues = [...currentHues, newHue];

  // ✅ Ensure each hue is a new instance (prevents shared references)
  currentColorInputs.hues = currentHues.map(hue => new Hue(hue));

  // ✅ Update ColorInputs while ensuring safe copies
  currentColorInputs = updateColorInputs(currentHues, currentColorInputs);

  // ✅ Re-render everything (UI + Canvas)
  redrawCanvas();
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
    num: i + 1,
    r: color.r,
    g: color.g,
    b: color.b
  }));

  currentColorInputs.hues = [...currentHues];
  hueList.innerHTML = "";
  currentHues.forEach((color, i) => {
    const row = new ColorEditorRow(i, color, updateColor, deleteColor);
    hueList.appendChild(row.element);
  });
  currentColorInputs = updateColorInputs(currentHues, currentColorInputs);
  redrawCanvas();
}