// globals.js

// UI Elements
export const select = document.getElementById("fileSelect");
export const fileListContainer = document.getElementById("fileListContainer");
export const mandColorPicker = document.getElementById("mandColorPicker");
export const addColorBtn = document.getElementById("addColorBtn");
export const hueList = document.getElementById("hueList");

// Data Storage
export let MANDART_CATALOG = [];
export let defaultIndex = 0;
export let wasmModule = null;
export let canvasContainer = null;

// Functions to update global values
export function setMandartCatalog(newCatalog) {
    MANDART_CATALOG = newCatalog;
}

export function setDefaultIndex(index) {
    defaultIndex = index;
}

export function setWasmModule(module) {
    console.log("🔄 Setting WASM module in globals");
    wasmModule = module;
    
    // Also make it available on window for direct access elsewhere
    window.wasmModule = module;
    
    console.log("✅ WASM module set in globals");
    return module;
}

// Initialize DOM references after the document is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("🔄 Initializing global DOM references");
    
    canvasContainer = document.getElementById('canvasContainer');
    if (canvasContainer) {
        console.log("✅ Canvas container found");
    } else {
        console.error("❌ Canvas container not found");
    }
    
    // Make the canvasContainer globally available as well
    window.canvasContainer = canvasContainer;
});