// src/ColorEditorRow.js
// Update the ColorEditorRow class to support drag and drop

import { rgbToHex } from './utils/color_editor_utils.js';

export default class ColorEditorRow {
  constructor(index, color, updateCallback, deleteCallback, reorderCallback) {
    this.index = index;
    this.color = color;
    this.updateCallback = updateCallback;
    this.deleteCallback = deleteCallback;
    this.reorderCallback = reorderCallback; // New callback for reordering
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

    // Add drag and drop event listeners
    this._setupDragEvents(row);
  }

  _setupDragEvents(row) {
    // Make the row draggable
    row.setAttribute('draggable', 'true');
    row.setAttribute('aria-grabbed', 'false');
    row.setAttribute('aria-dropeffect', 'move');
    row.draggable = true; // Redundant but helps with some browsers

    // Track drag state for styling and accessibility
    let draggedElement = null;
    let draggedIndex = null;

    // Handle the dragstart event
    row.addEventListener('dragstart', (e) => {
      // Set the drag data
      draggedIndex = this.index;
      e.dataTransfer.setData('text/plain', this.index);
      e.dataTransfer.effectAllowed = 'move';

      // Add a visual class and set ARIA attributes
      draggedElement = row;
      row.classList.add('dragging');
      row.setAttribute('aria-grabbed', 'true');

      // For debugging
      console.log(`🔄 Started dragging color #${this.index + 1}`);

      // We delay this to ensure the drag image is set first
      setTimeout(() => {
        // Add insertion indicators between rows
        const allRows = document.querySelectorAll('.hue-row');
        allRows.forEach(r => {
          if (r !== draggedElement) {
            // Create insertion markers before each row
            const insertBefore = document.createElement('div');
            insertBefore.className = 'insert-marker insert-before';
            r.parentNode.insertBefore(insertBefore, r);
          }
        });

        // Add a final insertion marker at the end
        const lastMarker = document.createElement('div');
        lastMarker.className = 'insert-marker insert-after';

        // Find the container with multiple fallbacks
        const container = document.querySelector('.hue-list') ||
          document.getElementById('hueList') ||
          allRows[0]?.parentNode;

        if (container) {
          container.appendChild(lastMarker);
        }
      }, 0);
    });

    // Handle the dragend event
    row.addEventListener('dragend', () => {
      // Remove all visual indicators and reset ARIA attributes
      if (draggedElement) {
        draggedElement.classList.remove('dragging');
        draggedElement.setAttribute('aria-grabbed', 'false');
        draggedElement = null;
      }

      // Remove insertion markers
      document.querySelectorAll('.insert-marker').forEach(marker => {
        marker.remove();
      });

      // Remove any highlighting from rows
      document.querySelectorAll('.hue-row').forEach(r => {
        r.classList.remove('drag-over');
      });

      console.log('🔄 Drag ended');
    });

    // Handle the dragover event (needed to allow dropping)
    row.addEventListener('dragover', (e) => {
      // This is crucial - must prevent default to allow drop
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });

    // Visual feedback for dragenter
    row.addEventListener('dragenter', (e) => {
      e.preventDefault();

      if (row !== draggedElement) {
        // Get mouse position relative to the row
        const rect = row.getBoundingClientRect();
        const mouseY = e.clientY;
        const rowMidpoint = rect.top + (rect.height / 2);

        // Clear any previous highlighting
        document.querySelectorAll('.insert-marker').forEach(marker => {
          marker.classList.remove('active');
        });

        // Highlight the appropriate marker based on mouse position
        if (mouseY < rowMidpoint) {
          // Highlight the marker before this row
          const beforeMarker = row.previousElementSibling;
          if (beforeMarker && beforeMarker.classList.contains('insert-marker')) {
            beforeMarker.classList.add('active');
          }
        } else {
          // Highlight the marker after this row
          const afterMarker = row.nextElementSibling;
          if (afterMarker && afterMarker.classList.contains('insert-marker')) {
            afterMarker.classList.add('active');
          } else if (row === document.querySelectorAll('.hue-row').item(document.querySelectorAll('.hue-row').length - 1)) {
            // If it's the last row, highlight the final marker
            document.querySelector('.insert-marker.insert-after')?.classList.add('active');
          }
        }
      }
    });

    // Add a dedicated drop event handler directly on the row
    row.addEventListener('drop', (e) => {
      e.preventDefault();
      try {
        const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        let toIndex = this.index;

        if (fromIndex !== toIndex) {
          console.log(`🔄 Moving color from ${fromIndex} to ${toIndex}`);

          // Get the current color state
          const colorState = getColorState();

          // Create a deep copy of hues array to trigger reactivity
          const newHues = [...colorState.hues];

          // Move the dragged item
          const [movedItem] = newHues.splice(fromIndex, 1);
          newHues.splice(toIndex, 0, movedItem);

          // Update the color state
          updateColorState({ hues: newHues });

          console.log("🎨 Color state updated after drag:", newHues);

          // Emit events to ensure UI updates
          eventBus.emit('color-state-changed');
          eventBus.emit('force-render-canvas'); // ✅ Force canvas update
        }
      } catch (error) {
        console.error("❌ Error in drop handler:", error);
      }
    });


    // Add event listeners to insertion markers as well
    document.addEventListener('drop', (e) => {
      // Handle drops on insertion markers
      if (e.target.classList && e.target.classList.contains('insert-marker')) {
        e.preventDefault();
        console.log("DROP EVENT FIRED on insertion marker");

        try {
          // Get the dragged index from the stored value since dataTransfer might be unavailable
          const fromIndex = draggedIndex;

          // Find the index for this marker
          let toIndex = 0;

          // Determine the target index based on the marker's position
          const allRows = Array.from(document.querySelectorAll('.hue-row'));
          const allMarkers = Array.from(document.querySelectorAll('.insert-marker'));
          const markerIndex = allMarkers.indexOf(e.target);

          if (e.target.classList.contains('insert-after')) {
            // This is the last marker, insert at the end
            toIndex = allRows.length;
          } else {
            // Find the next non-marker sibling which should be the row
            let nextRow = e.target.nextElementSibling;
            while (nextRow && nextRow.classList.contains('insert-marker')) {
              nextRow = nextRow.nextElementSibling;
            }

            if (nextRow && nextRow.classList.contains('hue-row')) {
              // Get the index from the row
              toIndex = parseInt(nextRow.dataset.index, 10);
            }
          }

          console.log(`🔄 Dropping color from position ${fromIndex + 1} to position ${toIndex + 1} (marker drop)`);

          // Don't do anything if dropping onto itself
          if (fromIndex === toIndex) {
            console.log("Drop canceled - same position");
            return;
          }

          // We need to find the reorderCallback from somewhere
          // Try to get it from an existing row
          const anyRow = document.querySelector('.hue-row');
          if (anyRow && anyRow._instance && anyRow._instance.reorderCallback) {
            console.log("Found reorderCallback through DOM");
            anyRow._instance.reorderCallback(fromIndex, toIndex);
          } else if (window.reorderColor) {
            // Try global function
            console.log("Using global reorderColor");
            window.reorderColor(fromIndex, toIndex);
          } else {
            console.error("Cannot find reorderCallback for marker drop");
          }
        } catch (error) {
          console.error("Error in marker drop handler:", error);
        }
      }
    });
  }

