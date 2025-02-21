import { loadPrecomputedGrid } from "../utils/GridUtils.js";
import { rgbToHex, hexToRgb } from "../utils/ColorUtils.js";
import { extractFileName } from "../utils/FileNameUtils.js";
import { reassignHueNumbers } from "../utils/HueUtils.js";
import { updateCanvasSource } from "./CanvasSource.js";

export class MandArtLoader {
  constructor() {
    this.currentMandArt = null;
    this.currentMandArtPath = "";
    this.hues = [];
  }

  /**
   * Loads a MandArt file from a given source (URL, JSON object, or local file).
   */

  async loadMandArt(sourcePath, imagePath = "", displayName = "Unnamed") {
    console.log("📥 Loading MandArt...", {
      sourcePath,
      imagePath,
      displayName,
    });

    try {
      let jsonData;
      let finalName = displayName; // Preserve name but allow update
      console.log("in LoadMandArt", sourcePath);
      console.log("in LoadMandArt", displayName);

      if (typeof sourcePath === "string") {
        if (sourcePath.startsWith("http") || sourcePath.startsWith("assets/")) {
          console.log(`🌐 Fetching MandArt JSON from: ${sourcePath}`);
          const response = await fetch(sourcePath);
          if (!response.ok)
            throw new Error(`HTTP error! Status: ${response.status}`);

          // ✅ File Contents: JSON Data
          jsonData = await response.json();

          // ✅ File Path: URL or Local Path
          this.currentMandArtPath = sourcePath;

          // ✅ Extract the file name for display
          finalName = extractFileName(sourcePath);
        } else {
          console.warn(
            "⚠️ Unknown source format. Attempting to parse as JSON."
          );

          // ✅ Assume sourcePath is already parsed JSON (file contents)
          jsonData = sourcePath;

          // ✅ Store the given name if provided
          this.currentMandArtPath = finalName;
        }
      } else {
        jsonData = sourcePath; // Assume it's already parsed JSON
        this.currentMandArtPath = displayName;
      }

      console.log("✅ MandArt JSON Loaded:", jsonData);

      // ✅ Pass `finalName` instead of `displayName`
      await this.readFromMandart(jsonData, finalName, imagePath);
    } catch (error) {
      console.error("❌ Failed to load MandArt:", error);
      alert("Error loading MandArt. Please check the source URL or file.");
    }
  }

  // ✅ Read MandArt JSON data
  async readFromMandart(jsonData, displayName, imagePath = "") {
    console.log("🖌️ Reading from the MandArt JSON file...", jsonData);
    console.log(" Reading from ", displayName);


    // ✅ Make sure `displayName` is correct
    this.currentMandArtTitle = displayName || "Untitled MandArt";
    this.currentMandArtPath = imagePath || "(Unknown Source)";
    this.currentMandArt = jsonData;

    console.log("✅ MandArt Loaded:", {
        title: this.currentMandArtTitle,
        path: this.currentMandArtPath
    });


    // ✅ Directly update the UI - NO MORE RELYING ON `updateCanvasSource`
    document.getElementById("drawingName").textContent =
      displayName || "Untitled MandArt";
    console.log(`🎨 Set UI Title: ${displayName}`);

    document.getElementById("sourcePath").textContent = `Source: ${
      this.currentMandArtPath || "(No source loaded)"
    }`;
    console.log(`📂 Set UI Source Path: ${this.currentMandArtPath}`);

    // ✅ Ensure correct UI title and path
    this.currentMandArt = jsonData;
    this.currentMandArtPath = imagePath || "(Unknown Source)";
    this.currentMandArtTitle = displayName || "Untitled MandArt"; 

    console.log("✅ MandArt Path:", this.currentMandArtPath);
    console.log("✅ MandArt Title:", this.currentMandArtTitle);

    // ✅ Immediately update UI elements (Fixes Title)
    const drawingNameElement = document.getElementById("drawingName");
    const sourceElement = document.getElementById("sourcePath");

    if (drawingNameElement) {
      drawingNameElement.textContent = this.currentMandArtTitle;
      console.log(`🎨 Set UI Title: ${this.currentMandArtTitle}`);
    } else {
      console.error("❌ Could not find #drawingName element.");
    }

    if (sourceElement) {
      sourceElement.textContent = `Source: ${this.currentMandArtPath}`;
      console.log(`📂 Set Source Path: ${this.currentMandArtPath}`);
    }

    try {
      if (!jsonData || !jsonData.hues || !Array.isArray(jsonData.hues)) {
        throw new Error(
          "❌ MandArt JSON is missing 'hues' or it's not an array."
        );
      }

      // ✅ Call `updateCanvasSource()` if available, but **DO NOT** let it break things
      if (typeof updateCanvasSource === "function") {
        console.log("🎨 Calling updateCanvasSource...");
        updateCanvasSource();
      } else {
        console.warn("⚠️ WARNING: updateCanvasSource was not found.");
      }

      console.log(
        "🔍 Before updateCanvasSource: currentMandArtTitle:",
        this.currentMandArtTitle
      );

      if (window.canvasSourceFunctions?.updateCanvasSource) {
        console.log("Found function updateCanvasSource");
        window.canvasSourceFunctions.updateCanvasSource();
      } else {
        console.warn("WARNING: updateCanvasSource was not found.");
      }

      // ✅ Preserve existing hues (only update if needed)
      const previousHues = [...this.hues]; // Backup current hues

      this.hues = jsonData.hues.map((hue, index) => ({
        r:
          hue.r !== undefined
            ? Math.round(hue.r)
            : Math.round((hue.color?.red ?? 0) * 255),
        g:
          hue.g !== undefined
            ? Math.round(hue.g)
            : Math.round((hue.color?.green ?? 0) * 255),
        b:
          hue.b !== undefined
            ? Math.round(hue.b)
            : Math.round((hue.color?.blue ?? 0) * 255),
        num: hue.num !== undefined ? hue.num : index + 1, // Keep correct numbering
      }));

      console.log("✅ Mandart Loaders hues with correct order:", this.hues);

      // ✅ Restore hues if they were wiped
      if (this.hues.length === 0 && previousHues.length > 0) {
        console.warn("⚠️ Hues were lost, restoring previous hues.");
        this.hues = [...previousHues];
      }

      this.updateHueUI();
      console.log("✅ Success - read from Mandart:", this.hues);
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
      await this.loadMandArt(
        "assets/MandArt_Catalog/Default.mandart",
        "",
        "Default"
      );
      console.log("✅ Default MandArt loaded successfully.");
    } catch (error) {
      console.error("❌ Failed to load default MandArt:", error);
    }
  }

