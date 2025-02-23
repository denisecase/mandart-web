// ColorEditorRow.js
import { rgbToHex } from "../utils/ColorUtils.js";

export function createColorEditorRow(index, hue, updateHue, removeHue) {
    const hueDiv = document.createElement("div");
    hueDiv.className = "hue-item";

    hueDiv.innerHTML = `
        <span class="hue-index">${hue.num}</span>
        <input type="color" class="hue-picker" value="${rgbToHex(hue.r, hue.g, hue.b)}" data-index="${index}">
        <button class="delete-btn fas fa-trash" title="Remove Color"></button>
    `;

    const colorInput = hueDiv.querySelector(".hue-picker");
    const deleteBtn = hueDiv.querySelector(".delete-btn");

    if (!colorInput || !deleteBtn) {
        console.error("❌ createColorEditorRow: Missing elements in hueDiv.");
        return hueDiv;
    }

    colorInput.addEventListener("input", (event) => updateHue(index, event.target.value));


    deleteBtn.addEventListener("click", () => {
        if (confirm(`Are you sure you want to delete hue ${hue.num}?`)) {
            removeHue(index);
        }
    });
    return hueDiv;
}