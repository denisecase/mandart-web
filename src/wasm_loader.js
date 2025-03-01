import { WASM_JS_PATH } from "./constants.js";

export async function loadWasmModule() {
    try {
        console.log("Loading WASM module...");
        const wasmModule = await import(WASM_JS_PATH);
        await wasmModule.default();
        console.log("WASM module loaded successfully");
        return wasmModule;
    } catch (error) {
        console.error("Failed to load WASM module:", error);
        return null;
    }
}
