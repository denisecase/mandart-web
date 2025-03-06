// globals.js - Global references for UI elements

const globals = {
    // Header buttons
    openUrlBtn: null,
    openFileBtn: null,
    openCatalogBtn: null,
    saveMandartBtn: null,
    savePngBtn: null,

    // File selection
    fileSelect: null,

    // Catalog modal
    catalogModal: null,
    catalogCloseBtn: null,

    // Canvas and rendering
    canvas: null,
    canvasContainer: null,

    // Color editor
    mandColorPicker: null,
    addColorBtn: null,
    hueList: null,
    nBlocks: null,
    spacingColorFar: null,
    spacingColorNear: null,
    yYInput: null,

    // Other containers
    downloadContainer: null,
    downloadContainerMandart: null,
    mandartList: null,
    githubLink: null,

    // URL Modal
    urlModal: null,
    urlInput: null,
    loadUrlBtn: null,
    cancelUrlBtn: null,
};

/**
 * Initialize UI elements when DOM is loaded.
 */
export function initGlobals() {
    console.log("🔄 Initializing global UI references");

    return new Promise((resolve) => {

        // body for saving files
        globals.body = document.body;

        // Header buttons
        globals.openUrlBtn = document.getElementById("openUrlBtn");
        globals.openFileBtn = document.getElementById("openFileBtn");
        globals.openCatalogBtn = document.getElementById("openCatalogBtn");
        globals.saveMandartBtn = document.getElementById("saveMandartBtn");
        globals.savePngBtn = document.getElementById("savePngBtn");

        // File selection
        globals.fileSelect = document.getElementById("fileSelect");

        // Catalog modal
        globals.catalogModal = document.getElementById("catalogModal");
        globals.catalogCloseBtn = document.getElementById("catalogCloseBtn");

        // Canvas and rendering
        globals.canvas = document.getElementById("canvas");
        globals.canvasContainer = document.getElementById("canvasContainer");

        // Color editor
        globals.mandColorPicker = document.getElementById("mandColorPicker");
        globals.addColorBtn = document.getElementById("addColorBtn");
        globals.hueList = document.getElementById("hueList");
        globals.nBlocks = document.getElementById("nBlocks");
        globals.spacingColorFar = document.getElementById("spacingColorFar");
        globals.spacingColorNear = document.getElementById("spacingColorNear");
        globals.yYInput = document.getElementById("yYInput");

        // Other containers
        globals.downloadContainer = document.getElementById("download-container");
        globals.downloadContainerMandart = document.getElementById("download-container-mandart");
        globals.mandartList = document.getElementById("mandartList");
        globals.githubLink = document.getElementById("githubLink");

        // URL Modal elements
        globals.urlModal = document.getElementById("urlModal");
        globals.urlInput = document.getElementById("urlInput");
        globals.loadUrlBtn = document.getElementById("loadUrlBtn");
        globals.cancelUrlBtn = document.getElementById("cancelUrlBtn");

        // Ensure all elements are found
        Object.entries(globals).forEach(([key, value]) => {
            if (!value) {
                console.warn(`⚠️ UI element '${key}' not found in DOM`);
            }
        });

        // Make available globally (optional, useful for debugging)
        window.globals = globals;
        resolve();
    });
}

/**
 * Get a UI element safely.
 * @param {string} key - The key of the element in `globals`
 * @returns {HTMLElement|null} The element or null if not found.
 */
export function getUIElement(key) {
    if (!globals[key]) {
        console.warn(`⚠️ UI element '${key}' not initialized`);
    }
    return globals[key];
}


// Color Editor Elements
export const COLOR_EDITOR_ELEMENTS = {
    hueList: 'hueList',
    addColorBtn: 'addColorBtn',
    mandColorPicker: 'mandColorPicker',
    nBlocks: 'nBlocks',
    spacingColorFar: 'spacingColorFar',
    spacingColorNear: 'spacingColorNear',
    yYInput: 'yYInput',
};
