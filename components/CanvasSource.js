// CanvasSource.js

let drawingNameElement = null;
let sourcePathElement = null;

export function setupCanvasSource() {
    console.log("🎨 Initializing Canvas Source...");

    const titleContainer = document.getElementById("canvasSourceContainer");
    if (!titleContainer) {
        console.error("❌ setupCanvasSource: Missing #canvasSourceContainer element.");
        return;
    }

    titleContainer.innerHTML = `
        <h2 id="drawingName">No MandArt Loaded</h2>
        <p id="sourcePath">No source loaded</p>
    `;

    drawingNameElement = document.getElementById("drawingName");
    sourcePathElement = document.getElementById("sourcePath");

    // Subscribe to MandArtLoader updates
    window.mandArtLoader.addUIUpdateCallback(updateDisplay);

    // Return cleanup function
    return () => {
        drawingNameElement = null;
        sourcePathElement = null;
    };
}

function updateDisplay(data) {
    if (!drawingNameElement || !sourcePathElement) {
        console.error("❌ updateDisplay: UI elements not initialized.");
        return;
    }

    console.log("🎨 Updating Canvas Source display:", data);

    drawingNameElement.textContent = data.displayName;
    sourcePathElement.textContent = data.sourcePath;
}