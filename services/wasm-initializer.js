// services/wasm-initializer.js

import { WASM_JS_PATH } from '../constants.js';

let wasmModule = null; // Store WASM module locally to avoid global pollution

/**
 * Initialize the WASM module.
 * @returns {Promise<Object|null>} The initialized WASM module, or null if failed.
 */
export async function initWasmService() {
    console.log("🛠 WASM: Initializing service");

    if (wasmModule) {
        console.log("✅ WASM module already initialized");
        return wasmModule;
    }

    try {
        console.log(`🔄 Loading WASM module from: ${WASM_JS_PATH}`);
        const module = await import(WASM_JS_PATH);

        // If the module has a default function, call it to initialize
        if (module.default && typeof module.default === 'function') {
            await module.default();
        }

        wasmModule = module; // Store locally
        console.log("✅ WASM module loaded successfully");
        console.log("🔍 Available WASM functions:", Object.keys(module));

        return wasmModule;
    } catch (error) {
        console.error("❌ WASM: Error loading module:", error.message);
        return null;
    }
}

/**
 * Get the initialized WASM module.
 * @returns {Object|null} The WASM module, or null if not initialized.
 */
export function getWasmModule() {
    return wasmModule;
}
