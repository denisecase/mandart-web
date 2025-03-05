// services/save-mandart-file.js
// Handles saving MandArt files

import { getState } from '../state/state-all.js';
import { getUIElement } from '../globals.js';
import { getFileLabel, getCurrentFilename} from '../state/state-file.js';

/**
 * ✅ Save the current MandArt state as a JSON file
 * @param {string} [customFilename] - Optional custom filename
 * @returns {Promise<boolean>} Success status
 */
export async function saveMandArtFile(customFilename) {
    try {
        console.log("💾 FILE: Saving MandArt file...", getFileLabel());
        console.log("💾 FILE: Saving MandArt file...", getCurrentFilename());

        const state = getState();
        const validMandArt = convertMandArtInputsToValidMandartFormat(state);    
        const jsonData = JSON.stringify(validMandArt, null, 2);

        // Use customFilename if provided, otherwise get the file label from state (with fallback)
        const label = customFilename || getFileLabel() || 'untitled';
        console.log("Saving MandArt file with label:", label);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${label}_${timestamp}`;

        // Create download link
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `${filename}.mandart`;
        downloadLink.style.display = 'none';

        // Use reactive helper to access the body element
        const body = getUIElement('body');
        body.appendChild(downloadLink);
        downloadLink.click();
        body.removeChild(downloadLink);
        URL.revokeObjectURL(url);

        console.log(`✅ FILE: Saved MandArt file: ${filename}.mandart`);
        return true;
    } catch (error) {
        console.error("❌ FILE: Error saving MandArt file:", error);
        return false;
    }
}

/**
 * Converts a complete MandArt inputs object with snake_case keys
 * to one with camelCase keys. This function explicitly maps the
 * fields for both the shape and color sections.
 *
 * @param {Object} snakeState - The complete MandArt state with snake_case keys.
 * @returns {Object} A new object with the same data but with camelCase keys.
 */
export function convertMandArtInputsToCamelCase(snakeState) {
    return {
        id: snakeState.id,               // Assuming id remains unchanged
        file: snakeState.file,           // Optional file property if present
        shape: {
            imageWidth: snakeState.shape.image_width,
            imageHeight: snakeState.shape.image_height,
            iterationsMax: snakeState.shape.iterations_max,
            scale: snakeState.shape.scale,
            xCenter: snakeState.shape.x_center,
            yCenter: snakeState.shape.y_center,
            theta: snakeState.shape.theta,
            rSqLimit: snakeState.shape.r_sq_limit,
            mandPowerReal: snakeState.shape.mand_power_real,
            dFIterMin: snakeState.shape.d_f_iter_min
        },
        color: {
            nBlocks: snakeState.color.n_blocks,
            spacingColorFar: snakeState.color.spacing_color_far,
            spacingColorNear: snakeState.color.spacing_color_near,
            yYInput: snakeState.color.y_y_input,
            mandColor: snakeState.color.mand_color,
            colors: snakeState.color.colors,
            hues: snakeState.color.hues,
            nColors: snakeState.color.n_colors
        }
    };
}

/**
 * Converts a state object (with snake_case keys in shape and color) into a valid .mandart format.
 * The returned object will have camelCase keys and the following structure:
 *
 * {
 *   id: string,
 *   scale: number,
 *   huesOptimizedForPrinter: [], // always empty array
 *   yCenter: number,
 *   imageWidth: number,
 *   nImage: number,              // defaults to 0 if not provided
 *   spacingColorFar: number,
 *   hues: [                      // each hue is an object
 *     {
 *       id: string,              // generated UUID
 *       num: number,
 *       r: number,
 *       g: number,
 *       b: number,
 *       color: { red: number, green: number, blue: number } // normalized values (0-1)
 *     },
 *     ...
 *   ],
 *   leftNumber: number,          // defaults to 1
 *   theta: number,
 *   rSqLimit: number,
 *   iterationsMax: number,
 *   yY: number,
 *   dFIterMin: number,
 *   spacingColorNear: number,
 *   imageHeight: number,
 *   nBlocks: number,
 *   xCenter: number,
 *   huesEstimatedPrintPreview: [], // always empty array
 *   mandColor: number[]          // optional (if provided)
 *   mandPowerReal: number        // optional (if provided)
 * }
 *
 * @param {Object} snakeState - The state object with snake_case keys.
 * @returns {Object} The converted state object in valid .mandart format.
 */
export function convertMandArtInputsToValidMandartFormat(snakeState) {
    // Extract shape and color sections
    const shape = snakeState.shape || {};
    const color = snakeState.color || {};
  
    // Convert hues array: each hue is assumed to be [num, r, g, b]
    // We'll generate a new UUID for each hue (if crypto.randomUUID is available).
    const hues = (color.hues || []).map(hueArr => {
      const [num, r, g, b] = hueArr;
      return {
        id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
        num,
        r,
        g,
        b,
        // Normalize r, g, b to [0,1] range
        color: {
          red: +(r / 255).toFixed(4),
          green: +(g / 255).toFixed(4),
          blue: +(b / 255).toFixed(4)
        }
      };
    });
  
    // Construct the valid mandart object
    const validMandArt = {
      id: snakeState.id || (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`),
      scale: shape.scale,
      huesOptimizedForPrinter: [],
      yCenter: shape.y_center,
      imageWidth: shape.image_width,
      nImage: snakeState.nImage || 0,
      spacingColorFar: color.spacing_color_far,
      hues,
      leftNumber: snakeState.leftNumber || 1,
      theta: shape.theta,
      rSqLimit: shape.r_sq_limit,
      iterationsMax: shape.iterations_max,
      yY: color.y_y_input, // using y_y_input as yY
      dFIterMin: shape.d_f_iter_min,
      spacingColorNear: color.spacing_color_near,
      imageHeight: shape.image_height,
      nBlocks: color.n_blocks,
      xCenter: shape.x_center,
      huesEstimatedPrintPreview: [],
      // Optional fields:
      ...(color.mand_color ? { mandColor: color.mand_color } : {}),
      ...(shape.mand_power_real !== undefined ? { mandPowerReal: shape.mand_power_real } : {})
    };
  
    return validMandArt;
  }
  