import { createColorEditorRow } from "./ColorEditorRow.js";
import { recolorCanvas } from "./Canvas.js";

export function setupColorEditor() {
    console.log("🔍 calling setupColorEditor");

    const colorEditor = document.getElementById('colorEditor');
    if (!colorEditor) {
        console.warn("❌ setupColorEditor: Missing #colorEditor element.");
        return;
    }

    console.log("🔍 Setting up Color Editor...");

    colorEditor.innerHTML = `
        <h2>Color Editor</h2>
        <div id="mandColorContainer">
            <label for="mandColorPicker">Mand Color:</label>
            <input type="color" id="mandColorPicker" />
        </div>
        <button id="addColorBtn">Add New Color</button>
        <div id="hueList"></div>
         <!-- GitHub Repo Link -->
        <a
          href="https://github.com/denisecase/mandart-web"
          target="_blank"
          id="githubLink"
        >
          <img
            src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
            alt="(GH)"
            id="githubIcon"
          />
        </a>
    `;

    const addColorBtn = document.getElementById("addColorBtn");
    const mandColorPicker = document.getElementById("mandColorPicker");
    const hueListDiv = document.getElementById("hueList");
    if (!hueListDiv) {
        console.error("❌ setupColorEditor: Missing hueListDiv.");
        return;
    }

    console.log("🔍 HueList div found:", hueListDiv);

    function updateHueList() {
        console.log("🔍 updateHueList called with hues:", mandArtLoader.hues);  // Debug log
        hueListDiv.innerHTML = ""; // Clear previous list
        if (!mandArtLoader.hues || mandArtLoader.hues.length === 0) {
            console.warn("⚠️ No hues found in mandartLoader.");
            return;
        }

        mandArtLoader.hues.forEach((hue, index) => {
            const row = createColorEditorRow(index, hue, updateHueColor, removeHue);
            hueListDiv.appendChild(row);
        });

        console.log("✅ Color List Updated:", mandArtLoader.hues);
    }

    // Initial update of hue list
    console.log("🔍 Checking mandArtLoader.hues before updateHueList:", window.mandArtLoader.hues);
    updateHueList();

    addColorBtn.addEventListener("click", () => {
        console.log("➕ In Color Editor handling click on Add New Color...");
        console.log("📋 Current hues before adding:", [...mandArtLoader.hues]);

        mandArtLoader.addHue();
        updateHueList();

        if (typeof recolorCanvas === "function") recolorCanvas();
    });

    mandColorPicker.addEventListener("input", (event) => {
        mandArtLoader.updateMandColor(0, event.target.value);
        if (typeof recolorCanvas === "function") recolorCanvas();
    });

    function updateHueColor(index, hexColor) {
        console.log("Updating hue color at index:", index, "to:", hexColor);  // Debug log
        mandArtLoader.updateMandColor(index, hexColor);
        if (typeof recolorCanvas === "function") recolorCanvas();
    }

    function removeHue(index) {
        console.log("Removing hue at index:", index);

        // ✅ Ensure we are calling `removeHue` from the MandArtLoader instance
        if (window.mandArtLoader && typeof window.mandArtLoader.removeHue === "function") {
            window.mandArtLoader.removeHue(index);
        } else {
            console.error("❌ Error: removeHue is not defined on mandArtLoader.");
        }
    }


    window.mandArtLoader.addUIUpdateCallback(updateHueList);
    console.log("✅ Subscribed Color Editor to UI updates.");
}


