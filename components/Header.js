// Header.js
import { closeCatalogModal } from "./Catalog.js";
import { openUrlPrompt } from "./UrlPrompt.js";
import {
  saveMandArtFile,
  saveCanvasAsPNG,
  saveGridToCSV,
} from "../utils/FileUtils.js";

const defaultURL = "https://raw.githubusercontent.com/denisecase/MandArt-Discoveries/main/brucehjohnson/frame_pix/Frame54.mandart";

export function setupHeader() {
  console.log("🔍 Running setupHeader()...");

  const header = document.getElementById("header");
  const fileInput = document.getElementById("fileInput");

  if (!header) {
    console.error("❌ Header element not found in the DOM.");
    return;
  }

  if (!fileInput) {
    console.error("❌ File input element not found in the DOM.");
    return;
  }

  header.innerHTML = `
        <h1>MandArt Web (Under Construction) </h1>
        <div class="header-buttons">
          <button id="openListBtn">Open from Catalog</button>
            <select id="mandartSelect">
                <option value="">Select a MandArt</option>
            </select>
            <button id="openUrlBtn">Open from URL...</button>
            <button id="openFileBtn">Open from File...</button>
        </div>
        <div class="header-buttons">
            <button id="saveMandArtBtn">Save Inputs</button>
            <button id="savePNGBtn">Export PNG</button>
            <button id="saveGridBtn">Export Grid</button>
        </div>
    `;

  // File Input Handler
  document.getElementById("openFileBtn")?.addEventListener("click", () => {
    console.log("CLICK Open from File button.");
    fileInput?.click();
  });

  // File Input Handler
  fileInput?.addEventListener("change", async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      try {
        // Read file contents using the utility function
        const fileContents = await readFileContents(selectedFile);

        console.log("Selected file:", selectedFile.name);
        console.log("File contents length:", fileContents.length);

        // Parse JSON before passing it to loadFromAnywhere
        let jsonData;
        try {
          jsonData = JSON.parse(fileContents);
          console.log("✅ Parsed MandArt JSON:", jsonData);
        } catch (error) {
          console.error("❌ Error parsing MandArt file:", error);
          alert("Invalid MandArt file format.");
          return; // Stop execution if JSON is invalid
        }

        // ❌ REMOVE any direct calls to loadMandArt
        // Correct: Only call loadFromAnywhere
        await window.mandArtLoader.loadFromAnywhere(
          selectedFile,
          'file',
          jsonData
        );


        // Clear the file input to allow selecting the same file again
        event.target.value = '';
      } catch (error) {
        console.error("❌ Error loading file:", error);
        alert(`Failed to load MandArt file: ${error.message}`);
      }
    }
  });

  // Utility function to read file contents
  async function readFileContents(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }

  // URL Handler
  document.getElementById("openUrlBtn")?.addEventListener("click", async () => {
    console.log("CLICK Open from URL button.");
    const url = await openUrlPrompt(defaultURL);
    if (url) {
      try {
        await window.mandArtLoader.loadFromAnywhere(url, 'url');
      } catch (error) {
        console.error("❌ Error loading URL:", error);
        alert(`Failed to load MandArt from URL: ${error.message}`);
      }
    }
  });


  // Dropdown Handler
  document.getElementById("mandartSelect")?.addEventListener("change", async (event) => {
    console.log("CLICK selection on dropdown list.");
    const selectedValue =  event.target.value;
    if (selectedValue) {
      try {
        const filePath = `assets/MandArt_Catalog/${selectedValue}.mandart`;
        const imagePath = `assets/MandArt_Catalog/${selectedValue}.png`;
        await window.mandArtLoader.loadMandArt(filePath, imagePath, selectedValue);
        closeCatalogModal();
      } catch (error) {
        console.error("❌ Error loading selected MandArt:", error);
        alert("Failed to load selected MandArt.");
      }
    } else {
      alert("Please select a MandArt file first.");
    }
  });

  // Save/Export Handlers............................

  document.getElementById("saveMandArtBtn")?.addEventListener("click", () => {
    const currentMandArt = window.mandArtLoader.getCurrentMandArt();
    if (currentMandArt) {
      const filename = window.mandArtLoader.getDisplayName();
      saveMandArtFile(currentMandArt, filename);
    } else {
      alert("No MandArt loaded to save.");
    }
  });

  document.getElementById("savePNGBtn")?.addEventListener("click", () => {
    const canvas = document.getElementById("mandelbrotCanvas");
    if (canvas) {
      saveCanvasAsPNG(canvas);
    } else {
      alert("No canvas found to export.");
    }
  });

  document.getElementById("saveGridBtn")?.addEventListener("click", () => {
    if (window.mandArtLoader.grid) {
      saveGridToCSV(window.mandArtLoader.grid);
    } else {
      alert("No grid data available to export.");
    }
  });

}