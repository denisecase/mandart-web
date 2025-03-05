// index.js
// Entry point for the MandArt Web application

import { initApp } from './app.js';
import {IS_GITHUB_PAGES, BASE_PATH} from './constants.js'


// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // console.log(`Environment: ${IS_GITHUB_PAGES ? 'GitHub Pages' : 'Local Development'}`);
    // console.log(`Base Path: ${BASE_PATH}`);
    
    try {
        await initApp();
    } catch (error) {
        console.error("Failed to initialize app:", error);
    }
});

// Register service worker for PWA support
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        const swPath = IS_GITHUB_PAGES
            ? `${BASE_PATH}service-worker.js`
            : './service-worker.js';

        window.addEventListener('load', () => {
            navigator.serviceWorker.register(swPath)
                .then(registration => {
                    console.log('ServiceWorker registered successfully:', registration.scope);
                })
                .catch(error => {
                    console.error('ServiceWorker registration failed:', error);
                });
        });
    }
}

// Register service worker, but don't make initialization wait for it
// registerServiceWorker();
