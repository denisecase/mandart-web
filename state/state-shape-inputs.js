// state/state-shape-inputs.js
// ✅ Manages Shape Inputs state

import { eventBus } from "../utils/event-bus.js";
import ShapeInputs from "../models/ShapeInputs.js";

// Initialize internal state using the model defaults.
let shapeState = new ShapeInputs();

/**
 * ✅ Get the current shape state (Immutable copy)
 * @returns {ShapeInputs} Current shape state
 */
export function getShapeState() {
    // Return a new instance to avoid accidental mutations.
    return new ShapeInputs({ ...shapeState });
}

/**
 * ✅ Update shape state in a controlled manner.
 * @param {Object} newState - Partial updates to shape state.
 * @returns {boolean} Success status.
 */
export function updateShapeState(newState) {
    if (!newState || typeof newState !== "object") {
        console.error("❌ Invalid shape state update:", newState);
        return false;
    }

    // Merge current state with new updates and create a new instance.
    shapeState = new ShapeInputs({ ...shapeState, ...newState });
    eventBus.emit("shape-state-changed", getShapeState());
    return true;
}

/**
 * ✅ Reset shape state to defaults.
 */
export function resetShapeState() {
    shapeState = new ShapeInputs();
    eventBus.emit("shape-state-changed", getShapeState());
}

/**
 * ✅ Subscribe to shape state changes.
 * @param {Function} callback - Function to call when state changes.
 * @returns {Function} Unsubscribe function.
 */
export function subscribeToShapeState(callback) {
    return eventBus.subscribe("shape-state-changed", callback);
}

eventBus.subscribe('file-json-fetched', (jsonString) => {
    console.log('💡 Shape/Color state received file-json-fetched event');
});

eventBus.subscribe('file-clean', () => {
    console.log('💡 Shape/Color state received file-clean event');
});