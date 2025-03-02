// process_file_from_url.js

import { processMandartData } from './process_common.js';

/**
 * Process a MandArt file from a URL
 * @param {string} url - URL to the MandArt file
 * @param {string} [filename] - Optional filename to use
 * @returns {Promise<void>}
 */
export async function processFileFromUrl(url, filename = 'mandart-from-url') {
    try {
        console.log(`📂 PROCESS_FILE_URL Processing file from URL: ${url}`);
        if (!url) {
            console.error("❌ URL is null or undefined");
            return;
        }
        
        // Extract filename from URL if not provided
        if (filename === 'mandart-from-url') {
            try {
                const urlObj = new URL(url);
                const pathParts = urlObj.pathname.split('/');
                const urlFilename = pathParts[pathParts.length - 1];
                if (urlFilename) {
                    filename = urlFilename.replace(/\.json$/, '');
                }
            } catch (e) {
                // Use default if URL parsing fails
                console.warn("⚠️ Could not extract filename from URL");
            }
        }
        
        console.log(`PROCESS_FILE_URL 🔄 Fetching file from URL: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`❌ Failed to fetch file (status ${response.status}): ${response.statusText}`);
            throw new Error(`Failed to fetch file (status ${response.status})`);
        }
        
        const content = await response.json();
        console.log(`PROCESS_FILE_URL ✅ File content loaded from ${url}`);
        
        // Process the data using common functionality
        await processMandartData(content, filename);
        
    } catch (error) {
        console.error(`❌ Error processing file from URL: ${error.message}`, error);
    }
}

/**
 * Show a URL input dialog and process the file
 * @returns {Promise<void>}
 */
export async function showUrlInputDialog() {
    return new Promise((resolve) => {
        // Check if there's already a dialog open
        let dialog = document.getElementById('url-input-dialog');
        if (dialog) {
            document.body.removeChild(dialog);
        }
        
        // Create dialog
        dialog = document.createElement('div');
        dialog.id = 'url-input-dialog';
        dialog.className = 'url-modal';
        
        dialog.innerHTML = `
            <div class="url-modal-titlebar">Enter MandArt URL</div>
            <div class="url-modal-content">
                <textarea class="url-input" 
                    placeholder="Enter URL to a .mandart file..."></textarea>
                <div class="modal-buttons">
                    <button class="btn btn-secondary" id="cancel-url-btn">Cancel</button>
                    <button class="btn btn-primary" id="load-url-btn">Load</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Get elements
        const urlInput = dialog.querySelector('.url-input');
        const loadBtn = document.getElementById('load-url-btn');
        const cancelBtn = document.getElementById('cancel-url-btn');
        
        // Focus input
        setTimeout(() => urlInput.focus(), 100);
        
        // Handle load button
        loadBtn.addEventListener('click', async () => {
            const url = urlInput.value.trim();
            if (url) {
                document.body.removeChild(dialog);
                try {
                    await processFileFromUrl(url);
                    resolve(true);
                } catch (error) {
                    console.error("Error processing URL:", error);
                    resolve(false);
                }
            } else {
                urlInput.focus();
            }
        });
        
        // Handle cancel button
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(dialog);
            resolve(false);
        });
        
        // Handle Enter key
        urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                loadBtn.click();
            }
        });
    });
}