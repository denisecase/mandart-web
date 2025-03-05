// wiring/wiring-modal-url-prompt.js
// ✅ Handles event wiring for the URL input modal.

import { getUIElement } from '../globals.js';
import { eventBus } from '../state/state-all.js';
import { getMandartJsonStringFromUrl } from '../services/get-mandart-json-string-from-url.js';
import ModalUrlPrompt from '../components/ModalUrlPrompt.js';

/**
 * ✅ **Initialize wiring for the URL input modal.**
 */
export function initModalUrlPromptWiring() {
  console.log("🔗 Wiring: Initializing URL modal events...");

  // Create an instance of the modal component
  const modalComponent = new ModalUrlPrompt();

  const urlModal = getUIElement('urlModal');
  const urlInput = getUIElement('urlInput');
  const loadButton = getUIElement('loadUrlBtn');
  const cancelButton = getUIElement('cancelUrlBtn');

  if (!urlModal || !urlInput || !loadButton || !cancelButton) {
    console.warn("⚠️ Wiring: Missing elements for URL modal.");
    return;
  }

  // Listen for the 'request-url' event
  eventBus.subscribe('request-url', () => {
    console.log("🌐 URL Modal: Received request-url event");
    // Use the component method instead of emitting another event
    modalComponent.show();
  });

  // Load button event
  loadButton.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (url) {
      console.log(`🌐 URL Modal: Load button clicked with URL: ${url}`);
      
      // Hide the modal first using the component
      modalComponent.hide();
      
      // Use the existing service to load the URL
      const jsonString = await getMandartJsonStringFromUrl(url);
      
      if (!jsonString) {
        console.error("❌ URL Modal: Failed to load from URL");
        // Optional: Show error message to user
      }
    } else {
      console.warn("⚠️ URL Modal: No URL provided");
      // Optional: Show an error message to the user
    }
  });

  // Enter key submission
  urlInput.addEventListener('keyup', async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const url = urlInput.value.trim();
      if (url) {
        console.log(`🌐 URL Modal: Enter key pressed with URL: ${url}`);
        
        // Hide the modal using the component
        modalComponent.hide();
        
        // Use the existing service to load the URL
        const jsonString = await getMandartJsonStringFromUrl(url);
        
        if (!jsonString) {
          console.error("❌ URL Modal: Failed to load from URL");
          // Optional: Show error message to user
        }
      }
    }
  });

  // Cancel button event
  cancelButton.addEventListener('click', () => {
    console.log("🌐 URL Modal: Cancel button clicked");
    modalComponent.hide();
  });

  // If you still need to support the toggle-url-modal event
  eventBus.subscribe('toggle-url-modal', ({ isVisible }) => {
    if (isVisible) {
      modalComponent.show();
    } else {
      modalComponent.hide();
    }
  });
}