// mandart_file_operations.js
/**
 * Functions for basic file operations with MandArt files
 */

/**
 * Saves data as a .mandart file
 * @param {Object} data - MandArt data to save
 * @param {string} filename - Base filename (without extension)
 */
export function saveMandartFile(data, filename) {
    // Create a JSON blob
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `${filename}.mandart`;
    
    // Trigger download
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
  
  /**
   * Reads a .mandart file
   * @param {File} file - The file to read
   * @returns {Promise<Object>} The parsed data
   */
  export function readMandartFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }
  
  /**
   * Gets current application state in MandArt format
   * @returns {Object} The current state
   */
  export function getCurrentState() {
    // This needs to be implemented based on your app's structure
    // Placeholder for the required format
    const state = {
      id: crypto.randomUUID(), // Modern browser API for UUID
      scale: 430,
      huesOptimizedForPrinter: [],
      yCenter: 0,
      imageWidth: 1100,
      imageHeight: 1000,
      nImage: 0,
      spacingColorFar: 5,
      hues: [],
      // Add other required properties...
    };
    
    // Get colors from the DOM
    const hueList = document.getElementById('hueList');
    if (hueList) {
      state.hues = Array.from(hueList.querySelectorAll('.hue-row')).map((row, index) => {
        const colorPicker = row.querySelector('input[type="color"]');
        const hex = colorPicker ? colorPicker.value : '#000000';
        
        // Convert hex to RGB
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        return {
          r,
          g,
          b,
          id: crypto.randomUUID(),
          num: index + 1,
          color: {
            red: r / 255,
            green: g / 255,
            blue: b / 255
          }
        };
      });
    }
    
    return state;
  }