document.addEventListener("DOMContentLoaded", () => {
    loadMandArtCatalog(); // Load thumbnails in sidebar on page load

    document.getElementById("openFileBtn").addEventListener("click", () => {
        document.getElementById("fileInput").click();
    });

    document.getElementById("fileInput").addEventListener("change", handleFileUpload);
    document.getElementById("openUrlBtn").addEventListener("click", handleUrlInput);
    document.getElementById("openListBtn").addEventListener("click", loadMandArtCatalog);
});

// 📌 Load the MandArt catalog (thumbnails + names) in the sidebar
async function loadMandArtCatalog() {
    const response = await fetch("assets/mandart_discoveries.json");
    const data = await response.json();
    const listContainer = document.getElementById("mandartList");
    listContainer.innerHTML = ""; // Clear previous content

    data.forEach(item => {
        const imagePath = `assets/MandArt_Catalog/${item.name}.png`; // Fix the image path
        const mandartPath = `assets/MandArt_Catalog/${item.name}.mandart`; // Fix the JSON path

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
        });

        listContainer.appendChild(itemDiv);
    });
}

// 📌 Load a selected MandArt file
async function loadMandArt(url, imagePath, name) {
    try {
        const response = await fetch(url);
        const jsonData = await response.json();
        document.getElementById("drawingName").textContent = name;
        document.getElementById("previewImage").src = imagePath;
        applyJsonData(jsonData);
    } catch (error) {
        console.error("Failed to load MandArt:", error);
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const jsonData = JSON.parse(e.target.result);
        applyJsonData(jsonData);
    };
    reader.readAsText(file);
}

function handleUrlInput() {
    const url = prompt("Enter the URL of the MandArt JSON:");
    if (url) {
        loadMandArt(url, "", "Custom URL");
    }
}
