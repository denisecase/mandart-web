// components/FileSelectOpenFromDropdown.js
// ✅ Handles the file selection dropdown for opening a MandArt file.

import { getUIElement } from '../globals.js';
import { initFileSelectOpenWiring } from '../wiring/wiring-file-select-open.js';
import { getFileState } from '../state/state-file.js';
import { eventBus } from '../state/state-all.js';

export default class FileSelectOpenFromDropdown {
    constructor() {
        this.fileSelect = getUIElement('fileSelect');
        if (!this.fileSelect) {
            console.error("❌ FileSelectOpenFromDropdown: 'fileSelect' not found in globals.");
            return;
        }
        
        // Initialize wiring and store the cleanup function
        this.cleanup = initFileSelectOpenWiring(this.fileSelect);
        console.log("✅ FileSelectOpenFromDropdown: Wiring initialized.");

        // Subscribe to file state changes so the dropdown updates automatically.
        eventBus.subscribe("file-state-changed", () => this.updateDropdownDisplay());

        // Initialize the dropdown display on startup.
        this.updateDropdownDisplay();
    }

    /**
     * Updates the dropdown display:
     * - If the file state's source is "catalog" and a label is present, set the dropdown value to that label.
     * - Otherwise, set it to the placeholder "(Select File)".
     */
    updateDropdownDisplay() {
        const fileState = getFileState();
        console.log("Dropdown update: fileState.source =", fileState.source, ", label =", fileState.label);
        if (fileState.source === "catalog" && fileState.label) {
            this.fileSelect.value = fileState.label;
        } else {
            this.fileSelect.value = "(Select File)";
        }
    }

    /**
     * Reinitializes the component if needed.
     */
    init() {
        if (!this.fileSelect) {
            this.fileSelect = getUIElement('fileSelect');
        }
        if (this.fileSelect && !this.cleanup) {
            this.cleanup = initFileSelectOpenWiring(this.fileSelect);
            console.log("✅ FileSelectOpenFromDropdown: Wiring reinitialized in init().");
        }
    }

    /**
     * Cleanup: Removes event listeners.
     */
    destroy() {
        if (typeof this.cleanup === "function") {
            this.cleanup();
        }
        console.log("🗑️ FileSelectOpenFromDropdown: Destroyed.");
    }
}

/**
 * Initializes the File Select Dropdown component.
 * @returns {FileSelectOpenFromDropdown} The instance.
 */
export function initFileSelectOpenFromDropdown() {
    const instance = new FileSelectOpenFromDropdown();
    if (!instance.fileSelect) {
        console.error("❌ initFileSelectOpenFromDropdown: Initialization failed.");
    } else {
        console.log("✅ initFileSelectOpenFromDropdown: Instance created.");
    }
    return instance;
}
