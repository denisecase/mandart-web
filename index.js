import { fetchMandartCatalog, MANDART_CATALOG, defaultIndex } from "./src/fetch_catalog.js";
import { processFile } from "./src/process_file.js";
import { loadWasmModule } from "./src/wasm_loader.js";
import { setWasmModule, wasmModule } from "./src/globals.js";

async function init() {
    try {
        console.log("Initializing MandArt Web...");

        // Load WASM module
        const wasm = await loadWasmModule();
        setWasmModule(wasm);
        if (!wasm) return;

        // Fetch catalog and populate UI
        await fetchMandartCatalog();

    } catch (error) {
        console.error("Failed to initialize:", error);
    }
}

window.addEventListener("DOMContentLoaded", init);
