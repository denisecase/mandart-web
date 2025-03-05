// ✅ services/get-mandart-json-string-from-url.js
// ✅ Ensures file state updates are fully committed before triggering 'file-clean'.

import { updateFileState, getFileState } from '../state/state-file.js';
import { eventBus } from '../state/state-all.js';
import { validateMandArtState } from './validate-mandart-file.js';

/**
 * Fetches a MandArt JSON file from a URL.
 * @param {string} url - The URL of the MandArt file.
 * @returns {Promise<string|null>} JSON string or null if failed.
 */
export async function getMandartJsonStringFromUrl(url) {
    try {
        console.log(`✅ FROM URL Fetching JSON from ${url}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const jsonString = await response.text();
        if (!jsonString || jsonString.trim() === "") {
            throw new Error("❌ FROM URL Received an empty JSON string.");
        }

        // Attempt to parse and validate the JSON.
        let jsonData;
        try {
            jsonData = JSON.parse(jsonString);
        } catch (parseError) {
            alert("The file you selected is not valid JSON.");
            throw new Error("Invalid JSON format");
        }
        console.log("✅ FROM URL Received JSON data as object:", jsonData);

        // Derive the filename from the URL by taking the last segment and stripping the extension.
        const urlParts = url.split('/');
        let filename = urlParts[urlParts.length - 1] || "";
        filename = filename.replace(/\.[^/.]+$/, ""); // remove file extension
        if (!filename) {
            filename = "MandArt";
        }


        if (!validateMandArtState(jsonData)) {
            alert("Invalid MandArt JSON data. Please select a file with the correct format.");
            throw new Error("Invalid MandArt JSON data");
        }
        console.log("✅ FROM URL JSON data is valid MandArt format.");

        // If we reach here, loading and validation succeeded.
        // Update the file state (this will update the label).
        const success = updateFileState({
            currentFilename: filename,
            source: 'catalog',
            lastLoadedJson: jsonString
        });
        if (!success) {
            throw new Error("Failed to update file state");
        }

        console.log(`✅ FILE-STATE: Successfully updated state with filename: ${filename}`);
        eventBus.emit("file-json-fetched", jsonString);
        eventBus.emit("file-state-changed");
        console.log("✅ FROM URL Emitted 'file-json-fetched' event with JSON string.");
        // ✅ Small delay to ensure event handlers process the JSON first
        await new Promise(resolve => setTimeout(resolve, 100));
        eventBus.emit("file-clean");
        console.log("✅ FROM URL Emitted 'file-clean' event successfully.");

        return jsonString;
    } catch (error) {
        console.error("❌ FROM URL Error fetching JSON:", error);
        return null;
    }
}
