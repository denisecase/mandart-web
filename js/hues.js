let hues = [];

function applyJsonData(data) {
    hues = data.hues;
    updateHueList();
    recolorCanvas();
}

function updateHueList() {
    const hueListDiv = document.getElementById("hueList");
    hueListDiv.innerHTML = "";

    hues.forEach((hue, index) => {
        let hueDiv = document.createElement("div");
        hueDiv.className = "hue-item";
        hueDiv.draggable = true;
        hueDiv.dataset.index = index;

        hueDiv.innerHTML = `
            <span>${hue.num}</span>
            <input type="color" value="${rgbToHex(hue.r, hue.g, hue.b)}" data-index="${index}">
            <button onclick="removeHue(${index})">X</button>
        `;

        hueDiv.querySelector("input").addEventListener("input", updateHueColor);
        hueDiv.addEventListener("dragstart", handleDragStart);
        hueDiv.addEventListener("dragover", handleDragOver);
        hueDiv.addEventListener("drop", handleDrop);
        hueListDiv.appendChild(hueDiv);
    });
}

function updateHueColor(event) {
    const index = event.target.dataset.index;
    const color = hexToRgb(event.target.value);
    hues[index].r = color.r;
    hues[index].g = color.g;
    hues[index].b = color.b;
    recolorCanvas();
}

function removeHue(index) {
    hues.splice(index, 1);
    updateHueList();
}

// Drag and Drop Sorting
let draggedItem = null;

function handleDragStart(event) {
    draggedItem = event.target;
    event.dataTransfer.effectAllowed = "move";
}

function handleDragOver(event) {
    event.preventDefault();
}

function handleDrop(event) {
    event.preventDefault();
    const targetIndex = event.target.closest(".hue-item").dataset.index;
    const sourceIndex = draggedItem.dataset.index;

    if (targetIndex !== sourceIndex) {
        const movedHue = hues.splice(sourceIndex, 1)[0];
        hues.splice(targetIndex, 0, movedHue);
        updateHueList();
    }
}

function rgbToHex(r, g, b) {
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function hexToRgb(hex) {
    let bigint = parseInt(hex.substring(1), 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}
