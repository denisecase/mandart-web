document.addEventListener("DOMContentLoaded", () => {
    loadPresets(); // Populate preset dropdown

    document.getElementById("loadJsonBtn").addEventListener("click", () => {
        document.getElementById("fileInput").click();
    });

    document.getElementById("fileInput").addEventListener("change", handleFileUpload);
    document.getElementById("presetSelector").addEventListener("change", loadPreset);

    // Initial Mandelbrot render
    drawMandelbrot();
});
