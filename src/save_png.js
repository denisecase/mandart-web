// Import the PNG helper function
import { createPngDownloadLink } from './mandart_png_helper.js';

export function initSavePngButton() {
    console.log("SAVE_PNG initSavePngButton");
    const savePngBtn = document.getElementById('savePngBtn');

    if (savePngBtn) {
        savePngBtn.addEventListener('click', () => {
            saveMandelbrotAsPng();
        });
    }
}

function saveMandelbrotAsPng() {
    console.log("SAVE_PNG saveMandelbrotAsPng");
    // Get the canvas
    const canvas = document.getElementById('canvas');

    if (!canvas) {
        console.error('Canvas not found');
        return;
    }

    // Get the selected filename from dropdown
    const fileSelect = document.getElementById('fileSelect');
    let selectedName = "mandart";

    if (fileSelect && fileSelect.value) {
        // Extract the filename from the selected option
        selectedName = fileSelect.value;

        // Remove file extension if present
        selectedName = selectedName.replace(/\.[^/.]+$/, "");

        console.log(`Using selected name as prefix: ${selectedName}`);
    }

    // Generate a filename with date and time
    const now = new Date();
    const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    const filename = `${selectedName}_${timestamp}.png`;

    // Create or get the download container
    let container = document.getElementById('download-container');
    if (container) {
        container.innerHTML = ''; // Clear previous content
    }
    else {
        container = document.createElement('div');
        container.id = 'download-container';
        document.body.appendChild(container);
           // Add it to the canvas section
           const canvasSection = document.getElementById('canvasSection');
           if (canvasSection) {
               canvasSection.appendChild(container);
           } else {
               document.body.appendChild(container);
           }
    }

    // Create the download link and auto-click it
    try {
        const downloadLink = createPngDownloadLink(canvas, filename, 'download-container');
        
        // Automatically trigger the download
        console.log("Auto-clicking download link");
        setTimeout(() => {
            downloadLink.click();
        }, 100); // Small delay to ensure link is fully created
        
        // Still show the link for a few seconds in case the auto-download fails
        setTimeout(() => {
            const container = document.getElementById('download-container');
            if (container) {
                container.style.animation = 'fade-in 0.3s ease-in-out reverse';
                setTimeout(() => container.remove(), 300);
            }
        }, 5000); // Shortened time since we're auto-downloading
        
    } catch (error) {
        console.error('Error creating PNG download:', error);
        alert('Failed to create PNG download. See console for details.');
    }
}
