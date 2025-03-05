// state/state-color-inputs.js IMPORTANT KEEP THIS LINE
// ✅ Manages Color Inputs state (CRUD for the ColorInputs model)

import { eventBus } from "../utils/event-bus.js";
import ColorInputs from "../models/ColorInputs.js";
import { hexToRgb } from '../utils/color-utils.js';


// Initialize internal state using the ColorInputs model; defaults are set by the model.
let colorState = new ColorInputs();



eventBus.subscribe('file-json-fetched', (jsonString) => {
    console.log('💡 Shape/Color state received file-json-fetched event');
});

eventBus.subscribe('file-clean', () => {
    console.log('💡 Shape/Color state received file-clean event');
});




/* =========================
   GETTERS
========================= */

/**
 * ✅ Get the current color state (Immutable deep copy)
 * @returns {ColorInputs} Current color state
 */
export function getColorState() {
  return new ColorInputs(JSON.parse(JSON.stringify(colorState)));
}

/**
 * Get the number of blocks.
 * @returns {number}
 */
export function getNBlocks() {
  return getColorState().n_blocks;
}

/**
 * Get the far color spacing.
 * @returns {number}
 */
export function getSpacingColorFar() {
  return getColorState().spacing_color_far;
}

/**
 * Get the near color spacing.
 * @returns {number}
 */
export function getSpacingColorNear() {
  return getColorState().spacing_color_near;
}

/**
 * Get the Y-Y input adjustment.
 * @returns {number}
 */
export function getYYInput() {
  return getColorState().y_y_input;
}

/**
 * Get the Mandelbrot color.
 * @returns {Array<number>}
 */
export function getMandColor() {
  return JSON.parse(JSON.stringify(getColorState().mand_color));
}

/**
 * Get the colors array.
 * @returns {Array<Array<number>>}
 */
export function getColors() {
  return JSON.parse(JSON.stringify(getColorState().colors));
}

/**
 * Get the hues array.
 * @returns {Array<Array<number>>}
 */
export function getHues() {
  return JSON.parse(JSON.stringify(getColorState().hues));
}

/* =========================
   SETTERS
========================= */

/**
 * ✅ Update the number of blocks.
 * @param {number} value
 */
export function setNBlocks(value) {
  updateColorState({ n_blocks: value });
}

/**
 * ✅ Update the far color spacing.
 * @param {number} value
 */
export function setSpacingColorFar(value) {
  updateColorState({ spacing_color_far: value });
}

/**
 * ✅ Update the near color spacing.
 * @param {number} value
 */
export function setSpacingColorNear(value) {
  updateColorState({ spacing_color_near: value });
}

/**
 * ✅ Update the Y-Y input adjustment.
 * @param {number} value
 */
export function setYYInput(value) {
  updateColorState({ y_y_input: value });
}

/**
 * ✅ Update the Mandelbrot color.
 * Accepts either an RGB array or a hex string and converts it to an RGB array.
 * @param {Array<number>|string} value - RGB array or hex string (e.g. "#f22c2c")
 */
function setMandColor(value) {
  console.log("🎨 !!!!!!!!!!!!!!!!!!Setting Mandelbrot color:", value);
  let newColor;
  if (typeof value === 'object' && !Array.isArray(value)) {
    newColor = [value.r, value.g, value.b];
  } else if (Array.isArray(value)) {
    newColor = [...value];
  } else {
    console.error("setMandColor expects an object or an array");
    return;
  }
  console.log("!!!!!!!!!!!!!!!!!!!!Setting new Mandelbrot color:", newColor);
  updateColorState({ mand_color: newColor });
}

/**
 * ✅ Update the colors array (complete replacement with deep copy).
 * @param {Array<Array<number>>} newColors
 */
export function setColors(newColors) {
  updateColorState({ colors: JSON.parse(JSON.stringify(newColors)) });
}

/**
 * ✅ Update the hues array (complete replacement with deep copy).
 * @param {Array<Array<number>>} newHues
 */
export function setHues(newHues) {
  updateColorState({ hues: JSON.parse(JSON.stringify(newHues)) });
}

/**
 * ✅ Append one or more hues to the existing hues array (deep copy).
 * @param {Array<Array<number>>} newHues - Array of hues to add.
 */
export function appendHues(newHues) {
  if (!Array.isArray(newHues)) return;
  const currentHues = getHues();
  const appended = currentHues.concat(JSON.parse(JSON.stringify(newHues)));
  setHues(appended);
}

/* =========================
   CENTRAL UPDATE FUNCTION
========================= */

/**
 * ✅ Update color state in a controlled manner.
 * Every update triggers a force-render of the canvas.
 * @param {Object} updates - Partial updates to the color state.
 * @returns {boolean} Success status.
 */
export function updateColorState(updates) {
  console.log("🔄 STATE UPDATE CALLED:", updates);

  if (!updates || typeof updates !== "object") {
    console.error("❌ Invalid color state update:", updates);
    return false;
  }

  // Create a deep copy of the current state to merge updates into.
  let updatedState = JSON.parse(JSON.stringify(colorState));

  // If hues or colors are provided, ensure they are deep copied.
  if (updates.hues && Array.isArray(updates.hues)) {
    updatedState.hues = JSON.parse(JSON.stringify(updates.hues));
  }
  if (updates.colors && Array.isArray(updates.colors)) {
    updatedState.colors = JSON.parse(JSON.stringify(updates.colors));
  }
  if (updates.mand_color) {
    updatedState.mand_color = JSON.parse(JSON.stringify(updates.mand_color));
  }

  // Merge the updates with the deep-copied current state.
  colorState = new ColorInputs({ ...updatedState, ...updates });
  console.log("✅ After update:", colorState);

  // Emit events to notify the UI and force canvas re-render.
  eventBus.emit("color-state-changed", getColorState());
  eventBus.emit("force-render-canvas");
  eventBus.emit("file-json-fetched", JSON.stringify(colorState));

  return true;
}

/* =========================
   RESET & SUBSCRIBE
========================= */

/**
 * ✅ Reset color state to model defaults.
 */
export function resetColorState() {
  colorState = new ColorInputs(); // Reset to default values.
  eventBus.emit("color-state-changed", getColorState());
  eventBus.emit("force-render-canvas");
}

/**
 * ✅ Subscribe to color state changes.
 * @param {Function} callback - Function to call when state changes.
 * @returns {Function} Unsubscribe function.
 */
export function subscribeToColorState(callback) {
  return eventBus.subscribe("color-state-changed", callback);
}

/* =========================
   EVENT LISTENERS (Debugging)
========================= */

eventBus.subscribe('file-json-fetched', (jsonString) => {
  console.log('💡 Shape/Color state received file-json-fetched event');
});

eventBus.subscribe('file-clean', () => {
  console.log('💡 Shape/Color state received file-clean event');
});
