import { createColorEditorRow } from "./ColorEditorRow.js";

let hues = [];
let mandColor = { r: 0, g: 0, b: 0 }; // Explicitly define mandColor

export function setupColorEditor(getCanvas, recolorCanvas) {
    const colorEditor = document.getElementById("colorEditor");
    if (!colorEditor) {
        console.error("❌ setupColorEditor: Missing #colorEditor element.");
        return;
    }

    colorEditor.innerHTML = `
        <h2>Color Editor</h2>

        <!-- Mand Color Selector -->
        <div id="mandColorContainer">
            <label for="mandColorPicker">Mand Color:</label>
            <input type="color" id="mandColorPicker" />
        </div>

        <!-- Add Color & Select Mand Color -->
        <button id="addColorBtn">Add New Color</button>

        <!-- Hue List -->
        <div id="hueList"></div>

        <!-- GitHub Repo Link -->
        <a href="https://github.com/denisecase/mandart-web" target="_blank" id="githubLink">
            <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" 
                 alt="(GH)" id="githubIcon" />
        </a>
    `;

    const addColorBtn = document.getElementById("addColorBtn");
    const mandColorPicker = document.getElementById("mandColorPicker");
    const hueListDiv = document.getElementById("hueList");

    if (!addColorBtn || !mandColorPicker || !hueListDiv) {
        console.error("❌ setupColorEditor: One or more elements are missing.");
        return;
    }

    addColorBtn.addEventListener("click", addNewColor);
    mandColorPicker.addEventListener("input", updateMandColor);

    updateHueList();

    function updateHueList() {
        hueListDiv.innerHTML = ""; // Clear previous list

        hues.forEach((hue, index) => {
            hueListDiv.appendChild(createColorEditorRow(index, hue, updateHueColor, removeHue));
        });

        console.log("✅ Color List Updated:", hues);
    }

    function updateHueColor(index, hexColor) {
        const color = hexToRgb(hexColor);
        hues[index] = { r: color.r, g: color.g, b: color.b };
        recolorCanvas();
    }

    function removeHue(index) {
        hues.splice(index, 1);
        updateHueList();
        recolorCanvas();
    }

    function addNewColor() {
        hues.push({ r: 0, g: 0, b: 0 }); // Default black
        updateHueList();
        recolorCanvas();
    }

    function updateMandColor(event) {
        mandColor = hexToRgb(event.target.value);
        console.log("🎨 Updated Mand Color:", mandColor);
        recolorCanvas();
    }

    function hexToRgb(hex) {
        let bigint = parseInt(hex.substring(1), 16);
        return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
    }
}
