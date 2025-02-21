import {
  saveMandArtFile,
  saveCanvasAsPNG,
  exportGridToCSV,
} from "../utils/FileUtils.js";
import { setupCatalog , closeCatalogModal} from "./Catalog.js";
import { MandArtLoader } from "./MandArtLoader.js";
import { openUrlPrompt } from "./UrlPrompt.js";
import { loadMandArtList, populateMandartDropdown } from "../utils/MandArtList.js";

const defaultURL =
  "https://raw.githubusercontent.com/denisecase/MandArt-Discoveries/main/brucehjohnson/frame_pix/Frame54.mandart";
const mandArtLoader = new MandArtLoader();
/**
 * Sets up the header with buttons and event listeners.
 */
export function setupHeader() {
  console.log("🔍 Running setupHeader()...");

  const header = document.getElementById("header");
  if (!header) {
    console.error("❌ Header element not found in the DOM.");
    return;
  }
  console.log("✅ Found header element:", header);

  header.innerHTML = `
        <h1>MandArt Web</h1>
        <div class="header-buttons">
            <button id="openFileBtn">Open from File...</button>
            <button id="openUrlBtn">Open from URL...</button>
            <button id="openListBtn">Open from List...</button>
            <select id="mandartSelect">
                <option value="">Select a MandArt</option>
            </select>
            <button id="loadMandartBtn">Go</button>
        </div>

        <div class="header-buttons">
            <button id="saveMandArtBtn">Save Inputs</button>
            <button id="savePNGBtn">Export PNG</button>
            <button id="saveGridBtn">Export Grid</button>
        </div>
    `;



  // ✅ File Input Handling (Hidden File Selector)
  const fileInput = document.getElementById("fileInput");
  document.getElementById("openFileBtn")?.addEventListener("click", () => {
    fileInput?.click();
  });

  fileInput?.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log(`📂 Selected file: ${file.name}`);
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          let jsonData = JSON.parse(e.target.result);

          // ✅ Validate and Normalize Hues
          if (!jsonData.hues || !Array.isArray(jsonData.hues)) {
            throw new Error(
              "❌ Invalid MandArt file: 'hues' array missing or not an array."
            );
          }

          jsonData.hues = jsonData.hues.map((hue) => ({
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
          }));

          console.log("✅ Processed MandArt JSON:", jsonData);

          // ✅ Load into UI
          await readFromMandart(jsonData, file.name.replace(".mandart", ""));
        } catch (error) {
          console.error("❌ Error parsing MandArt file:", error);
          alert("Invalid MandArt JSON file. Please check the format.");
        }
      };
      reader.readAsText(file);
    }
  });

  // ✅ Handle Open List (Modal)
  document.getElementById("openListBtn")?.addEventListener("click", () => {
    console.log("📦 Opening Catalog Modal...");
    document.getElementById("catalogModal").style.display = "block";
    setupCatalog();
  });

  // ✅ Handle URL Input (with default URL)
  document.getElementById("openUrlBtn")?.addEventListener("click", async () => {
    const url = await openUrlPrompt(defaultURL);
    if (url) {
      console.log("🌐 Loading MandArt from URL:", url);
      await mandArtLoader.loadMandArt(url, "", "Custom URL");
    }
  });

  // ✅ Handle MandArt Dropdown Selection
  document
    .getElementById("loadMandartBtn")
    ?.addEventListener("click", async () => {
      const selectedValue = document.getElementById("mandartSelect")?.value;
      if (selectedValue) {
        const filePath = `assets/MandArt_Catalog/${selectedValue}.mandart`;
        const imagePath = `assets/MandArt_Catalog/${selectedValue}.png`;
        await mandArtLoader.loadMandArt(filePath, imagePath, selectedValue);
        closeCatalogModal(); // ✅ Close modal when selection is confirmed
      } else {
        alert("Please select a MandArt file first.");
      }
    });

  // ✅ Save & Export Buttons
  document.getElementById("saveMandArtBtn")?.addEventListener("click", () => {
    if (window.currentMandArt) {
      let filename = mandArtLoader.getActiveFilename("mandart");
      saveMandArtFile(window.currentMandArt, filename);
      console.log(`✅ MandArt saved as '${filename}'.`);
    } else {
      alert("No MandArt loaded to save.");
    }
  });

  document.getElementById("savePNGBtn")?.addEventListener("click", () => {
    const canvas = document.getElementById("mandelbrotCanvas");
    if (canvas) {
      saveCanvasAsPNG(canvas);
      console.log("✅ PNG exported successfully.");
    } else {
      alert("No canvas found to export.");
    }
  });

  document.getElementById("saveGridBtn")?.addEventListener("click", () => {
    if (window.currentGrid) {
      exportGridToCSV(window.currentGrid);
      console.log("✅ Grid exported successfully.");
    } else {
      alert("No grid data available to export.");
    }
  });
}
