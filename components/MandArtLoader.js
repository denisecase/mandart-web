import { loadPrecomputedGrid } from "../utils/GridUtils.js";
import { rgbToHex, hexToRgb } from "../utils/ColorUtils.js";

let currentMandArt = null;
let currentMandArtPath = ""; // Stores full path of loaded MandArt
let hues = [];

/**
 * Loads a MandArt file from a given source (URL, JSON object, or local file).
 */
export async function loadMandArt(source, imagePath, name) {
    console.log("📥 Loading MandArt...", { source, imagePath, name });

    try {
        let jsonData;
        if (typeof source === "string" && (source.startsWith("http") || source.startsWith("assets/"))) {
            console.log(`🌐 Fetching MandArt JSON from: ${source}`);
            const response = await fetch(source);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            jsonData = await response.json();
            currentMandArtPath = source; // Store full path
        } else {
            jsonData = source; // Already parsed JSON
            currentMandArtPath = name; // Use name for file identification
        }

        console.log("✅ MandArt JSON Loaded:", jsonData);
        await readFromMandart(jsonData, name, imagePath);
    } catch (error) {
        console.error("❌ Failed to load MandArt:", error);
    }
}

/**
 * Processes and applies the MandArt data.
 */
export async function readFromMandart(jsonData, name, imagePath = "") {
    console.log("🖌️ Applying MandArt data...", jsonData);

    try {
        if (!jsonData || !jsonData.hues || !Array.isArray(jsonData.hues)) {
            throw new Error("❌ MandArt JSON is missing 'hues' or it's not an array.");
        }

        // ✅ Normalize hues (handle both formats)
        hues = jsonData.hues.map(hue => ({
            r: hue.r !== undefined ? Math.round(hue.r) : Math.round((hue.color?.red ?? 0) * 255),
            g: hue.g !== undefined ? Math.round(hue.g) : Math.round((hue.color?.green ?? 0) * 255),
            b: hue.b !== undefined ? Math.round(hue.b) : Math.round((hue.color?.blue ?? 0) * 255),
        }));

        console.log("✅ Processed hues for UI:", hues);

        // ✅ Update UI with hues
        updateHueUI(hues);

        // ✅ Store current MandArt
        currentMandArt = jsonData;
        currentMandArtPath = imagePath || name;

        // ✅ Resize canvas if needed
        const canvas = document.getElementById("mandelbrotCanvas");
        if (jsonData.imageWidth && jsonData.imageHeight) {
            canvas.width = jsonData.imageWidth;
            canvas.height = jsonData.imageHeight;
            console.log(`🎨 Resized canvas to: ${canvas.width}x${canvas.height}`);
        } else {
            console.warn("⚠️ Missing image width/height in MandArt JSON.");
        }

        // ✅ Update the displayed drawing name
        const drawingName = document.getElementById("drawingName");
        if (drawingName) drawingName.textContent = name;

    } catch (error) {
        console.error("❌ Error processing MandArt:", error);
    }
}

/**
 * Gets the active MandArt filename.
 * @returns {Object} An object with short filename and full path.
 */
export function getActiveFilename() {
    if (!currentMandArtPath) {
        console.warn("⚠️ No MandArt file currently loaded.");
        return { shortName: "", fullPath: "" };
    }

    const shortName = currentMandArtPath.split("/").pop(); // Extracts filename
    return { shortName, fullPath: currentMandArtPath };
}

/**
 * Loads the default MandArt file.
 */
export async function loadDefaultMandArt() {
    console.log("📌 Loading Default MandArt...");
    try {
        await loadMandArt("assets/MandArt_Catalog/Default.mandart", "", "Default");
        console.log("✅ Default MandArt loaded successfully.");
    } catch (error) {
        console.error("❌ Failed to load default MandArt:", error);
    }
}

/**
 * Updates the UI with the current hues.
 */
function updateHueUI(hues) {
    console.log("🎨 Updating Hue UI...");

    const hueList = document.getElementById("hueList");
    if (!hueList) {
        console.error("❌ hueList container not found.");
        return;
    }

    hueList.innerHTML = ""; // Clear previous hues

    hues.forEach((hue, index) => {
        const hexColor = rgbToHex(hue.r, hue.g, hue.b);

        const hueRow = document.createElement("div");
        hueRow.classList.add("hue-row");

        const colorInput = document.createElement("input");
        colorInput.type = "color";
        colorInput.value = hexColor;
        colorInput.classList.add("color-picker");

        const sortNum = document.createElement("span");
        sortNum.textContent = `#${index + 1}`;
        sortNum.classList.add("sort-num");

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "🗑";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.addEventListener("click", () => {
            hues.splice(index, 1);
            updateHueUI(hues);
        });

        colorInput.addEventListener("input", (event) => {
            hues[index] = hexToRgb(event.target.value);
            console.log(`🎨 Updated hue ${index} to`, hues[index]);
        });

        hueRow.appendChild(sortNum);
        hueRow.appendChild(colorInput);
        hueRow.appendChild(deleteBtn);
        hueList.appendChild(hueRow);
    });

    console.log("✅ Hue UI updated with new colors:", hues);
}
