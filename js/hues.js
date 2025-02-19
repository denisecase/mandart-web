//hues.js

let hues = [];

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

/**
 * Updates the Hue List in the Color Editor.
 */
function updateHueList() {
  const hueListDiv = document.getElementById("hueList");
  hueListDiv.innerHTML = "";

  hues.forEach((hue, index) => {
    let hueDiv = document.createElement("div");
    hueDiv.className = "hue-item";
    hueDiv.innerHTML = `
            <span>${index + 1}</span>
            <input type="color" value="${rgbToHex(
              hue.r,
              hue.g,
              hue.b
            )}" data-index="${index}">
            <button class="delete-btn" onclick="removeHue(${index})">🗑</button>
        `;

    hueDiv.querySelector("input").addEventListener("input", updateHueColor);
    hueListDiv.appendChild(hueDiv);
  });

  console.log("Color List Updated!");
}

/**
 * Handles color changes in the hue list.
 */
function updateHueColor(event) {
  const index = event.target.dataset.index;
  const color = hexToRgb(event.target.value);
  hues[index].r = color.r;
  hues[index].g = color.g;
  hues[index].b = color.b;
  recolorCanvas();
}

/**
 * Removes a hue from the list.
 */
function removeHue(index) {
  hues.splice(index, 1);
  updateHueList();
}

/**
 * Converts RGB to Hex format.
 */
function rgbToHex(r, g, b) {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/**
 * Converts Hex to RGB format.
 */
function hexToRgb(hex) {
  let bigint = parseInt(hex.substring(1), 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

/**
 * Add a new color to the hues list and update UI
 */
function addNewColor() {
  const newHue = { r: 0, g: 0, b: 0 };
  hues.push(newHue); // Add to hues array
  updateHueList(); // Refresh the UI
  recolorCanvas(); // Apply hues to the canvas
}

/**
 * Update Mand Color based on user selection.
 */
function updateMandColor(event) {
  const color = hexToRgb(event.target.value);
  mandColor = { r: color.r, g: color.g, b: color.b };
  recolorCanvas(); // Apply new Mand Color
}