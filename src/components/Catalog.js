import PathConfig from '../core/PathConfig.js';
import mandArtCatalogService from '../services/MandArtCatalogService.js';

/**
 * Catalog component (stupid UI):
 * - Shows a modal listing MandArt items (with images, sorted alphabetically).
 * - Dispatches a 'catalog-item-selected' custom event (with { itemId }) when user clicks on an item.
 * - Any logic for loading or applying that item is handled externally.
 */
export default class Catalog {
  constructor() {
    // Create the modal <aside> element
    this.element = document.createElement('aside');
    this.element.className = 'modal catalog-modal';
    this.element.id = 'catalogModal';

    this.modalContent = document.createElement('div');
    this.modalContent.className = 'modal-content';
    this.element.appendChild(this.modalContent);

    // Close button (top-right '×')
    const closeButton = document.createElement('span');
    closeButton.className = 'modal-close-btn';
    closeButton.id = 'catalogCloseBtn';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => this.hide());
    this.modalContent.appendChild(closeButton);

    // Title
    const title = document.createElement('h2');
    title.textContent = 'MandArt Catalog';
    this.modalContent.appendChild(title);

    // Container for items
    this.catalogContainer = document.createElement('div');
    this.catalogContainer.className = 'grid-container';
    this.catalogContainer.id = 'mandartList';
    this.modalContent.appendChild(this.catalogContainer);

    this.isLoading = false;
    this.data = null; // cached array of catalog items
  }

  /**
   * Loads catalog data from MandArtCatalogService, sorts it, and renders.
   */
  async loadCatalogData() {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      console.log("📂 Loading MandArt catalog data via service...");
      
      // Use the service to load catalog data (cached after first load)
      this.data = await mandArtCatalogService.loadCatalog();
      console.log(`Found ${this.data.length} MandArt files in catalog`);

      // Sort data alphabetically by name
      this.data.sort((a, b) => a.name.localeCompare(b.name));

      this.renderCatalogItems();
    } catch (error) {
      console.error('❌ Failed to load MandArt Catalog:', error);
      this.showErrorMessage('Failed to load catalog. Please try again later.');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Renders the sorted catalog items (MandArt entries) in a grid.
   */
  renderCatalogItems() {
    if (!this.data || !Array.isArray(this.data) || this.data.length === 0) {
      this.showErrorMessage('No catalog items available.');
      return;
    }

    // Clear container
    this.catalogContainer.innerHTML = '';

    // Create grid container
    const grid = document.createElement('div');
    grid.className = 'catalog-grid';
    this.catalogContainer.appendChild(grid);

    // Add each item
    this.data.forEach(item => {
      const itemElement = this.createCatalogItemElement(item);
      grid.appendChild(itemElement);
    });
  }

  /**
   * Creates an individual "catalog item" element (thumbnail, name, click event).
   */
  createCatalogItemElement(item) {
    const itemElement = document.createElement('div');
    itemElement.className = 'catalog-item';
    itemElement.dataset.id = item.name;

    // Create thumbnail container
    const thumbnail = document.createElement('div');
    thumbnail.className = 'catalog-thumbnail';

    // Compute image path from item.name
    const imagePath = PathConfig.getMandArtImagePath(item.name);

    // Create <img>
    const img = document.createElement('img');
    img.src = imagePath;
    img.alt = item.name;
    // Fallback if image fails to load
    img.onerror = () => {
      img.style.display = 'none';
      thumbnail.textContent = item.name;
    };
    thumbnail.appendChild(img);

    itemElement.appendChild(thumbnail);

    // Info section (e.g. <h3> item name </h3>)
    const info = document.createElement('div');
    info.className = 'catalog-item-info';

    const title = document.createElement('h3');
    title.textContent = item.name;
    info.appendChild(title);

    itemElement.appendChild(info);

    // Click event => dispatch "catalog-item-selected"
    itemElement.addEventListener('click', () => {
      this.handleItemSelect(item.name);
    });

    return itemElement;
  }

  /**
   * Dispatch a custom event with { itemId }, hide the modal.
   */
  handleItemSelect(itemName) {
    const event = new CustomEvent('catalog-item-selected', {
      detail: { itemId: itemName }
    });
    this.element.dispatchEvent(event);
    this.hide();
  }

  /**
   * Display an error message if loading fails or no items exist.
   */
  showErrorMessage(message) {
    this.catalogContainer.innerHTML = '';

    const errorElement = document.createElement('div');
    errorElement.className = 'catalog-error';
    errorElement.textContent = message;

    const retryButton = document.createElement('button');
    retryButton.textContent = 'Retry';
    retryButton.addEventListener('click', () => this.loadCatalogData());

    errorElement.appendChild(document.createElement('br'));
    errorElement.appendChild(retryButton);

    this.catalogContainer.appendChild(errorElement);
  }

  /**
   * Show the catalog modal
   */
  show() {
    console.log('📂 Opening Catalog Modal...');
    this.element.style.display = 'flex';

    // If data is empty or null, load it again
    if (!this.data || this.data.length === 0) {
      this.loadCatalogData();
    }
  }

  /**
   * Hide the catalog modal
   */
  hide() {
    this.element.style.display = 'none';
  }
}
