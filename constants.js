// constants.js - Application-wide constants

/** Detect if running on GitHub Pages */
export const IS_GITHUB_PAGES = window.location.hostname.includes("github.io");

/** Base Paths */
export const LOCAL_BASE_PATH = "../";
export const GITHUB_BASE_PATH = "https://denisecase.github.io/mandart-web/";
export const BASE_PATH = IS_GITHUB_PAGES ? GITHUB_BASE_PATH : LOCAL_BASE_PATH;

/** Paths */
export const ASSETS_PATH = `${BASE_PATH}assets/`;
export const PUBLIC_PATH = `${BASE_PATH}public/`;

/** Input and WASM Paths */
export const INPUT_PATH = `${ASSETS_PATH}MandArt_Catalog/`;
export const WASM_PATH = `${PUBLIC_PATH}pkg/mandart_wasm_bg.wasm`;
export const WASM_JS_PATH = `${PUBLIC_PATH}pkg/mandart_wasm.js`;
export const JSON_CATALOG_PATH = `${ASSETS_PATH}mandart_discoveries.json`;

/** Defaults */
export const DEFAULT_MANDART_FILE_STEM = "Bhj1";
export const DEFAULT_MANDART_FILE_URL = "https://raw.githubusercontent.com/denisecase/MandArt-Discoveries/main/brucehjohnson/Examplesstashed/Bhj1.mandart"
export const DEFAULT_CATALOG_SELECTION_STATE = { selectedFile: null };
export const DEFAULT_MODAL_URL = "https://raw.githubusercontent.com/denisecase/MandArt-Discoveries/main/brucehjohnson/frame_pix/Frame54.mandart"