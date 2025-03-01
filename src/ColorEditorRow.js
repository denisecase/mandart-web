import { rgbToHex } from "./utils/color_editor_utils.js";

export default class ColorEditorRow {
  constructor(index, color, updateCallback, deleteCallback) {
    this.index = index;
    this.color = color;
    this.updateCallback = updateCallback;
    this.deleteCallback = deleteCallback;
    this.element = this._createRow();
  }

  async handleDelete() {
    if (confirm(`Are you sure you want to delete color #${this.index + 1}?`)) {
      console.log(`🗑️ Deleting color #${this.index}`);
      this.deleteCallback(this.index);  // ✅ Calls deleteCallback function
    }
  }

  _setupEventListeners(row, colorInput, deleteBtn) {
    colorInput.addEventListener("input", (event) => {
      const newHex = event.target.value;
      console.log(`🖍️ Color picker changed to: ${newHex}`);
      this.updateCallback(this.index, newHex);
    });

    deleteBtn.addEventListener("click", () => this.handleDelete());
  }

  _createRow() {
    console.log(`🖍️ ColorEditorRow.createRow() DEBUG: Creating row #${this.index} with color:`, this.color);

    if (!this.color || typeof this.color !== "object") {
      console.error(`🚨 Error: Invalid color object at index ${this.index}:`, this.color);
      return document.createElement("div");  // Return empty div to prevent crashes
    }

    const row = document.createElement("div");
    row.className = "hue-row";
    row.dataset.index = this.index;

    const sortNum = document.createElement("span");
    sortNum.className = "sort-num";
    sortNum.textContent = `${this.index + 1}`; // Display 1-based index
    row.appendChild(sortNum);

    // Create a container for the color picker and its label
    const colorPickerContainer = document.createElement("div");
    colorPickerContainer.className = "color-picker-container";
    
    // Create a unique ID for this color picker
    const colorId = `color-picker-${this.index}`;
    
    // Create the label element
    const label = document.createElement("label");
    label.className = "color-picker-label";
    label.textContent = `Color ${this.index + 1}`;
    label.setAttribute("for", colorId);
    // Make the label visually hidden but still accessible to screen readers
    label.style.position = "absolute";
    label.style.width = "1px";
    label.style.height = "1px";
    label.style.overflow = "hidden";
    label.style.clip = "rect(0, 0, 0, 0)";
    label.style.whiteSpace = "nowrap";
    
    // Create the color input with proper ID and aria attributes
    const colorInput = document.createElement("input");
    colorInput.type = "color";
    colorInput.className = "color-picker";
    colorInput.id = colorId;
    colorInput.setAttribute("aria-label", `Select color for hue ${this.index + 1}`);
    colorInput.value = rgbToHex(this.color.r, this.color.g, this.color.b) || "#000000";  // 🔥 Default black if undefined
    
    // Add the label and input to the container
    colorPickerContainer.appendChild(label);
    colorPickerContainer.appendChild(colorInput);
    
    // Add the container to the row
    row.appendChild(colorPickerContainer);

    // Create delete button with enhanced accessibility
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn fas fa-trash";
    deleteBtn.setAttribute("aria-label", `Delete color ${this.index + 1}`);
    deleteBtn.textContent = "";
    row.appendChild(deleteBtn);

    // 🔄 Attach event listeners
    this._setupEventListeners(row, colorInput, deleteBtn);

    return row;
  }
}
