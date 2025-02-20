import { initApp } from "../components/App.js";

// ✅ Defer everything to App.js
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Starting MandArt Web...");
    initApp();
});
