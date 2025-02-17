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

    // Ensure elements exist before adding event listeners
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
    await loadMandArt(defaultMandArt, "", "Default MandArt");
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



/**
 * Load a MandArt file from URL, file selection, or catalog click
 */
async function loadMandArt(url, imagePath, name) {
    try {
        console.log(`Fetching MandArt: ${url}`);

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const jsonData = await response.json();
        console.log("MandArt JSON Loaded:", jsonData);

        // Extract filename from the URL (without path)
        const filename = url.split('/').pop(); // Gets "Default.mandart" from path

        // Update UI Elements
        document.getElementById("drawingName").textContent = filename; // Show exact filename
        if (imagePath) document.getElementById("previewImage").src = imagePath;

        applyJsonData(jsonData);
    } catch (error) {
        console.error("Failed to load MandArt:", error);
    }
}



/**
 * Handle file selection from disk
 */
function handleFileUpload(event) {
    console.log("Loading MandArt from file...");
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const jsonData = JSON.parse(e.target.result);
            console.log("Loaded JSON from File:", jsonData);

            // Extract and update the active filename
            document.getElementById("drawingName").textContent = file.name; // Display file name

            applyJsonData(jsonData);
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

async function processMandArt(jsonData, name, imagePath = "") {
    try {
        console.log("Processing MandArt:", name, jsonData);

        if (!jsonData.picdef) {
            console.error("Error: MandArt JSON is missing 'picdef'.", jsonData);
            return;
        }

        const picdef = jsonData.picdef;
        console.log("Loaded picdef:", picdef);

        // Check image width/height
        if (!picdef.imageWidth || !picdef.imageHeight) {
            throw new Error("picdef is missing imageWidth or imageHeight.");
        }

        // Update UI Elements
        document.getElementById("drawingName").textContent = name;
        if (imagePath) document.getElementById("previewImage").src = imagePath;

        // Resize the canvas
        const canvas = document.getElementById("mandelbrotCanvas");
        canvas.width = picdef.imageWidth;
        canvas.height = picdef.imageHeight;
        console.log(`Canvas resized: ${canvas.width}x${canvas.height}`);

        // Apply Hues
        applyJsonData(jsonData);

        // Load Precomputed CSV Grid
        const csvPath = `assets/MandArt_Catalog/${name}.csv`;
        await loadPrecomputedGrid(csvPath);
    } catch (error) {
        console.error("Error processing MandArt:", error);
    }
}
