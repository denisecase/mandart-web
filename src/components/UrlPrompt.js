import PathConfig from '../core/PathConfig.js';

/**
 * URL Prompt modal for loading MandArt from a URL.
 * This component is "stupid" and dispatches a custom event ("url-submitted")
 * with the entered URL. A controller (e.g. AppController.js) listens for that
 * event and calls mandArtService.loadMandArt(...) as needed.
 */
export default class UrlPrompt {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'url-modal';
    this.element.id = 'urlModal';
    // Hide by default
    this.element.style.display = 'none';
    this.createContent();
    this.setupEventListeners();
  }

  /**
   * Create the modal content
   */
  createContent() {
    const content = document.createElement('div');
    content.className = 'url-modal-content';

    // Title bar
    const titlebar = document.createElement('div');
    titlebar.className = 'url-modal-titlebar';
    titlebar.textContent = 'Load MandArt from URL';
    content.appendChild(titlebar);

    // Close button
    const closeBtn = document.createElement('span');
    closeBtn.className = 'modal-close-btn';
    closeBtn.innerHTML = '&times;';
    titlebar.appendChild(closeBtn);

    // URL input
    const urlInput = document.createElement('textarea');
    urlInput.id = 'urlInput';
    urlInput.className = 'url-input';
    urlInput.placeholder = 'Enter a URL to a .mandart file';
    urlInput.value = PathConfig.getDefaultUrl();
    content.appendChild(urlInput);

    // Buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'modal-buttons';

    // Load button
    const loadBtn = document.createElement('button');
    loadBtn.id = 'loadUrlBtn';
    loadBtn.textContent = 'Load';
    loadBtn.className = 'btn btn-primary';
    buttonsContainer.appendChild(loadBtn);

    // Cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.id = 'cancelUrlBtn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.className = 'btn btn-secondary';
    buttonsContainer.appendChild(cancelBtn);

    content.appendChild(buttonsContainer);
    this.element.appendChild(content);
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Close button
    const closeBtn = this.element.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // Cancel button
    const cancelBtn = this.element.querySelector('#cancelUrlBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hide());
    }

    // Load button & URL input
    const loadBtn = this.element.querySelector('#loadUrlBtn');
    const urlInput = this.element.querySelector('#urlInput');

    if (loadBtn && urlInput) {
      loadBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (url) {
          this.handleUrlSubmit(url);
        }
      });

      // Also handle Enter key
      urlInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          const url = urlInput.value.trim();
          if (url) {
            this.handleUrlSubmit(url);
          }
        }
      });
    }

    // Make modal draggable (if titlebar exists)
    const titlebar = this.element.querySelector('.url-modal-titlebar');
    if (titlebar) {
      this.makeDraggable(titlebar);
    }
  }

  /**
   * Make the modal draggable
   * @param {HTMLElement} handle - Element to use as drag handle
   */
  makeDraggable(handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    handle.onmousedown = dragMouseDown.bind(this);

    function dragMouseDown(e) {
      e.preventDefault();
      // Get the mouse cursor position at startup
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // Call a function whenever the cursor moves
      document.onmousemove = elementDrag.bind(this);
    }

    function elementDrag(e) {
      e.preventDefault();
      // Calculate the new cursor position
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // Set the element's new position
      this.element.style.top = (this.element.offsetTop - pos2) + "px";
      this.element.style.left = (this.element.offsetLeft - pos1) + "px";
      // Reset transform so the modal doesn't snap back to the center
      this.element.style.transform = 'none';
    }

    function closeDragElement() {
      // Stop moving when mouse button is released
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  /**
   * Handle URL submission
   * @param {string} url - The URL to load
   */
  handleUrlSubmit(url) {
    console.log(`URL submitted: ${url}`);

    // Dispatch a custom event so the main controller can load the MandArt
    document.dispatchEvent(new CustomEvent('url-submitted', { detail: url }));

    this.hide();
  }

  /**
   * Show the modal
   */
  show() {
    this.element.style.display = 'flex';
    this.element.classList.add('fade-in');

    // Select urlInput properly before using it
    const urlInput = this.element.querySelector('#urlInput');
    if (urlInput) {
        urlInput.value = PathConfig.getDefaultUrl(); // Ensure it always resets to the default URL
        setTimeout(() => urlInput.focus(), 100);
    }

    // Center the modal if it was dragged previously
    if (this.element.style.transform === 'none') {
        this.element.style.top = '50%';
        this.element.style.left = '50%';
        this.element.style.transform = 'translate(-50%, -50%)';
    }
}


  /**
   * Hide the modal
   */
  hide() {
    this.element.style.display = 'none';
    this.element.classList.remove('fade-in');

    // Clear the input
    const urlInput = this.element.querySelector('#urlInput');
    if (urlInput) {
      urlInput.value = '';
    }
  }
}
