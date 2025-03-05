// services/get-mandart-json-string-from-local-machine.js
// Handles local file selection and retrieves MandArt JSON data.

import { updateFileState , getFileLabel} from '../state/state-file.js';
import { eventBus } from '../state/state-all.js';
import { resetDropdownSelection } from '../state/state-dropdown-file-select.js';
import { validateMandArtState } from './validate-mandart-file.js';
/**
 * Handles file selection and reads a local MandArt file.
 * @returns {Promise<string>} JSON string of the file.
 */
export async function getMandartJsonStringFromLocalMachine() {
    console.log("📂 CLICK OPEN FROM LOCAL FILE: Opening local file dialog...");
    return new Promise((resolve, reject) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.mandart';
        fileInput.style.display = 'none';

        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files?.[0];

            if (!file) {
                reject(new Error("❌ No file selected"));
                document.body.removeChild(fileInput);
                return;
            }

            console.log("📂 CLICK OPEN FROM LOCAL FILE: File selected:", file.name);

            try {
                console.log("📂 CLICK OPEN FROM LOCAL FILE:Reading from local file..., file: ", file);
                const jsonString = await readFileToJsonString(file);
                console.log(`📂 CLICK OPENED LOCAL FILE: ${jsonString}`);
                let jsonData;
                try {
                    jsonData = JSON.parse(jsonString);
                } catch (parseError) {
                    alert("Invalid JSON format in the file.");
                    console.error("❌ Parsing error:", parseError);
                    reject(new Error("Invalid JSON format"));
                    document.body.removeChild(fileInput);
                    return;
                }
                // Validate the JSON data
                if (!validateMandArtState(jsonData)) {
                    alert("Invalid MandArt JSON data. Please select a file with the correct format.");

                    console.error("❌ Invalid MandArt JSON data");
                    reject(new Error("❌ Invalid MandArt JSON data"));
                    document.body.removeChild(fileInput);
                    return;
                }

                resetDropdownSelection();

                // Update file state with comprehensive data
                const success = updateFileState({
                    currentFilename: file.name,
                    source: 'local-machine',
                    lastLoadedJson: jsonString
                });

                console.log("!!!!!!!!!!!!!!!!File state updated:", getFileLabel);

                // Emit events for background processing
                eventBus.emit('file-json-fetched', jsonString);

                // Small delay to ensure all state is updated before processing
                setTimeout(() => {
                    eventBus.emit('file-clean');
                }, 100);

                // Resolve with JSON string
                resolve(jsonString);
            } catch (error) {
                console.error("❌ Error processing local file:", error.message);
                reject(error);
            } finally {
                document.body.removeChild(fileInput);
            }
        });

        document.body.appendChild(fileInput);
        fileInput.click();
    });
}

/**
 * Reads a file as JSON and returns a JSON string.
 * @param {File} file - The file to read.
 * @returns {Promise<string>} JSON string.
 */
function readFileToJsonString(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result); // Return raw JSON string
        reader.onerror = () => reject(new Error("❌ Failed to read file"));
        reader.readAsText(file);
    });
}