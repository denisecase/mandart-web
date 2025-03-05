// wiring/wiring-all.js
// ✅ Initializes all event handlers for MandArt Web
import { initBackgroundLoadWiring } from './wiring-background-load.js';

import { initButtonOpenFromCatalogWiring } from './wiring-button-open-from-catalog.js';
import { initButtonOpenFromLocalFileWiring } from './wiring-button-open-from-local-machine.js';
import { initButtonOpenFromUrlWiring } from './wiring-button-open-from-url.js';

import { initButtonSaveFileMandartWiring } from './wiring-button-save-file-mandart.js';
import { initButtonSaveFilePngWiring } from './wiring-button-save-file-png.js';

import { initCanvasWiring } from './wiring-canvas.js';
import { initColorEditorWiring } from './wiring-color-editor.js';
import { initFileSelectOpenWiring } from './wiring-file-select-open.js';

import { initModalCatalogWiring } from './wiring-modal-catalog.js';
import { initModalUrlPromptWiring } from './wiring-modal-url-prompt.js';

import { initSaveMandart } from './wiring-save-mandart.js';
import { initSavePng } from './wiring-save-png.js';


/**
 * ✅ Initialize all event wiring
 */
export function initWiring() {
    console.log("🔗 Initializing all event wiring...");

   // Background load wiring (listens for file load events and triggers file processing)
   initBackgroundLoadWiring();

    // File opening logic
    initButtonOpenFromCatalogWiring();
    initButtonOpenFromLocalFileWiring();
    initButtonOpenFromUrlWiring();

    // Button interactions (save, load, etc.)
    initButtonSaveFileMandartWiring();
    initButtonSaveFilePngWiring();

    // UI interaction wiring
    initCanvasWiring();
    initColorEditorWiring();
    initFileSelectOpenWiring();

    // Modal interactions
    initModalCatalogWiring();
    initModalUrlPromptWiring();

    // Save Operations
    initSaveMandart();
    initSavePng();

    console.log("✅ All event wiring initialized.");
}
