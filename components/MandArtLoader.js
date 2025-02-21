import { loadPrecomputedGrid } from "../utils/GridUtils.js";
import { rgbToHex, hexToRgb } from "../utils/ColorUtils.js";
import { extractFileNameFromPath} from "../utils/FileNameUtils.js";

export class MandArtLoader {
    constructor() {
        this.currentMandArt = null;
        this.currentMandArtPath = "";
        this.hues = [];
    }

    /**
     * Loads a MandArt file from a given source (URL, JSON object, or local file).
     */
    async loadMandArt(source, imagePath = "", name = "Unnamed") {
        console.log("📥 Loading MandArt...", { source, imagePath, name });

        try {
            let jsonData;
            let finalName = name; // Preserve name, but allow update


            if (typeof source === "string") {
                if (source.startsWith("http") || source.startsWith("assets/")) {
                    console.log(`🌐 Fetching MandArt JSON from: ${source}`);
                    const response = await fetch(source);
                    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                    jsonData = await response.json();

                    this.currentMandArtPath = source;
                    finalName = extractFileNameFromPath(source);

                } else {
                    console.warn("⚠️ Unknown source format. Attempting to parse as JSON.");
                    jsonData = source; // Assume it's already parsed JSON
                    this.currentMandArtPath = finalName;
                }
            } else {
                jsonData = source;
                this.currentMandArtPath = name;
            }

            console.log("✅ MandArt JSON Loaded:", jsonData);
            await this.readFromMandart(jsonData, finalNname, imagePath);
        } catch (error) {
            console.error("❌ Failed to load MandArt:", error);
            alert("Error loading MandArt. Please check the source URL or file.");
        }
    }

    /**
     * Processes and applies the MandArt data.
     */
    async readFromMandart(jsonData, name, imagePath = "") {
        console.log("🖌️ Applying MandArt data...", jsonData);

        try {
            if (!jsonData || !jsonData.hues || !Array.isArray(jsonData.hues)) {
                throw new Error("❌ MandArt JSON is missing 'hues' or it's not an array.");
            }

            // ✅ Normalize hues
            this.hues = jsonData.hues.map(hue => ({
                r: hue.r !== undefined ? Math.round(hue.r) : Math.round((hue.color?.red ?? 0) * 255),
                g: hue.g !== undefined ? Math.round(hue.g) : Math.round((hue.color?.green ?? 0) * 255),
                b: hue.b !== undefined ? Math.round(hue.b) : Math.round((hue.color?.blue ?? 0) * 255),
            }));

            console.log("✅ Processed hues for UI:", this.hues);

            // ✅ Update UI
            this.updateHueUI();

            // ✅ Store MandArt
            this.currentMandArt = jsonData;
            this.currentMandArtPath = imagePath || name;

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
            const { shortName } = this.getActiveFilename();
            const drawingName = document.getElementById("drawingName");
            if (drawingName) drawingName.textContent = shortName || "Unnamed";

            console.log(`🎨 Updated drawing name in UI: ${shortName}`);
        } catch (error) {
            console.error("❌ Error processing MandArt:", error);
        }
    }

    /**
     * Gets the active MandArt filename.
     */
    getActiveFilename() {
        if (!this.currentMandArtPath) {
            console.warn("⚠️ No MandArt file currently loaded.");
            return { shortName: "", fullPath: "" };
        }

        const shortName = this.currentMandArtPath.split("/").pop();
        return { shortName, fullPath: this.currentMandArtPath };
    }

    /**
     * Loads the default MandArt file.
     */
    async loadDefaultMandArt() {
        console.log("📌 Loading Default MandArt...");
        try {
            await this.loadMandArt("assets/MandArt_Catalog/Default.mandart", "", "Default");
            console.log("✅ Default MandArt loaded successfully.");
        } catch (error) {
            console.error("❌ Failed to load default MandArt:", error);
        }
    }

    /**
     * Updates the UI with the current hues.
     */
    updateHueUI() {
        console.log("🎨 Updating Hue UI...");

        const hueList = document.getElementById("hueList");
        if (!hueList) {
            console.error("❌ hueList container not found.");
            return;
        }

        hueList.innerHTML = ""; // Clear previous hues

        this.hues.forEach((hue, index) => {
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
                this.hues.splice(index, 1);
                this.updateHueUI();
            });

            colorInput.addEventListener("input", (event) => {
                this.hues[index] = hexToRgb(event.target.value);
                console.log(`🎨 Updated hue ${index} to`, this.hues[index]);
            });

            hueRow.appendChild(sortNum);
            hueRow.appendChild(colorInput);
            hueRow.appendChild(deleteBtn);
            hueList.appendChild(hueRow);
        });

        console.log("✅ Hue UI updated with new colors:", this.hues);
    }
}

export default MandArtLoader;
