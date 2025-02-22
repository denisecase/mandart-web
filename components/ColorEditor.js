

export function setupColorEditor(mandArtLoader, recolorCanvas) {
    if (!mandArtLoader) {
        console.error("❌ setupColorEditor: mandartLoader is undefined!");
        return;
    }
    if (!colorEditor) {
        console.warn("❌ setupColorEditor: Missing #getCanvas element.");

    }       
    if (!recolorCanvas) {
        console.warn("❌ setupColorEditor: Missing #recolorCanvas element.");
    }   

    console.log("🔄 Setting up Color Editor...");
    
    // ✅ Preserve hues before modifying the UI
    const previousHues = [...mandArtLoader.hues]; // Backup existing hues

    // ✅ Rebuild the UI, but keep hues intact
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

    if (!addColorBtn || !mandColorPicker || !hueListDiv) {
        console.error("❌ setupColorEditor: One or more elements are missing.");
        return;
    }

    // ✅ Restore hues after rebuilding UI
    mandArtLoader.hues = previousHues;
    console.log("✅ Restored hues after UI rebuild:", mandArtLoader.hues);

    updateHueList(); // ✅ Restore the list in the UI

    // ✅ Add event listener for adding colors
    addColorBtn.addEventListener("click", () => {
        console.log("➕ In Color Editor handling click on Add New Color...");
        console.log("📋 Current hues before adding:", [...mandArtLoader.hues]);

        mandArtLoader.addNewColor(); // ✅ Modify hues inside MandArtLoader
        updateHueList(); // ✅ Ensure UI reflects changes

        if (typeof recolorCanvas === "function") recolorCanvas();
    });

    // ✅ Update mand color event listener
    mandColorPicker.addEventListener("input", (event) => {
        mandArtLoader.updateMandColor(0, event.target.value);
        if (typeof recolorCanvas === "function") recolorCanvas();
    });

    function updateHueList() {
        hueListDiv.innerHTML = ""; // Clear previous list

        if (!mandArtLoader.hues || mandArtLoader.hues.length === 0) {
            console.warn("⚠️ No hues found in mandartLoader.");
            return;
        }

        mandArtLoader.hues.forEach((hue, index) => {
            hueListDiv.appendChild(
                createColorEditorRow(index, hue, updateHueColor, removeHue)
            );
        });

        console.log("✅ Color List Updated:", mandArtLoader.hues);
    }

    function updateHueColor(index, hexColor) {
        mandArtLoader.updateMandColor(index, hexColor);
        if (typeof recolorCanvas === "function") recolorCanvas();
    }

    function removeHue(index) {
        mandArtLoader.removeHue(index);
        updateHueList();
        if (typeof recolorCanvas === "function") recolorCanvas();
    }
}
