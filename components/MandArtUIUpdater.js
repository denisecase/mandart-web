import { rgbToHex, hexToRgb } from "../utils/ColorUtils.js";


export class MandArtUIUpdater {
    constructor() {}

    /**
     * Updates UI elements based on MandArtLoader's state.
     * @param {Object} data - Contains displayName, sourcePath, hues, grid, and coloredGrid.
     */
    updateUI(data) {
        console.log("🔄 Updating UI...", data);

        const displayNameElement = document.getElementById("mandartDisplayName");
        if (displayNameElement) {
            displayNameElement.textContent = data.displayName || "No MandArt Loaded";
        } else {
            console.warn("⚠️ UI: #mandartDisplayName not found.");
        }

        // Update the hues list
        this.updateHueList(data.hues);

        // Update the canvas (if applicable)
        this.updateCanvas(data.coloredGrid);

        console.log("✅ UI Updated Successfully.");
    }

    /**
     * Updates the hues list UI.
     * @param {Array} hues - The hues array.
     */
    updateHueList(hues) {
        console.log("🎨 Updating Hue List:", hues);

        const hueListElement = document.getElementById("hueList");
        if (!hueListElement) {
            console.warn("⚠️ UI: #hueList not found.");
            return;
        }

        hueListElement.innerHTML = "";
        if (!hues || hues.length === 0) {
            hueListElement.innerHTML = "<p>No hues found.</p>";
            return;
        }

        hues.forEach(hue => {
            const listItem = document.createElement("div");
            listItem.className = "hue-item";
            listItem.style.backgroundColor = rgbToHex(hue.r, hue.g, hue.b);
            listItem.textContent = `Hue ${hue.num}`;
            hueListElement.appendChild(listItem);
        });

        console.log("✅ Hue List Updated.");
    }

    /**
     * Updates the canvas background color if fastColor mode is enabled.
     * @param {Array} coloredGrid - The colored grid.
     */
    updateCanvas(coloredGrid) {
        console.log("🖌️ Updating Canvas...");

        const canvas = document.getElementById("mandelbrotCanvas");
        if (!canvas) {
            console.warn("⚠️ UI: Canvas not found!");
            return;
        }

        if (!coloredGrid || coloredGrid.length === 0) {
            console.warn("⚠️ UI: No colored grid data available.");
            return;
        }

        // Use first color for fast update
        const firstColor = coloredGrid[0][0] || "#CCCCCC";
        canvas.style.backgroundColor = firstColor;
        console.log(`🎨 Canvas background updated to: ${firstColor}`);
    }
}
