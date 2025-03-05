/** mandart_png_helper.js
 *  PNG Helper Functions for MandArt...................
*/ 
/**
 * Creates a canvas and displays the image data from the WASM module
 *
 * @param {Object} imageData - Image data from api_get_image_from_inputs
 * @param {Uint8Array} imageData.data - The RGBA pixel data
 * @param {number} imageData.width - The image width
 * @param {number} imageData.height - The image height
 * @param {string} containerId - ID of the container to append the canvas to
 * @returns {HTMLCanvasElement} The created canvas element
 */
function displayMandelbrotImage(imageData, containerId = "canvas-container") {
    // Get or create container
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      document.body.appendChild(container);
    }
  
    // Create canvas
    const canvas = document.createElement("canvas");
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    canvas.style.border = "1px solid #ccc";
  
    // Draw the image
    const ctx = canvas.getContext("2d");
    const imgData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );
    ctx.putImageData(imgData, 0, 0);
  
    // Add to container
    container.innerHTML = ""; // Clear previous content
    container.appendChild(canvas);
  
    return canvas;
  }

  /**
 * Creates a download link for a canvas as a PNG
 *
 * @param {HTMLCanvasElement} canvas - The canvas to convert to PNG
 * @param {string} filename - The filename for the download
 * @param {string} containerId - ID of the container to append the download link to
 * @returns {HTMLAnchorElement} The created download link
 */
function createPngDownloadLink(
    canvas,
    filename = "mandelbrot.png",
    containerId = "download-container"
  ) {
    // Convert canvas to data URL
    const pngUrl = canvas.toDataURL("image/png");
  
    // Get or create container
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      document.body.appendChild(container);
    }
  
    // Create download link
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = filename;
    downloadLink.textContent = `Download ${filename}`;
    downloadLink.style.display = "block";
    downloadLink.style.margin = "10px 0";
    downloadLink.style.padding = "5px 10px";
    downloadLink.style.backgroundColor = "#f0f0f0";
    downloadLink.style.border = "1px solid #ccc";
    downloadLink.style.borderRadius = "4px";
    downloadLink.style.textAlign = "center";
    downloadLink.style.textDecoration = "none";
    downloadLink.style.color = "#333";
  
    // Add hover effect
    downloadLink.onmouseover = () => {
      downloadLink.style.backgroundColor = "#e0e0e0";
    };
    downloadLink.onmouseout = () => {
      downloadLink.style.backgroundColor = "#f0f0f0";
    };
  
    // Add to container
    container.innerHTML = ""; // Clear previous content
    container.appendChild(downloadLink);
  
    return downloadLink;
  }
  
  /**
   * Complete workflow: generate image, display on canvas, and create download link
   *
   * @param {Object} shapeInputs - Shape inputs for the Mandelbrot set
   * @param {Object} colorInputs - Color inputs for the Mandelbrot set
   * @param {string} filename - Filename for the PNG download
   * @returns {Promise<Object>} Object containing the canvas and download link
   */
  async function generateAndDownloadMandelbrot(
    shapeInputs,
    colorInputs,
    filename = "mandelbrot.png"
  ) {
    // Import the WASM module if not already imported
    if (
      typeof window.mandartModule === "undefined" ||
      typeof window.mandartModule.api_get_image_from_inputs === "undefined"
    ) {
      console.log("Initializing MandArt WASM module...");
      const mandartModule = await import("./mandart_wasm.js");
      await mandartModule.default();
      window.mandartModule = mandartModule;
      console.log("MandArt WASM module initialized!");
    }
  
    try {
      // Generate the image
      console.time("Image generation");
      const imageData = await window.mandartModule.api_get_image_from_inputs(
        shapeInputs,
        colorInputs
      );
      console.timeEnd("Image generation");
  
      // Display on canvas
      const canvas = displayMandelbrotImage(imageData);
  
      // Create download link
      const downloadLink = createPngDownloadLink(canvas, filename);
  
      return { canvas, downloadLink, imageData };
    } catch (error) {
      console.error("Error generating Mandelbrot image:", error);
      throw error;
    }
  }
  
  // Export the helper functions
  export {
    displayMandelbrotImage,
    createPngDownloadLink,
    generateAndDownloadMandelbrot,
  };
  
  