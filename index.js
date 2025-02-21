import { initApp } from "../components/App.js";
function updateLayout() {
    const header = document.querySelector("header");
    const container = document.querySelector("#container");

    if (header && container) {
        const headerHeight = header.offsetHeight || 120; // Default to 120px

        // ✅ Set CSS variable dynamically
        document.documentElement.style.setProperty("--header-height", `${headerHeight}px`);

        // ✅ Use padding-top instead of margin-top
        container.style.paddingTop = `${headerHeight}px`;

        console.log(`📏 Updated header height: ${headerHeight}px`);
    }
}

// ✅ Apply on load & resize
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Starting MandArt Web...");
    updateLayout();
    initApp();
});

window.addEventListener("resize", updateLayout);
