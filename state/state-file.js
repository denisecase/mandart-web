// state/state-file.js
import { eventBus } from '../utils/event-bus.js';
import FileState from "../models/FileState.js";

let fileState = new FileState();

// Listen for new file selection events
eventBus.subscribe('file-selected', ({ file }) => {
    console.log(`📂 File selected: ${file.name}`);
    setCurrentFilename(file.name);
    handleFileLoading(file);
});


// Function to update the file state with partial updates
export function updateFileState(updates) {
    console.log("🔄 FILE-STATE: Updating file state with:", updates);
    if (!updates || typeof updates !== 'object') {
        console.error("❌ Invalid file state update:", updates);
        return false;
    }

    // // Require at least currentFilename and lastLoadedJson to update
    // if (!updates.currentFilename || !updates.lastLoadedJson) {
    //     console.error("❌ Missing required file state properties:", updates);
    //     return false;
    // }

        // Require at least one property to update: currentFilename, lastLoadedJson, or lastLoaded.
        if (updates.currentFilename === undefined && updates.lastLoadedJson === undefined && updates.lastLoaded === undefined) {
            console.error("❌ Missing required file state properties: Provide at least currentFilename, lastLoadedJson, or lastLoaded", updates);
            return false;
        }

    const current = fileState.toJSON();
    // Preserve the current source if the update doesn't include it.
    if (!("source" in updates)) {
        updates.source = current.source;
    }

    fileState = new FileState({ ...current, ...updates });
    eventBus.emit("file-state-changed", getFileState());
    return true;
}

function handleFileLoading(file) {
    const reader = new FileReader();
    reader.onload = function () {
        console.log("📂 File loaded successfully.");
    };
    reader.readAsText(file);
}

// Set the filename in the file state
export function setCurrentFilename(filename) {
    console.log(`📂 FILE-STATE: Updating current filename to ${filename || "(None)"}`);
    fileState.currentFilename = filename;
    eventBus.emit("file-state-changed", getFileState());
}

export function getCurrentFilename() {
    return fileState.currentFilename;
}


export function getFileState() {
  return new FileState(fileState.toJSON());
}

export function subscribeToFileState(callback) {
    return eventBus.subscribe("file-state-changed", callback);
}

export function getFileLabel() {
    const state = getFileState();
    let name = state.currentFilename;
    if (name && name.startsWith("http")) {
        // Extract filename from URL: take the last segment and remove the extension.
        name = name.split('/').pop().replace(/\.[^/.]+$/, "");
    }
    return name || "MandArt";
}