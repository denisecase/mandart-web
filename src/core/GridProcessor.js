// src/core/GridProcessor.js
import { computeGridSafe } from "../utils/WasmLoader.js";

/**
 * Generates a Mandelbrot grid using JavaScript.
 * @param {Object} shapeInputs - Shape parameters
 * @returns {Array} 2D array of iteration values
 */
export function generateGrid(shapeInputs) {
  console.log("🔄 Generating grid with JavaScript...");
  
  const { 
    imageWidth = 100, 
    imageHeight = 100,
    centerX = 0,
    centerY = 0,
    zoom = 1,
    maxIterations = 100
  } = shapeInputs;
  
  const scale = 4.0 / zoom;
  const grid = [];
  
  for (let y = 0; y < imageHeight; y++) {
    const row = [];
    const cy = centerY + (y - imageHeight / 2) * scale / imageHeight;
    
    for (let x = 0; x < imageWidth; x++) {
      const cx = centerX + (x - imageWidth / 2) * scale / imageWidth;
      
      // Calculate Mandelbrot value
      let zx = 0;
      let zy = 0;
      let iteration = 0;
      
      while (zx * zx + zy * zy < 4 && iteration < maxIterations) {
        const tmp = zx * zx - zy * zy + cx;
        zy = 2 * zx * zy + cy;
        zx = tmp;
        iteration++;
      }
      
      row.push(iteration === maxIterations ? 0 : iteration);
    }
    
    grid.push(row);
  }
  
  return grid;
}
