// services/file-saver.js
// ✅ Handles saving MandArt files and exporting PNGs

import { getState } from '../state/state-all.js';
import { getUIElement } from '../globals.js';

/**
 * ✅ Save the current MandArt state as a JSON file
 * @param {string} [customFilename] - Optional custom filename
 * @returns {Promise<boolean>} Success status
 */
export async function saveMandartFile(customFilename) {
    try {
        // Get current state (including file name)
        const state = getState();

        // Prepare MandArt format data
        const mandartData = {
            id: crypto.randomUUID(),
            shape: state.shape,
            color: state.color
        };

        // Stringify with proper formatting
        const jsonData = JSON.stringify(mandartData, null, 2);

        // Use customFilename if provided, otherwise get the file name from state (with fallback)
        const filename = customFilename || state.file || 'untitled';

        // Create download link
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `${filename}.mandart`;
        downloadLink.style.display = 'none';

        // Use reactive helper to access the body element
        const body = getUIElement('body');
        body.appendChild(downloadLink);
        downloadLink.click();
        body.removeChild(downloadLink);
        URL.revokeObjectURL(url);

        console.log(`✅ FILE: Saved MandArt file: ${filename}.mandart`);
        return true;
    } catch (error) {
        console.error("❌ FILE: Error saving MandArt file:", error);
        return false;
    }
}

/**
 * ✅ Save the current canvas as a PNG file
 * @returns {Promise<boolean>} Success status
 */
export async function savePngFile() {
    try {
        // Use the reactive architecture helper to get the canvas element
        const canvas = getUIElement('canvas');
        if (!canvas) {
            console.error("❌ FILE: Canvas not found");
            return false;
        }

        // Generate a timestamped filename inline
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${timestamp}.png`;

        // Convert canvas to PNG data URL
        const dataUrl = canvas.toDataURL('image/png');

        const downloadLink = document.createElement('a');
        downloadLink.href = dataUrl;
        downloadLink.download = filename;

        // Use reactive helper to access the body element
        const body = getUIElement('body');
        body.appendChild(downloadLink);
        downloadLink.click();
        body.removeChild(downloadLink);

        console.log(`✅ FILE: Saved PNG file: ${filename}`);
        return true;
    } catch (error) {
        console.error("❌ FILE: Error saving PNG file:", error);
        return false;
    }
}
