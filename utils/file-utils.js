// utils/file-utils.js
// File utility functions for MandArt Web application

/**
 * Read a file as JSON
 * @param {File} file - File to read
 * @returns {Promise<Object>} Parsed JSON content
 */
export function readFileAsJson(file) {
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
 * Download data as a file
 * @param {Object|string} data - Data to download
 * @param {string} filename - Name of the file
 * @param {string} mimeType - MIME type of the file
 * @returns {boolean} Success status
 */
export function downloadFile(data, filename, mimeType = 'application/json') {
    try {
        // Convert data to string if it's an object
        const content = typeof data === 'object' 
            ? JSON.stringify(data, null, 2) 
            : data;
        
        // Create blob
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        // Add to document, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up URL object
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        return true;
    } catch (error) {
        console.error("Error downloading file:", error);
        return false;
    }
}

/**
 * Create a timestamp string for filenames
 * @returns {string} Timestamp string (YYYYMMDD_HHMMSS)
 */
export function getTimestampString() {
    const now = new Date();
    
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

/**
 * Clean a filename by removing invalid characters
 * @param {string} filename - Filename to clean
 * @returns {string} Cleaned filename
 */
export function cleanFilename(filename) {
    // Replace invalid characters with underscores
    return filename
        .replace(/[\/\\:*?"<>|]/g, '_')
        .replace(/\s+/g, '_');
}

/**
 * Extract filename from path
 * @param {string} path - File path
 * @returns {string} Filename without path
 */
export function extractFilename(path) {
    return path.split('/').pop().split('\\').pop();
}

/**
 * Get the file extension
 * @param {string} filename - Filename
 * @returns {string} File extension without dot
 */
export function getFileExtension(filename) {
    return filename.split('.').pop();
}

/**
 * Remove the file extension
 * @param {string} filename - Filename
 * @returns {string} Filename without extension
 */
export function removeFileExtension(filename) {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.substring(0, lastDotIndex) : filename;
}

/**
 * Create a data URL from a file
 * @param {File} file - File object
 * @returns {Promise<string>} Data URL
 */
export function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            resolve(event.target.result);
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsDataURL(file);
    });
}

/**
 * Show a file selection dialog
 * @param {Object} options - Dialog options
 * @param {string} options.accept - Accepted file types
 * @param {boolean} options.multiple - Allow multiple files
 * @returns {Promise<File|File[]>} Selected file(s)
 */
export function showFileSelectDialog(options = {}) {
    return new Promise((resolve) => {
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = options.accept || '';
        fileInput.multiple = !!options.multiple;
        fileInput.style.display = 'none';
        
        // Handle file selection
        fileInput.addEventListener('change', (event) => {
            if (event.target.files) {
                if (options.multiple) {
                    resolve(Array.from(event.target.files));
                } else {
                    resolve(event.target.files[0]);
                }
            } else {
                resolve(null);
            }
            
            // Clean up
            document.body.removeChild(fileInput);
        });
        
        // Handle cancel
        fileInput.addEventListener('cancel', () => {
            document.body.removeChild(fileInput);
            resolve(null);
        });
        
        // Add to document and trigger click
        document.body.appendChild(fileInput);
        fileInput.click();
    });
}
