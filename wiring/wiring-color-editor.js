// wiring/wiring-color-editor.js IMPORTANT KEEP THIS LINE
// ✅ Wiring: Handles Color Editor events and interactions

import { getUIElement } from "../globals.js";
import { eventBus } from "../state/state-all.js";
import { updateColorState, getColorState } from "../state/state-color-inputs.js";

/**
 * Handles the color input change event.
 * Emits an event with the updated mand color.
 */
function handleColorInput() {
  const colorPicker = getUIElement("mandColorPicker");
  if (!colorPicker) {
    console.error("❌ Wiring: 'mandColorPicker' not found.");
    return;
  }
  const newColor = colorPicker.value;
  console.log("🎨 Wiring: MAND COLOR input changed to", newColor);
  eventBus.emit("mand-color-updated", { color: newColor });
  eventBus.emit("color-state-changed");
}



/**
 * Handles changes on the hue list control.
 * Emits an event with the new hue value.
 */
function handleHueChange(event) {
  const hueValue = event.target.value;
  console.log("🎨 Wiring: Hue changed to", hueValue);
  eventBus.emit("hue-updated", { hue: hueValue });
  eventBus.emit("color-state-changed");
}

/**
 * Initializes all wiring for the Color Editor.
 */
export function initColorEditorWiring() {
  if (window.colorEditorWiringInitialized) {
    console.warn("⚠️ Wiring was already initialized. Skipping...");
    return;
  }
  window.colorEditorWiringInitialized = true;

  console.log("🎨 Wiring: Initializing Color Editor events...");

  // Wiring for the main color picker input
  const mandColorPicker = getUIElement("mandColorPicker");
  if (mandColorPicker) {
    mandColorPicker.addEventListener("change", handleColorInput);
  } else {
    console.warn("⚠️ Wiring: 'mandColorPicker' not found.");
  }

  // Wiring for the add color button (Prevent duplicate event listeners)
  const addColorBtn = getUIElement("addColorBtn");
  if (addColorBtn) {
    if (!window.hasAddColorListener) {
      addColorBtn.addEventListener("click", () => {
        console.log("🔥 Add Color Clicked! Firing event ONCE.");
        handleAddColor();
      });
      window.hasAddColorListener = true; // ✅ Prevent duplicate listeners
    }
  } else {
    console.warn("⚠️ Wiring: 'addColorBtn' not found.");
  }

  // Wiring for the hue list if it exists
  const hueList = getUIElement("hueList");
  if (hueList) {
    hueList.addEventListener("change", handleHueChange);
  } else {
    console.warn("⚠️ Wiring: 'hueList' not found.");
  }

  console.log("🎨 Wiring: Color Editor events initialized.");
}


/**
 * ✅ Subscribe to the "add-color" event to update the color state.
 * Ensures only one subscription exists.
 */
if (!window.hasSubscribedToAddColor) {
  window.hasSubscribedToAddColor = true;

  eventBus.subscribe("add-color", () => {
    console.log("🎨 EVENT: Received 'add-color', updating state...");

    const currentState = getColorState();
    const newIndex = currentState.hues.length;
    const newHue = [newIndex, 0, 0, 0];  

    updateColorState({ hues: [...currentState.hues, newHue] });
  });
}
