// open_mandart.js

import { showFileSelectDialog } from './process_file_from_local.js';
import { showUrlInputDialog } from './process_file_from_url.js';

/**
 * Initialize the Open File button functionality
 */
export function initOpenFileButton() {
    console.log("OPEN_MANDART initOpenFileButton");
    const openFileBtn = document.getElementById('openFileBtn');
    
    if (openFileBtn) {
        openFileBtn.addEventListener('click', handleOpenFile);
    }
}

/**
 * Initialize the Open from URL button functionality (if present)
 */
export function initOpenUrlButton() {
    console.log("OPEN_MANDART initOpenUrlButton");
    const openUrlBtn = document.getElementById('openUrlBtn');
    
    if (openUrlBtn) {
        openUrlBtn.addEventListener('click', handleOpenUrl);
    }
}

/**
 * Handle Open File button click
 */
async function handleOpenFile() {
    console.log("OPEN_MANDART Opening file select dialog");
    try {
        await showFileSelectDialog();
    } catch (error) {
        console.error("Error opening file:", error);
    }
}

/**
 * Handle Open from URL button click
 */
async function handleOpenUrl() {
    console.log("OPEN_MANDART Opening URL input dialog");
    try {
        await showUrlInputDialog();
    } catch (error) {
        console.error("Error opening URL:", error);
    }
}

/**
 * Initialize all open buttons
 */
export function initAllOpenButtons() {
    initOpenFileButton();
    initOpenUrlButton();
}