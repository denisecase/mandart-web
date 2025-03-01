export const IS_GITHUB_PAGES = window.location.hostname.includes("github.io");

// Define Base Paths
export const LOCAL_BASE_PATH = "../";
export const GITHUB_BASE_PATH = "https://denisecase.github.io/mandart-web/";
export const BASE_PATH = IS_GITHUB_PAGES ? GITHUB_BASE_PATH : LOCAL_BASE_PATH;

// Define Input and WASM Paths (Updated Paths!)
export const INPUT_PATH = `${BASE_PATH}assets/MandArt_Catalog/`;
export const WASM_PATH = `${BASE_PATH}public/pkg/mandart_wasm_bg.wasm`;
export const WASM_JS_PATH = `${BASE_PATH}public/pkg/mandart_wasm.js`;
export const JSON_CATALOG_PATH = `${BASE_PATH}assets/mandart_discoveries.json`;

// Default MandArt file
export const DEFAULT_MANDART_FILE = "Bhj1";
