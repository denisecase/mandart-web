/**
 * Validates that a given flat MandArt object (with camelCase keys) conforms
 * to the expected .mandart format.
 *
 * Expected structure:
 * 
 * {
 *   id: string,
 *   scale: number,
 *   huesOptimizedForPrinter: array,    // even if empty
 *   yCenter: number,
 *   imageWidth: number,
 *   nImage: number,
 *   spacingColorFar: number,
 *   hues: array of hue objects,         // each hue must be an object with:
 *       {
 *         id: string,
 *         num: number,
 *         r: number,
 *         g: number,
 *         b: number,
 *         color: { red: number, green: number, blue: number } // values normalized (0-1)
 *       },
 *   leftNumber: number,
 *   theta: number,
 *   rSqLimit: number,
 *   iterationsMax: number,
 *   yY: number,
 *   dFIterMin: number,
 *   spacingColorNear: number,
 *   imageHeight: number,
 *   nBlocks: number,
 *   xCenter: number,
 *   huesEstimatedPrintPreview: array,
 *   // Optional:
 *   mandColor: array of 3 numbers,
 *   mandPowerReal: number
 * }
 *
 * @param {Object} state - The flat MandArt object with camelCase keys.
 * @returns {boolean} True if valid; false otherwise.
 */
export function validateMandArtState(state) {
    let valid = true;
  
    // List required top-level keys along with expected types.
    const requiredFields = [
      { key: "id", type: "string" },
      { key: "scale", type: "number" },
      { key: "huesOptimizedForPrinter", type: "array" },
      { key: "yCenter", type: "number" },
      { key: "imageWidth", type: "number" },
      { key: "nImage", type: "number" },
      { key: "spacingColorFar", type: "number" },
      { key: "hues", type: "array" },
      { key: "leftNumber", type: "number" },
      { key: "theta", type: "number" },
      { key: "rSqLimit", type: "number" },
      { key: "iterationsMax", type: "number" },
      { key: "yY", type: "number" },
      { key: "dFIterMin", type: "number" },
      { key: "spacingColorNear", type: "number" },
      { key: "imageHeight", type: "number" },
      { key: "nBlocks", type: "number" },
      { key: "xCenter", type: "number" },
      { key: "huesEstimatedPrintPreview", type: "array" }
    ];
  
    requiredFields.forEach(({ key, type }) => {
      if (!(key in state)) {
        console.error(`Validation error: Missing required field "${key}".`);
        valid = false;
      } else {
        const value = state[key];
        if (type === "number" && typeof value !== "number") {
          console.error(`Validation error: Field "${key}" must be a number.`);
          valid = false;
        } else if (type === "string" && typeof value !== "string") {
          console.error(`Validation error: Field "${key}" must be a string.`);
          valid = false;
        } else if (type === "array" && !Array.isArray(value)) {
          console.error(`Validation error: Field "${key}" must be an array.`);
          valid = false;
        }
      }
    });
  
    // Validate the hues array.
    if (Array.isArray(state.hues)) {
      state.hues.forEach((hue, index) => {
        if (typeof hue !== "object" || hue === null) {
          console.error(`Validation error: Hue at index ${index} is not an object.`);
          valid = false;
          return;
        }
        // Required keys for each hue.
        const requiredHueKeys = [
          { key: "id", type: "string" },
          { key: "num", type: "number" },
          { key: "r", type: "number" },
          { key: "g", type: "number" },
          { key: "b", type: "number" },
          { key: "color", type: "object" }
        ];
        requiredHueKeys.forEach(({ key, type }) => {
          if (!(key in hue)) {
            console.error(`Validation error: Hue at index ${index} is missing key "${key}".`);
            valid = false;
          } else {
            const val = hue[key];
            if (type === "number" && typeof val !== "number") {
              console.error(`Validation error: Hue at index ${index} key "${key}" must be a number.`);
              valid = false;
            } else if (type === "string" && typeof val !== "string") {
              console.error(`Validation error: Hue at index ${index} key "${key}" must be a string.`);
              valid = false;
            } else if (type === "object" && (typeof val !== "object" || val === null)) {
              console.error(`Validation error: Hue at index ${index} key "${key}" must be an object.`);
              valid = false;
            }
          }
        });
        // Validate the nested color object in each hue.
        if (hue.color && typeof hue.color === "object") {
          ["red", "green", "blue"].forEach(colorKey => {
            if (!(colorKey in hue.color)) {
              console.error(`Validation error: Hue at index ${index} 'color' is missing key "${colorKey}".`);
              valid = false;
            } else if (typeof hue.color[colorKey] !== "number") {
              console.error(`Validation error: Hue at index ${index} 'color.${colorKey}' must be a number.`);
              valid = false;
            }
          });
        }
      });
    }
  
    // Validate optional field: mandColor
    if ("mandColor" in state) {
      if (!Array.isArray(state.mandColor) || state.mandColor.length !== 3) {
        console.error(`Validation error: Optional field "mandColor" must be an array of 3 numbers.`);
        valid = false;
      } else {
        state.mandColor.forEach((val, i) => {
          if (typeof val !== "number") {
            console.error(`Validation error: mandColor[${i}] must be a number.`);
            valid = false;
          }
        });
      }
    }
  
    // Validate optional field: mandPowerReal
    if ("mandPowerReal" in state && typeof state.mandPowerReal !== "number") {
      console.error(`Validation error: Optional field "mandPowerReal" must be a number.`);
      valid = false;
    }
  
    return valid;
  }
  