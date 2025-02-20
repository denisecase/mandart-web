import { initApp } from "../components/App.js";

function updateMainMargin() {
    requestAnimationFrame(() => {
        const header = document.querySelector("header");
        const main = document.querySelector("main");

        if (header && main) {
            const headerHeight = header.getBoundingClientRect().height; // Ensures we get the rendered height
            main.style.marginTop = `${headerHeight}px`; // Apply correct margin
            console.log(`📏 Adjusted margin-top of main: ${headerHeight}px`);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Starting MandArt Web...");

    // Run on page load and resize
    setTimeout(updateMainMargin, 100); // Small delay to ensure rendering
    window.addEventListener("resize", updateMainMargin);
    initApp();
});