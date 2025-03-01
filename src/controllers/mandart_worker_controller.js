import { 
    IS_GITHUB_PAGES, 
    BASE_PATH
  } from "../constants.js";
  
  /**
   * Simple Worker Controller
   * Uses a proxy pattern where the worker handles coordination
   * but the main thread does the WASM calculations
   */
  class MandartWorkerController {
      constructor() {
          console.log("🔄 Initializing MandArt worker controller...");
          this.pendingRequests = new Map();
          
          // Create the worker with proper path based on environment
          const workerPath = IS_GITHUB_PAGES 
              ? `${BASE_PATH}mandart-worker.js` 
              : './mandart-worker.js';
              
          console.log(`Creating worker at path: ${workerPath}`);
          this.worker = new Worker(workerPath);
          
          // Set up message handling
          this.worker.onmessage = (e) => {
              const { type, imageData, status, message, id, shapeInputs, colorInputs } = e.data;
              
              if (type === 'loaded') {
                  console.log('✅ Worker initialized successfully');
                  // Signal that worker is ready
                  window.dispatchEvent(new CustomEvent('worker-ready'));
              } else if (type === 'progress') {
                  this.updateProgressUI(status, message);
              } else if (type === 'result') {
                  this.updateCanvas(imageData);
              } else if (type === 'error') {
                  console.error('❌ Worker error:', message);
                  this.showErrorMessage(message);
              } else if (type === 'cache_cleared') {
                  console.log('🧹 Worker cache cleared');
              } else if (type === 'proxy_request') {
                  // Handle the WASM calculation in the main thread
                  this.handleProxyRequest(id, shapeInputs, colorInputs);
              }
          };
          
          // Initialize the worker
          this.worker.postMessage({ type: 'load' });
      }
      
      // Handle a proxy request from the worker
      async handleProxyRequest(id, shapeInputs, colorInputs) {
          // Get the current WASM module from the global scope
          // This assumes your main code has already loaded it
          const wasmModule = window.wasmModule;
          
          if (!wasmModule) {
              this.worker.postMessage({
                  type: 'error',
                  message: 'WASM module not loaded in main thread',
                  id: id
              });
              return;
          }
          
          try {
              // Call the WASM function in the main thread
              this.updateProgressUI('calculating', 'Generating Mandelbrot image...');
              console.log('🧮 Calculating Mandelbrot set in main thread...');
              
              // Use the appropriate function from your WASM module
              // This might need to be adjusted based on your actual API
              const imageData = wasmModule.generateMandelbrotImage(shapeInputs, colorInputs);
              
              // Send the result back to the worker
              this.worker.postMessage({
                  type: 'proxy_result',
                  imageData: imageData,
                  id: id,
                  shapeInputs: shapeInputs
              });
          } catch (error) {
              console.error('❌ Error in WASM calculation:', error);
              this.worker.postMessage({
                  type: 'error',
                  message: `Error in WASM calculation: ${error.message}`,
                  id: id
              });
          }
      }
      
      generateImage(shapeInputs, colorInputs) {
          this.showLoadingIndicator();
          
          // Generate a unique ID for this request
          const requestId = Date.now().toString();
          
          console.log("🖌️ Sending shape and color inputs to worker for processing");
          
          // Send the inputs to the worker
          this.worker.postMessage({
              type: 'generate',
              shapeInputs: shapeInputs,
              colorInputs: colorInputs,
              id: requestId
          });
      }
      
      clearCache() {
          console.log("🧹 Clearing worker cache...");
          this.worker.postMessage({ type: 'clear_cache' });
      }
      
      // Add UI update methods
      updateProgressUI(status, message) {
          console.log(`⏳ Progress: ${status} - ${message}`);
          const progressElement = document.getElementById('progress-message');
          if (progressElement) {
              progressElement.textContent = message;
          }
      }
      
      updateCanvas(imageData) {
          console.log("🎨 Updating canvas with generated image data");
          // Update canvas with the received image data
          const canvas = document.getElementById('mandelbrotCanvas');
          if (!canvas) {
              console.error("❌ Canvas not found - cannot update");
              return;
          }
          
          const ctx = canvas.getContext('2d');
          const imageDataObj = new ImageData(
              new Uint8ClampedArray(imageData),
              canvas.width,
              canvas.height
          );
          
          ctx.putImageData(imageDataObj, 0, 0);
          this.hideLoadingIndicator();
      }
      
      showLoadingIndicator() {
          console.log("⏳ Showing loading indicator");
          const canvasContainer = document.getElementById('canvasContainer');
          if (!canvasContainer) return;
          
          // Create loading indicator if it doesn't exist
          if (!document.getElementById('wasm-loading-indicator')) {
              const loader = document.createElement('div');
              loader.id = 'wasm-loading-indicator';
              loader.className = 'loading-indicator';
              loader.innerHTML = `
                  <div class="spinner"></div>
                  <div id="progress-message">Processing Mandelbrot set...</div>
              `;
              canvasContainer.appendChild(loader);
          }
      }
      
      hideLoadingIndicator() {
          console.log("✅ Hiding loading indicator");
          const loader = document.getElementById('wasm-loading-indicator');
          if (loader) {
              // Fade out instead of immediate removal
              loader.style.transition = 'opacity 0.5s';
              loader.style.opacity = '0';
              setTimeout(() => loader.remove(), 500);
          }
      }
      
      showErrorMessage(message) {
          console.error("❌ Showing error message:", message);
          const canvasContainer = document.getElementById('canvasContainer');
          if (!canvasContainer) return;
          
          const errorDiv = document.createElement('div');
          errorDiv.className = 'error-message';
          errorDiv.textContent = message;
          canvasContainer.appendChild(errorDiv);
      }
  }
  
  export default MandartWorkerController;