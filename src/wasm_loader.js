import { WASM_JS_PATH } from "./constants.js";

/**
 * Load the WASM module using ES module import
 */
export async function loadWasmModule() {
    try {
        console.log("Loading WASM module...");
        
        // Use dynamic import with the path from constants
        const wasmModule = await import(WASM_JS_PATH);
        
        // Initialize it (this assumes your module has a default export that's a function)
        // Your WASM module's initialization might be different
        if (typeof wasmModule.default === 'function') {
            await wasmModule.default();
        }
        
        console.log("WASM module loaded successfully!");
        
        // Make it globally available for compatibility with existing code
        window.wasmModule = wasmModule;
        
        return wasmModule;
    } catch (error) {
        console.error("Failed to load WASM module:", error);
        return null;
    }
}