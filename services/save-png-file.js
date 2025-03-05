import { getState } from '../state/state-all.js';
import { getUIElement } from '../globals.js';
import FileState from '../models/FileState.js';
import { getFileLabel, getCurrentFilename} from '../state/state-file.js';

/**
 * ✅ Save the current canvas as a PNG file
 * @returns {Promise<boolean>} Success status
 */
export async function savePngFile() {
    console.log("💾 FILE: Saving PNG file...", getFileLabel());
    console.log("💾 FILE: Saving PNG file...", getCurrentFilename());

    try {
        // Use the reactive architecture helper to get the canvas element
        const canvas = getUIElement('canvas');
        if (!canvas) {
            console.error("❌ FILE: Canvas not found");
            return false;
        }
        console.log("💾 FILE: Saving PNG file...", FileState);

        // Generate a timestamped filename inline
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        // Get current state to derive the label
        const label = getFileLabel();

        // Compose filename: label_timestamp.png
        const filename = `${label}_${timestamp}.png`;
        
        // Convert the canvas content to a Blob (PNG)
        canvas.toBlob((blob) => {
            if (!blob) {
                console.error("❌ FILE: Failed to create blob from canvas");
                return;
            }
            // Create a temporary URL for the blob
            const url = URL.createObjectURL(blob);

            // Create an anchor element and trigger download
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            // Clean up the URL object
            URL.revokeObjectURL(url);

            console.log(`✅ FILE: Saved PNG file: ${filename}`);
        }, 'image/png');

        return true;

      
    } catch (error) {
        console.error("❌ FILE: Error saving PNG file:", error);
        return false;
    }
}
