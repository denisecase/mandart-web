// mandart-worker.js - Simple worker for offloading coordination
// This version does NOT try to import the WASM module directly

// Cache for computed results
let resultCache = new Map();
let cacheEnabled = true;

// Listen for messages from the main thread
self.onmessage = function(e) {
  try {
    const { type, shapeInputs, colorInputs, id, imageData } = e.data;
    
    if (type === 'load') {
      // Just send back success message
      // The actual WASM will be handled in the main thread
      self.postMessage({ type: 'loaded' });
      return;
    }
    
    if (type === 'generate') {
      // Start with progress update
      self.postMessage({ 
        type: 'progress', 
        status: 'starting',
        message: 'Starting Mandelbrot calculation...'
      });
      
      // Check if we already have this in cache
      if (cacheEnabled) {
        const cacheKey = generateCacheKey(shapeInputs);
        if (resultCache.has(cacheKey)) {
          const cachedResult = resultCache.get(cacheKey);
          self.postMessage({
            type: 'result',
            imageData: cachedResult,
            id: id,
            cached: true
          });
          return;
        }
      }
      
      // Request the main thread to handle the WASM calculation
      self.postMessage({ 
        type: 'proxy_request', 
        shapeInputs: shapeInputs,
        colorInputs: colorInputs,
        id: id
      });
      
      return;
    }
    
    if (type === 'proxy_result') {
      // Main thread has sent back the calculation result
      // We can cache this if needed
      if (cacheEnabled && shapeInputs) {
        const cacheKey = generateCacheKey(shapeInputs);
        resultCache.set(cacheKey, imageData);
        
        // Limit cache size
        if (resultCache.size > 10) {
          const firstKey = Array.from(resultCache.keys())[0];
          resultCache.delete(firstKey);
        }
      }
      
      // Forward the result back to the main thread
      self.postMessage({
        type: 'result',
        imageData: imageData,
        id: id
      });
      
      return;
    }
    
    if (type === 'clear_cache') {
      resultCache.clear();
      self.postMessage({ type: 'cache_cleared' });
      return;
    }
    
    if (type === 'set_cache_enabled') {
      cacheEnabled = e.data.enabled;
      self.postMessage({ 
        type: 'cache_state_changed', 
        enabled: cacheEnabled 
      });
      return;
    }
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      message: error.toString()
    });
  }
};

// Generate a cache key from shape inputs
function generateCacheKey(shapeInputs) {
  return JSON.stringify({
    width: shapeInputs.image_width,
    height: shapeInputs.image_height,
    max_iter: shapeInputs.iterations_max,
    scale: shapeInputs.scale,
    x: shapeInputs.x_center,
    y: shapeInputs.y_center
  });
}
