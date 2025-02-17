//main.js 

let currentMandArt = null; // Stores the active MandArt JSON
let currentGrid = null; // Stores the grid (fIter) data

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Starting MandArt...");

    // Get elements
    const fileInput = document.getElementById("fileInput");
    const openFileBtn = document.getElementById("openFileBtn");
    const openListBtn = document.getElementById("openListBtn");
    const addColorBtn = document.getElementById("addColorBtn");
    const mandColorPicker = document.getElementById("mandColorPicker");
    const mandartSelect = document.getElementById("mandartSelect");
    const loadMandartBtn = document.getElementById("loadMandartBtn");
    const openUrlBtn = document.getElementById("openUrlBtn");

    // export elements
    const saveMandArtBtn = document.getElementById("saveMandArtBtn");
    const savePNGBtn = document.getElementById("savePNGBtn");
    const saveGridBtn = document.getElementById("saveGridBtn");

    // Ensure elements exist before adding event listeners

   // Ensure elements exist before adding event listeners
   if (saveMandArtBtn) {
    saveMandArtBtn.addEventListener("click", () => {
        if (currentMandArt) {
            let filename = getActiveFilename("mandart");
            saveMandArtFile(currentMandArt, filename);
            console.log(`MandArt saved as '${filename}' and remains open for editing.`);
        } else {
            alert("No MandArt loaded to save.");
        }
    });
}
    

    if (savePNGBtn) {
        savePNGBtn.addEventListener("click", () => {
            const canvas = document.getElementById("mandelbrotCanvas");
            if (canvas) {
                saveCanvasAsPNG(canvas);
                console.log("PNG exported. Keeping current changes.");
            } else {
                alert("No canvas found to export.");
            }
        });
    }

    if (saveGridBtn) {
        saveGridBtn.addEventListener("click", () => {
            if (currentGrid) {
                exportGridToCSV(currentGrid);
                console.log("Grid exported. Keeping current edits.");
            } else {
                alert("No grid data available to export.");
            }
        });
    }

    if (openListBtn) {
        openListBtn.addEventListener("click", () => {
            document.getElementById("catalogModal").style.display = "block";
            loadMandArtCatalog();
        });
    }

    if (mandColorPicker) {
        mandColorPicker.addEventListener("input", updateMandColor);
    }

    if (addColorBtn) {
        addColorBtn.addEventListener("click", addNewColor);
    }

    if (openFileBtn) {
        openFileBtn.addEventListener("click", handleFileUpload);
    }

    if (openUrlBtn) {
        openUrlBtn.addEventListener("click", handleUrlInput);
    }

    if (fileInput) {
        fileInput.addEventListener("change", handleFileUpload);
    }

    if (openFileBtn) {
        // Click Open File button → Opens file browser
        openFileBtn.addEventListener("click", () => {
            console.log("Open File button clicked."); // Debugging log
            fileInput.click(); // Open file browser dialog
        });
        if (loadMandartBtn && mandartSelect) {
            loadMandartBtn.addEventListener("click", () => {
                const selectedMandart = mandartSelect.value;
                if (selectedMandart) {
                    const filePath = `assets/MandArt_Catalog/${selectedMandart}.mandart`;
                    const imagePath = `assets/MandArt_Catalog/${selectedMandart}.png`;
                    loadMandArt(filePath, imagePath, selectedMandart);
                } else {
                    alert("Please select a MandArt file first.");
                }
            });
        } else {
            console.warn("MandArt select dropdown or 'Go' button not found.");
        }
    }

    // Populate the dropdown with available MandArt files
    await populateMandartDropdown();

    // Load Default MandArt file
    const defaultMandArt = "assets/MandArt_Catalog/Default.mandart";
    await loadMandArt(defaultMandArt, "", "Default");
});


/**
 * Populate dropdown list with MandArt files from assets/mandart_discoveries.json
 */
