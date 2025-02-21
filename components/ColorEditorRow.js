import { rgbToHex } from "../utils/ColorUtils.js";

export function createColorEditorRow(index, hue, updateHue, removeHue) {
    const hueDiv = document.createElement("div");
    hueDiv.className = "hue-item";

   // ✅ Display `hue.num` instead of `index + 1`
   hueDiv.innerHTML = `
   <span class="hue-index"><strong>#${hue.num}</strong></span>
   <input type="color" class="hue-picker" value="${rgbToHex(hue.r, hue.g, hue.b)}" data-index="${hue.num}">
   <button class="delete-btn" title="Remove Color">🗑</button>
`;

    const colorInput = hueDiv.querySelector(".hue-picker");
    const deleteBtn = hueDiv.querySelector(".delete-btn");

    if (!colorInput || !deleteBtn) {
        console.error("❌ createColorEditorRow: Missing elements in hueDiv.");
        return hueDiv;
    }

    colorInput.addEventListener("input", (event) => updateHue(index, event.target.value));
    deleteBtn.addEventListener("click", () => removeHue(index));

    return hueDiv;
}
