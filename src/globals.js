// globals.js

// UI Elements
export const select = document.getElementById("fileSelect");
export const fileListContainer = document.getElementById("fileListContainer");
export const canvasContainer = document.getElementById("canvasContainer");
export const mandColorPicker = document.getElementById("mandColorPicker");
export const addColorBtn = document.getElementById("addColorBtn");
export const hueList = document.getElementById("hueList");

// Data Storage
export let MANDART_CATALOG = [];
export let defaultIndex = 0;
export let wasmModule = null;

// Functions to update global values
export function setMandartCatalog(newCatalog) {
    MANDART_CATALOG = newCatalog;
}

export function setDefaultIndex(index) {
    defaultIndex = index;
}

export function setWasmModule(module) {
    wasmModule = module;
}
