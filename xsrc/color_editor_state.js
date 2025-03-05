// color_editor_state.js

// Import from save_mandart.js to set up the state getter
import { wasmModule } from '../globals.js';

// This file provides a bridge between ColorEditor.js and save_mandart.js
// to allow accessing the current state without circular dependencies

// This function will be called by the ColorEditor to expose its state
export function initColorEditorState(getCurrentStateFunction) {
    if (typeof getCurrentStateFunction !== 'function') {
        console.error("initColorEditorState requires a function parameter");
        return;
    }
    
    // Pass the state getter to save_mandart.js
    setStateGetter(getCurrentStateFunction);
}

// Helper function to check if WASM module is available
export function isWasmModuleAvailable() {
    return !!wasmModule && typeof wasmModule === 'object';
}