  updateHueUI() {
    console.log("🎨 Updating Hue UI...");
    console.log("📋 Before update, hues:", [...this.hues]); // ✅ Log hues before update

    const hueList = document.getElementById("hueList");
    if (!hueList) {
      console.error("❌ hueList container not found.");
      return;
    }

    hueList.innerHTML = ""; // ✅ Clear only the DOM, NOT `this.hues`

    if (!this.hues || this.hues.length === 0) {
      console.warn("⚠️ No hues found.");
      return;
    }

    // ✅ Preserve the order of hues
    this.hues.sort((a, b) => a.num - b.num);

    this.hues.forEach((hue, index) => {
      const hexColor = rgbToHex(hue.r, hue.g, hue.b);

      const hueRow = document.createElement("div");
      hueRow.classList.add("hue-row");

      const colorInput = document.createElement("input");
      colorInput.type = "color";
      colorInput.value = hexColor;
      colorInput.classList.add("color-picker");

      // ✅ Display correct `num`
      const sortNum = document.createElement("span");
      sortNum.innerHTML = `<strong>#${hue.num}</strong>`; // ✅ Keep `num`
      sortNum.classList.add("sort-num");

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑";
      deleteBtn.classList.add("delete-btn");
      deleteBtn.addEventListener("click", () => {
        this.removeHue(hue.num);
      });

      colorInput.addEventListener("input", (event) => {
        this.updateMandColor(hue.num, event.target.value);
      });

      hueRow.appendChild(sortNum);
      hueRow.appendChild(colorInput);
      hueRow.appendChild(deleteBtn);
      hueList.appendChild(hueRow);
    });

    console.log("✅ Hue UI updated with new colors:", [...this.hues]); // ✅ Log after update
  }

  /**
   * Adds a new black color to the hues list and updates the UI.
   */
  addNewColor() {
    console.log("➕ MandArtLoader Beginning addNewColor...");
    console.log("📋 Current hues before adding:", [...this.hues]);

    if (!Array.isArray(this.hues)) {
      this.hues = []; // ✅ Ensure hues is always an array
    }

    // ✅ Clone hues to prevent unexpected mutation
    let updatedHues = [...this.hues];

    // ✅ Determine the next num based on max num value
    const nextNum =
      updatedHues.length > 0
        ? Math.max(...updatedHues.map((hue) => hue.num || 0)) + 1
        : 1;

    // ✅ Add the new hue while preserving existing ones
    updatedHues.push({ r: 0, g: 0, b: 0, num: nextNum });

    console.log("🎨 New hues after addition:", updatedHues);

    // ✅ Assign to this.hues instead of replacing it with an empty array
    this.hues = updatedHues;

    console.log("✅ Final hues list:", [...this.hues]);

    // ✅ Refresh UI
    this.updateHueUI();
  }

  /**
   * Updates a specific MandArt color when the user selects a new color.
   * @param {number} index - The index of the hue being updated.
   * @param {string} hexColor - The new color in HEX format (e.g., "#ff5733").
   */
  updateMandColor(index, hexColor) {
    if (index < 0 || index >= this.hues.length) {
      console.error(`❌ Invalid hue index: ${index}`);
      return;
    }

    // Convert HEX color to RGB
    const rgb = hexToRgb(hexColor);

    // Update the hues array
    this.hues[index] = rgb;

    // Log the change
    console.log(`🎨 Updated hue #${index + 1}:`, rgb);

    // Refresh the UI
    this.updateHueUI();
  }

  /**
   * Removes a hue and reassigns hue numbers.
   * @param {number} numToRemove - The `num` of the hue to remove.
   */
  removeHue(numToRemove) {
    const index = this.hues.findIndex((hue) => hue.num === numToRemove);
    if (index === -1) {
      console.error(`❌ Hue with num ${numToRemove} not found.`);
      return;
    }

    console.log(`🗑️ Removing hue #${numToRemove}`);

    // ✅ Remove the selected hue
    this.hues.splice(index, 1);

    // ✅ Reassign `num` values in sequence
    this.hues = reassignHueNumbers(this.hues);

    // ✅ Update UI
    this.updateHueUI();
  }
}

export default MandArtLoader;
