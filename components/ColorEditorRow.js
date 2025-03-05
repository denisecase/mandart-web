// components/ColorEditorRow.js
// ✅ Color Editor Row component for MandArt Web application

import { rgbToHex } from '../utils/color-utils.js';
import { eventBus } from '../utils/event-bus.js';
import { getColorState, updateColorState } from '../state/state-color-inputs.js';

/**
 * Class representing a color editor row
 */
export class ColorEditorRow {
    /**
     * Create a color editor row
     * @param {Object} config - Configuration for the row
     * @param {number} config.index - Index of the hue in the list
     * @param {Array<number>} config.hue - Hue array [num, r, g, b]
     */
    constructor({ index, hue }) {
        this.index = index;
        this.hue = hue;
        this.element = this.createRowElement();
        this.setupDragEvents(); // ✅ Add drag-and-drop events
    }

    /**
     * ✅ Create the row element
     * @returns {HTMLElement} The row element
     */
    createRowElement() {
        const row = document.createElement('div');
        row.className = 'hue-row';
        row.dataset.index = this.index;

        // Create drag handle
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle';
        dragHandle.setAttribute('aria-label', 'Drag to reorder');
        dragHandle.setAttribute('role', 'button');
        dragHandle.setAttribute('tabindex', '0');

        // Add grip lines
        for (let i = 0; i < 3; i++) {
            const gripLine = document.createElement('span');
            gripLine.className = 'grip-line';
            dragHandle.appendChild(gripLine);
        }

        // Create color picker
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.className = 'color-picker';
        colorPicker.value = rgbToHex(this.hue[1], this.hue[2], this.hue[3]); // Correct color display

        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn fas fa-trash';
        deleteBtn.setAttribute('aria-label', 'Delete this color');
        deleteBtn.title = 'Delete color';

        // Attach event listeners
        colorPicker.addEventListener('input', (event) => {
            const newColor = event.target.value;
            console.log(`🖍️ Color changed: ${newColor}`);

            // Update state
            const colorState = getColorState();
            colorState.hues[this.index] = [this.hue[0], ...this._hexToRgb(newColor)];
            updateColorState({ hues: colorState.hues });
        });

        deleteBtn.addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete this color?`)) {
                console.log(`🗑️ Deleting color at index ${this.index}`);
                const colorState = getColorState();
                colorState.hues.splice(this.index, 1);
                colorState.colors.splice(this.index, 1);
                updateColorState({ hues: colorState.hues });
            }
        });

        // Add elements to row
        row.appendChild(dragHandle);
        row.appendChild(colorPicker);
        row.appendChild(deleteBtn);

        return row;
    }

    /**
     * ✅ Set up drag-and-drop event listeners
     */
    setupDragEvents() {
        const row = this.element;
        let draggedIndex = null;

        row.setAttribute('draggable', 'true');
        row.setAttribute('aria-grabbed', 'false');
        row.setAttribute('aria-dropeffect', 'move');

        row.addEventListener('dragstart', (e) => {
            draggedIndex = this.index;
            e.dataTransfer.setData('text/plain', this.index);
            e.dataTransfer.effectAllowed = 'move';
            row.classList.add('dragging');
            row.setAttribute('aria-grabbed', 'true');
            console.log(`🔄 Started dragging color #${this.index + 1}`);
        });

        row.addEventListener('dragend', () => {
            row.classList.remove('dragging');
            row.setAttribute('aria-grabbed', 'false');
            console.log('🔄 Drag ended');
        });

        row.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        row.addEventListener('drop', (e) => {
            e.preventDefault();
            try {
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                let toIndex = this.index;

                if (fromIndex !== toIndex) {
                    console.log(`🔄 Moving color from ${fromIndex} to ${toIndex}`);
                    eventBus.emit('color-reordered', { fromIndex, toIndex });
                    eventBus.emit('color-state-changed');

                    // Reorder state and force a new array reference
                    const colorState = getColorState();
                    const movedItem = colorState.hues.splice(fromIndex, 1)[0];
                    colorState.hues.splice(toIndex, 0, movedItem);
                    // Recalculate hue numbers so they are sequential starting at 1.
                    const updatedHues = colorState.hues.map((hue, index) => [index + 1, hue[1], hue[2], hue[3]]);
                    updateColorState({ hues: updatedHues });
                }
            } catch (error) {
                console.error("Error in drop handler:", error);
            }
        });
    }

    /**
     * ✅ Convert hex color to RGB
     * @param {string} hex - Hex color value
     * @returns {Array<number>} RGB values [r, g, b]
     */
    _hexToRgb(hex) {
        const bigint = parseInt(hex.substring(1), 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }

    /**
     * ✅ Get the row element
     * @returns {HTMLElement} The row element
     */
    getElement() {
        return this.element;
    }


}



