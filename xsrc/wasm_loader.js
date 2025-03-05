import { WASM_JS_PATH } from "./constants.js";

/**
 * Load the WASM module using ES module import
 */
export async function loadWasmModule() {
    try {
        console.log("Loading WASM module..."); 
        const wasmModule = await import(WASM_JS_PATH);  
         if (typeof wasmModule.default === 'function') {
            await wasmModule.default();
        }
        console.log("WASM module loaded successfully!");
        window.wasmModule = wasmModule;
        return wasmModule;
    } catch (error) {
        console.error("Failed to load WASM module:", error);
        return null;
    }
}