// models/CatalogSelection.js
// ✅ Represents a selected catalog item (selected file)

export default class CatalogSelection {
    constructor({ selectedFile = null }) {
        this.selectedFile = selectedFile; // URL of the selected catalog file (or null)
    }

    // Getter for selectedFile
    getSelectedFile() {
        return this.selectedFile;
    }

    // Setter for selectedFile
    setSelectedFile(fileUrl) {
        this.selectedFile = fileUrl;
    }

    // Reset method for the selection
    resetSelection() {
        this.selectedFile = null;
    }
}
