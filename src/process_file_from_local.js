// process_file_from_local.js

import { processMandartData } from './process_common.js';

/**
 * Process a local MandArt file
 * @param {File} file - File object from input[type=file]
 * @returns {Promise<void>}
 */
export async function processFileFromLocal(file) {
    try {
        console.log(`📂 PROCESS_FILE_LOCAL Processing local file: ${file.name}`);
        if (!file) {
            console.error("❌ File is null or undefined");
            return;
        }
        
        // Read file content
        const content = await readFileAsJson(file);
        console.log(`PROCESS_FILE_LOCAL ✅ File content loaded for ${file.name}`);
        
        // Process the data using common functionality
        await processMandartData(content, file.name);
        
    } catch (error) {
        console.error(`❌ Error processing local file: ${error.message}`, error);
    }
}

/**
 * Read a file as JSON
 * @param {File} file - File to read
 * @returns {Promise<Object>} Parsed JSON content
 */
function readFileAsJson(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const content = JSON.parse(event.target.result);
                resolve(content);
            } catch (error) {
                reject(new Error(`Failed to parse file as JSON: ${error.message}`));
            }
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsText(file);
    });
}

/**
 * Show file selector dialog and process selected file
 * @returns {Promise<void>}
 */
export async function showFileSelectDialog() {
    return new Promise((resolve) => {
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.mandart,.json';
        fileInput.style.display = 'none';
        
        // Handle file selection
        fileInput.addEventListener('change', async (event) => {
            if (event.target.files && event.target.files[0]) {
                const file = event.target.files[0];
                try {
                    await processFileFromLocal(file);
                    resolve(true);
                } catch (error) {
                    console.error("Error processing file:", error);
                    resolve(false);
                }
            } else {
                resolve(false);
            }
            
            // Clean up
            document.body.removeChild(fileInput);
        });
        
        // Handle cancel
        fileInput.addEventListener('cancel', () => {
            document.body.removeChild(fileInput);
            resolve(false);
        });
        
        // Add to document and trigger click
        document.body.appendChild(fileInput);
        fileInput.click();
    });
}