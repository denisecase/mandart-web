// utils/drag-drop-utils.js
// ✅ Manages Drag & Drop logic for color reordering

import { getColorState, updateColorState } from '../state/state-color-inputs.js';

export function setupDragEvents(row, index) {
    row.setAttribute('draggable', 'true');
    row.setAttribute('aria-grabbed', 'false');

    row.addEventListener('dragstart', (e) => {
        draggedIndex = index;
        e.dataTransfer.setData('text/plain', index);
        e.dataTransfer.effectAllowed = 'move';
        row.classList.add('dragging');
        row.setAttribute('aria-grabbed', 'true');
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


}
