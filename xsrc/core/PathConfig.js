/**
 * src/core/PathConfig.js
 * Central configuration for all file paths in the MandArt application.
 * This only provides paths, not loading functionality.
 */

const ASSETS_DIR = './assets';
const CATALOG_DIR = `${ASSETS_DIR}/MandArt_Catalog`;
const EXPORTED_DIR = './exported';
const MANDART_INDEX_PATH = `${ASSETS_DIR}/mandart_discoveries.json`;
const DEFAULT_MANDART_PATH = `${CATALOG_DIR}/Default.mandart`;
const STYLES_PATH = './css';
const DEFAULT_URL = "https://raw.githubusercontent.com/denisecase/MandArt-Discoveries/main/brucehjohnson/frame_pix/Frame54.mandart";

// WASM paths
const WASM_DIR = './wasm';
const WASM_MODULE_PATH = `${WASM_DIR}/mandart_engine_rust.js`;
const WASM_BINARY_PATH = `${WASM_DIR}/mandart_engine_rust_bg.wasm`;
const WASM_BINARY_FALLBACK_PATH = `${WASM_DIR}/mandart_engine_rust_bg.wasm.txt`;

const URL_FUNCTIONS = {
  getMandArtFilePath: (fileName) => `${CATALOG_DIR}/${fileName}.mandart`,
  getMandArtImagePath: (fileName) => `${CATALOG_DIR}/${fileName}.png`,
  getExportedFilePath: (filename) => `${EXPORTED_DIR}/${filename}`,
};

const getUrlPrefix = () => {
  const isProduction = window.location.hostname !== 'localhost';
  return isProduction ? '/mandart' : '';
};

const applyPrefix = (path) => {
  const prefix = getUrlPrefix();
  if (prefix && !path.startsWith(prefix) && !path.startsWith('http')) {
    return `${prefix}${path.startsWith('/') ? path : `/${path}`}`;
  }
  return path;
};

const isGitHubPages = () => window.location.hostname.includes("github.io");



export default {
  getDefaultUrl: () => DEFAULT_URL,
  getAssetsPath: () => applyPrefix(ASSETS_DIR),
  getCatalogPath: () => applyPrefix(CATALOG_DIR),
  getExportedPath: () => applyPrefix(EXPORTED_DIR),
  getDefaultMandArtPath: () => applyPrefix(DEFAULT_MANDART_PATH),
  getStylesPath: () => applyPrefix(STYLES_PATH),
  getMandArtIndexPath: () => applyPrefix(MANDART_INDEX_PATH),
  
  // WASM paths
  getWasmPath: () => applyPrefix(WASM_MODULE_PATH),
  getWasmBinaryPath: () => applyPrefix(isGitHubPages() ? WASM_BINARY_FALLBACK_PATH : WASM_BINARY_PATH),
  
  getMandArtFilePath: (fileName) => applyPrefix(URL_FUNCTIONS.getMandArtFilePath(fileName)),
  getMandArtImagePath: (fileName) => applyPrefix(URL_FUNCTIONS.getMandArtImagePath(fileName)),
  getExportedFilePath: (filename) => applyPrefix(URL_FUNCTIONS.getExportedFilePath(filename)),
};
