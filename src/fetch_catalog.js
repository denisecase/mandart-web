import { JSON_CATALOG_PATH, DEFAULT_MANDART_FILE } from "./constants.js";
import { processFile } from "./process_file.js";

export let MANDART_CATALOG = [];
export let defaultIndex = 0;

export async function fetchMandartCatalog() {
    try {
        console.log("Fetching MandArt catalog from JSON file at path:", JSON_CATALOG_PATH);
        const response = await fetch(JSON_CATALOG_PATH);
        if (!response.ok) throw new Error("Could not load MandArt catalog");

        MANDART_CATALOG = await response.json();
        MANDART_CATALOG.sort((a, b) => a.name.localeCompare(b.name));

        populateFileDropdown();
    } catch (error) {
        console.warn("Using default MandArt discoveries from JSON", error);
    }
}

function populateFileDropdown() {
    const select = document.getElementById("fileSelect");
    if (!select) {
        console.error("Dropdown element not found");
        return;
    }

    select.innerHTML = ""; // Clear previous options

    MANDART_CATALOG.forEach((fileObj, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = fileObj.name;
        select.appendChild(option);

        if (fileObj.name === DEFAULT_MANDART_FILE) {
            defaultIndex = index;
        }
    });

    select.value = defaultIndex;

    select.addEventListener("change", async (event) => {
        const selectedIndex = event.target.value;
        const selectedFile = MANDART_CATALOG[selectedIndex];
        await processFile(selectedFile);
    });

    if (MANDART_CATALOG.length > 0) {
        processFile(MANDART_CATALOG[defaultIndex]);
    }
}