async function populateMandartDropdown() {
    try {
        const response = await fetch("assets/mandart_discoveries.json");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("Loaded MandArt Discoveries:", data);

        const mandartSelect = document.getElementById("mandartSelect");
        mandartSelect.innerHTML = `<option value="">Select a MandArt</option>`; // Reset list

        // Sort items alphabetically by name
        data.sort((a, b) => a.name.localeCompare(b.name));

        data.forEach(item => {
            const option = document.createElement("option");
            option.value = item.name;
            option.textContent = item.name;
            mandartSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Failed to load MandArt file list:", error);
    }
}

/**
 * Load the MandArt catalog (thumbnails + names) in the modal list
 */
async function loadMandArtCatalog() {
    try {
        const response = await fetch("assets/mandart_discoveries.json");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("Catalog Loaded:", data);

        const listContainer = document.getElementById("mandartList");
        listContainer.innerHTML = ""; // Clear previous content

        data.forEach(item => {
            const imagePath = `assets/MandArt_Catalog/${item.name}.png`; // Thumbnail path
            const mandartPath = `assets/MandArt_Catalog/${item.name}.mandart`; // JSON path

            const itemDiv = document.createElement("div");
            itemDiv.className = "mandart-item";
            itemDiv.dataset.url = mandartPath;
            itemDiv.dataset.name = item.name;
            itemDiv.dataset.image = imagePath;

            itemDiv.innerHTML = `
                <img src="${imagePath}" alt="${item.name}" onerror="this.src='assets/placeholder.png'">
                <span>${item.name}</span>
            `;

            itemDiv.addEventListener("click", () => {
                loadMandArt(mandartPath, imagePath, item.name);
                closeCatalogModal();
            });

            listContainer.appendChild(itemDiv);
        });
    } catch (error) {
        console.error("Failed to load MandArt Catalog:", error);
    }
}


async function loadMandArt(source, imagePath, name) {
    try {
        let jsonData;
        if (source.startsWith("http") || source.startsWith("assets/")) {
            console.log(`Fetching MandArt: ${source}`);
            const response = await fetch(source);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            jsonData = await response.json();
        } else {
            console.log(`Using JSON from file input`);
            jsonData = source; // It's already an object, no need to fetch
        }
        console.log("MandArt JSON Loaded:", jsonData);
        const baseName = name || (typeof source === "string" ? source.split('/').pop().replace('.mandart', '') : "Unnamed");
        readFromMandart(jsonData, baseName, imagePath);
    } catch (error) {
        console.error("Failed to load MandArt:", error);
    }
}


function handleFileUpload(event) {
    console.log("Loading MandArt from file...");
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const jsonData = JSON.parse(e.target.result);
            console.log("Loaded JSON from File:", jsonData);
            readFromMandart(jsonData, file.name.replace(".mandart", ""));
        } catch (error) {
            console.error("Error parsing file:", error);
            alert("Invalid MandArt JSON file.");
        }
    };
    reader.readAsText(file);
}


/**
 * Handle loading a MandArt JSON from a URL
 */
function handleUrlInput() {
    const url = prompt("Enter the URL of the MandArt JSON:");
    if (url) {
        loadMandArt(url, "", "Custom URL");
    }
}

/**
 * Close the catalog modal
 */
function closeCatalogModal() {
    document.getElementById("catalogModal").style.display = "none";
}

async function readFromMandart(jsonData, name, imagePath = "") {
    try {
        console.log("Reading from MandArt input data file:", name, jsonData);
        if (!jsonData) {
            console.error("Error: MandArt input data file is empty or invalid.");
            return;
        }
        currentMandArt = jsonData; // Store the active MandArt file
        const picdef = jsonData;
        console.log("Loaded picdef:", picdef);

        if (!picdef.hues || !Array.isArray(picdef.hues)) {
            throw new Error("MandArt JSON is missing 'hues' or it's not an array.");
        }
        console.log("Loaded hues:", picdef.hues);

        // Apply Hues
        applyJsonData(jsonData);
       
        // Check image width/height
        if (!picdef.imageWidth || !picdef.imageHeight) {
            throw new Error("picdef is missing imageWidth or imageHeight.");
        }
        drawArtSizedCanvasFromGrid(); 


        // Update UI Elements
        document.getElementById("drawingName").textContent = name;
        if (imagePath) document.getElementById("previewImage").src = imagePath;

        // Resize the canvas
        const canvas = document.getElementById("mandelbrotCanvas");
        canvas.width = picdef.imageWidth;
        canvas.height = picdef.imageHeight;
        console.log(`Canvas resized: ${canvas.width}x${canvas.height}`);

        const safeName = name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
        const csvPath = `assets/MandArt_Catalog/${safeName}.csv`;
        console.log(`Trying to load CSV: ${csvPath}`);

        const gridLoaded = await loadPrecomputedGrid(csvPath);

        if (!gridLoaded) {
            console.warn("Precomputed grid missing or invalid. Using placeholder.");
            drawArtSizedCanvasFromGrid();
        }

    } catch (error) {
        console.error("Error processing MandArt:", error);
    }
}

function applyJsonData(data) {
    if (!data.hues || data.hues.length === 0) {
        console.warn("No hues found in MandArt file.");
        return;
    }
    hues = data.hues;
    console.log("Applied Hues:", hues);
    updateHueList();
    recolorCanvas(); // Apply hues to the canvas
}

