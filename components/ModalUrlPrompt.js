// components/ModalUrlPrompt.js
// ✅ Modal for prompting a URL input for loading a MandArt file.

import { getUIElement } from '../globals.js';
import {DEFAULT_MODAL_URL} from '../constants.js';

/**
 * ✅ **ModalUrlPrompt Component**
 * - Uses `globals.js` to get modal elements.
 * - Displays a draggable URL input modal.
 * - Dispatches a `'url-submitted'` event when submitted.
 */
export default class ModalUrlPrompt {
  constructor() {
    this.element = getUIElement('urlModal');
    this.urlInput = getUIElement('urlInput');
    this.loadButton = getUIElement('loadUrlBtn');
    this.cancelButton = getUIElement('cancelUrlBtn');
    this.titlebar = this.element?.querySelector('.url-modal-titlebar');

    if (!this.element || !this.urlInput || !this.loadButton || !this.cancelButton) {
      console.error("❌ ModalUrlPrompt: Missing UI elements.");
      return;
    }

    this.makeDraggable();
  }

  /**
   * ✅ **Show the modal**
   */
  show() {
    this.element.style.display = 'flex';
    this.element.classList.add('fade-in');

    // Reset the input field
    this.urlInput.value = DEFAULT_MODAL_URL || '';
    setTimeout(() => this.urlInput.focus(), 100);

    // Center the modal if it was dragged previously
    if (this.element.style.transform === 'none') {
      this.element.style.top = '50%';
      this.element.style.left = '50%';
      this.element.style.transform = 'translate(-50%, -50%)';
    }
  }

  /**
   * ✅ **Hide the modal**
   */
  hide() {
    this.element.style.display = 'none';
    this.element.classList.remove('fade-in');
    this.urlInput.value = '';
  }

  /**
   * ✅ **Make the modal draggable**
   */
  makeDraggable() {
    if (!this.titlebar) return;
    
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    this.titlebar.onmousedown = dragMouseDown.bind(this);

    function dragMouseDown(e) {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag.bind(this);
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      this.element.style.top = (this.element.offsetTop - pos2) + "px";
      this.element.style.left = (this.element.offsetLeft - pos1) + "px";
      this.element.style.transform = 'none';
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
}