  _createRow() {
    if (!this.color || typeof this.color !== "object") {
      console.error(`🚨 Error: Invalid color object at index ${this.index}:`, this.color);
      return document.createElement("div");  // Return empty div to prevent crashes
    }

    const row = document.createElement("div");
    row.className = "hue-row";
    row.dataset.index = this.index;

    // Create a handle container to organize drag handle and sort number
    const handleContainer = document.createElement("div");
    handleContainer.className = "handle-container";

    // Create drag handle element
    const dragHandle = document.createElement("div");
    dragHandle.className = "drag-handle";
    dragHandle.setAttribute("aria-label", "Drag to reorder");
    dragHandle.setAttribute("role", "button");
    dragHandle.setAttribute("tabindex", "0");

    // Add visual indicator (grip lines)
    for (let i = 0; i < 3; i++) {
      const gripLine = document.createElement("span");
      gripLine.className = "grip-line";
      dragHandle.appendChild(gripLine);
    }

    // Create sort number
    const sortNum = document.createElement("span");
    sortNum.className = "sort-num";
    sortNum.textContent = `${this.index + 1}`; // Display 1-based index

    // Add handle and sort number to container in the correct order
    handleContainer.appendChild(dragHandle);
    handleContainer.appendChild(sortNum);

    // Add handle container as the first element in the row
    row.appendChild(handleContainer);

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

    // Add keyboard support for drag and drop
    this._setupKeyboardDragDrop(row, dragHandle);

    return row;
  }

  _setupKeyboardDragDrop(row, dragHandle) {
    // Keyboard support for the drag handle
    dragHandle.addEventListener('keydown', (e) => {
      // Handle Enter or Space to start drag mode
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();

        // Toggle a keyboard-drag mode class
        row.classList.toggle('keyboard-drag-mode');
        const isInDragMode = row.classList.contains('keyboard-drag-mode');

        // Update ARIA attributes
        row.setAttribute('aria-grabbed', isInDragMode ? 'true' : 'false');

        // Announce to screen readers
        this._announceToScreenReader(isInDragMode
          ? `Color ${this.index + 1} selected for reordering. Use arrow keys to move and Enter to confirm.`
          : `Stopped reordering color ${this.index + 1}`);

        // If entering drag mode, set focus trap and handle arrow keys
        if (isInDragMode) {
          this._setupKeyboardNavigation(row);
        }
      }
    });
  }

  _setupKeyboardNavigation(row) {
    // Function to handle keyboard navigation
    const handleKeyNav = (e) => {
      if (!row.classList.contains('keyboard-drag-mode')) {
        // Remove event listener if no longer in keyboard drag mode
        document.removeEventListener('keydown', handleKeyNav);
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (this.index > 0) {
            console.log(`🔄 Moving color #${this.index + 1} up`);
            this.reorderCallback(this.index, this.index - 1);
            // Focus will be handled in the redraw
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          // Get total count of rows
          const totalRows = document.querySelectorAll('.hue-row').length;
          if (this.index < totalRows - 1) {
            console.log(`🔄 Moving color #${this.index + 1} down`);
            this.reorderCallback(this.index, this.index + 1);
            // Focus will be handled in the redraw
          }
          break;

        case 'Enter':
        case 'Escape':
          e.preventDefault();
          // Exit keyboard drag mode
          row.classList.remove('keyboard-drag-mode');
          row.setAttribute('aria-grabbed', 'false');
          document.removeEventListener('keydown', handleKeyNav);
          this._announceToScreenReader(`Finished reordering color ${this.index + 1}`);
          break;
      }
    };

    // Add the keyboard navigation event listener
    document.addEventListener('keydown', handleKeyNav);
  }

  _announceToScreenReader(message) {
    // Create or use an existing live region for screen reader announcements
    let announcer = document.getElementById('sr-announcer');

    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'sr-announcer';
      announcer.className = 'sr-only';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      document.body.appendChild(announcer);
    }

    // Set the message
    announcer.textContent = message;

    // Clear after a delay to prevent multiple rapid announcements from stacking
    setTimeout(() => {
      announcer.textContent = '';
    }, 3000);
  }
}


