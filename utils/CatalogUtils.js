export async function loadMandArtCatalog() {
    try {
        console.log("📂 Loading MandArt Catalog...");
        const response = await fetch("assets/mandart_discoveries.json");

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        console.log("✅ Catalog Loaded:", data);

        listContainer.innerHTML = ""; // Clear existing content

        data.forEach((item) => {
            const imagePath = `assets/MandArt_Catalog/${item.name}.png`;
            const mandartPath = `assets/MandArt_Catalog/${item.name}.mandart`;

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
                console.log(`🎨 Loading MandArt: ${item.name}`);
                loadMandArt(mandartPath, imagePath, item.name);
                closeCatalogModal();
            });

            listContainer.appendChild(itemDiv);
        });
    } catch (error) {
        console.error("❌ Failed to load MandArt Catalog:", error);
    }
}