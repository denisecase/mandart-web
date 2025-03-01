// src/components/Header.js
import mandArtService from '../services/MandArtService.js';
import PathConfig from '../core/PathConfig.js';

/**
 * Header component for the MandArt application
 * Provides navigation and control elements.
 */
export default class Header {
  constructor() {
    this.element = this._createHeader();
    this._setupEventListeners();
  }

  /**
   * Creates the header element and its children.
   * @returns {HTMLElement} The header element
   */
  _createHeader() {
    const header = document.createElement('header');

    header.innerHTML = `
      <h1>MandArt Web (Under Construction)</h1>
      <div class="header-buttons">
        <button id="openListBtn">Open from Catalog</button>
        <select id="mandartSelect">
          <option value="">Select a MandArt</option>
        </select>
        <button id="openUrlBtn">Open from URL...</button>
        <button id="openFileBtn">Open from File...</button>
      </div>
      <div class="header-buttons">
        <button id="saveMandArtBtn">Save Inputs</button>
        <button id="savePNGBtn">Export PNG</button>
        <button id="saveGridBtn">Export Grid</button>
      </div>
    `;
    return header;
  }

  /**
   * Sets up event listeners for header controls.
   */
  _setupEventListeners() {
    console.log("🟢 Header.js: setting up event listeners");

    // "Open from Catalog"
    this.element.querySelector('#openListBtn')?.addEventListener('click', () => {
      document.dispatchEvent(new Event('open-catalog'));
    });

    // "Open from URL..."
    this.element.querySelector('#openUrlBtn')?.addEventListener('click', () => {
      document.dispatchEvent(new Event('open-url-prompt'));
    });

    // "Open from File..."
    this.element.querySelector('#openFileBtn')?.addEventListener('click', () => {
      document.dispatchEvent(new Event('open-file-dialog'));
    });

    // "Save Inputs"
    this.element.querySelector('#saveMandArtBtn')?.addEventListener('click', () => {
      document.dispatchEvent(new Event('save-mandart'));
    });

    // "Export PNG"
    this.element.querySelector('#savePNGBtn')?.addEventListener('click', () => {
      document.dispatchEvent(new Event('export-png'));
    });

    // "Export Grid"
    this.element.querySelector('#saveGridBtn')?.addEventListener('click', () => {
      document.dispatchEvent(new Event('export-grid'));
    });

    // Dropdown selection => dispatch "select-mandart" event with selected name
    const select = this.element.querySelector('#mandartSelect');
    if (select) {
      select.addEventListener('change', (event) => {
        const name = event.target.value;
        document.dispatchEvent(new CustomEvent('select-mandart', { detail: name }));
      });
    }
  }
}
