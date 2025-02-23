import { initApp } from "../components/App.js";

function updateLayout() {
    const header = document.querySelector("header");
    const container = document.querySelector("#container");
    const canvas = document.getElementById("mandelbrotCanvas");

    if (header && container) {
        const headerHeight = header.offsetHeight || 120; // Default to 120px
        document.documentElement.style.setProperty("--header-height", `${headerHeight}px`);
        container.style.paddingTop = `${headerHeight}px`;

        console.log(`📏 Updated header height: ${headerHeight}px`);
    }

    // ✅ Ensure canvas size matches the MandArt image
    if (canvas && window.mandArtLoader && window.mandArtLoader.picdef) {
        const { imageWidth, imageHeight } = window.mandArtLoader.picdef;

        if (imageWidth && imageHeight) {
            canvas.width = imageWidth;
            canvas.height = imageHeight;

            console.log(`🖼️ Canvas resized to: ${imageWidth} x ${imageHeight}`);
        }
    }
}

// ✅ Apply on load & resize
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Starting MandArt Web...");
    updateLayout();
    initApp();
});

window.addEventListener("resize", updateLayout);
