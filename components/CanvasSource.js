export function setupCanvasSource(getCurrentMandArt) {
    const titleContainer = document.getElementById("canvasSourceContainer");
    if (!titleContainer) {
        console.error("❌ setupCanvasSource: Missing #canvasSourceContainer element.");
        return;
    }

    titleContainer.innerHTML = `
        <h2 id="drawingName">Title Will Appear Here</h2>
        <p id="sourcePath">(No source loaded)</p>
    `;

    const drawingNameElement = document.getElementById("drawingName");
    const sourcePathElement = document.getElementById("sourcePath");

    function updateCanvasSource() {
        if (typeof getCurrentMandArt !== "function") {
            console.error("❌ setupCanvasSource: getCurrentMandArt is not a function.");
            return;
        }
        
        if (!mandart) {
            console.warn("⚠️ No MandArt loaded. Resetting title and source.");
            drawingNameElement.textContent = "No MandArt Loaded";
            sourcePathElement.textContent = "(No source loaded)";
            return;
        }

        const mandartName = mandart.name?.trim() ? mandart.name : "Untitled MandArt";
        const mandartSource = mandart.source?.trim() ? mandart.source : "(Unknown Source)";
        
        console.log(`🎨 Updating Canvas Source: ${mandartName}, Source: ${mandartSource}`);

        drawingNameElement.textContent = mandartName;
        sourcePathElement.textContent = `Source: ${mandartSource}`;
    }
    function dispose() {
        titleContainer.innerHTML = "";
    }

    return { updateCanvasSource, dispose };
}