/**
 * Adds drag-and-drop visual enhancements to hue rows.
 */
/**
 * Adds drag-and-drop visual enhancements to hue rows.
 */
export function enhanceDragAndDrop() {
    // First, add a top insertion marker to allow dropping above the first row.
    const hueList = document.getElementById('hueList');
    if (hueList) {
        let topMarker = hueList.querySelector('.top-insert-marker');
        if (!topMarker) {
            topMarker = document.createElement('div');
            topMarker.className = 'insert-marker top-insert-marker';
            // Set minimal inline styles to ensure the marker is clickable
            topMarker.style.height = "10px";
            topMarker.style.position = "absolute";
            topMarker.style.top = "0";
            topMarker.style.left = "0";
            topMarker.style.right = "0";
            topMarker.style.pointerEvents = "auto"; // Allow drop events on top marker
            // Ensure the container is positioned relatively so that the absolute marker is placed correctly
            hueList.style.position = "relative";
            hueList.insertBefore(topMarker, hueList.firstChild);
        }
        topMarker.classList.remove('active');

        topMarker.addEventListener('dragenter', (e) => {
            e.preventDefault();
            topMarker.classList.add('active');
        });

        topMarker.addEventListener('dragover', (e) => {
            e.preventDefault();
            topMarker.classList.add('active');
        });

        topMarker.addEventListener('dragleave', () => {
            topMarker.classList.remove('active');
        });

        topMarker.addEventListener('drop', (e) => {
            console.log("DROP EVENT on top marker");
            e.preventDefault();
            topMarker.classList.remove('active');
            // Move the dragged hue to index 0.
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
            const colorState = getColorState();
            if (fromIndex !== 0) {
                const movedItem = colorState.hues.splice(fromIndex, 1)[0];
                colorState.hues.unshift(movedItem);
                // Recalculate hue numbers.
                const updatedHues = colorState.hues.map((hue, index) => [index + 1, hue[1], hue[2], hue[3]]);
                updateColorState({ hues: updatedHues });
            }
        });
    }

    // Then, add insertion markers between rows (unchanged).
    const rows = document.querySelectorAll('.hue-row');
    console.log("enhanceDragAndDrop: Found", rows.length, "rows.");
    rows.forEach((row, idx) => {
        const dropIndicator = document.createElement('div');
        dropIndicator.className = 'insert-marker';
        row.parentNode.insertBefore(dropIndicator, row.nextSibling);

        row.addEventListener('dragenter', (e) => {
            e.preventDefault();
            dropIndicator.classList.add('active');
            console.log("dragenter on row", idx);
        });

        row.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropIndicator.classList.add('active');
            console.log("dragover on row", idx);
        });

        row.addEventListener('dragleave', () => {
            dropIndicator.classList.remove('active');
            console.log("dragleave on row", idx);
        });

        row.addEventListener('drop', (e) => {
            console.log("CONTROLS DROP EVENT on row", idx);
            e.preventDefault();
            dropIndicator.classList.remove('active');
            eventBus.emit('force-render-canvas'); // Ensure canvas updates
        });
    });
}

