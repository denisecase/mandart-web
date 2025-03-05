import mandArtState from '../state/MandArtState.js';
import { fileLoader, urlLoader, catalogLoader } from './loaders/index.js';
import PathConfig from '../core/PathConfig.js';
import { getShapeInputs, getColorInputs } from './MandArtServiceInputUtils.js';
import gridCalculator from '../core/GridCalculator.js';
import colorProcessor from '../core/ColorProcessor.js';
import fileService from './FileService.js';
import ColorListManager from '../core/ColorListManager.js';
import Hue from '../models/Hue.js'; // ensure Hue is defined in your models folder

/**
 * Service for managing MandArt data and operations.
 * Acts as the intermediary between the UI and the core computation layer.
 */
class MandArtService {
  currentGrid = null; // Uncolored grid (2D)
  subscribers = [];

  constructor() {
    this.initialize();
  }

  /**
   * Initializes the service by loading the default MandArt.
   */
  async initialize() {
    try {
      console.log('Initializing MandArt service...');
      const defaultMandArtPath = PathConfig.getDefaultMandArtPath();
      console.log('Default MandArt path:', defaultMandArtPath);

      const response = await fetch(defaultMandArtPath);
      if (!response.ok)
        throw new Error(`Failed to load Default.mandart (Status: ${response.status})`);

      const defaultMandArt = await response.json();
      // Force the name to be "Default" for the default MandArt
      defaultMandArt.name = "Default";
      console.log('✅ Default MandArt loaded successfully');

      await this.processAndUpdateMandArt(defaultMandArt, 'default');
    } catch (error) {
      console.error('❌ Failed to initialize MandArt service:', error);
    }
  }

/**
 * Loads a MandArt file from a given source.
 * @param {File|String} source - File object or URL or short name like "AAA1"
 * @param {'file'|'url'|'catalog'} type - Source type.
 * @param {string} [fallbackName=null] - A short name if the JSON doesn't have a "name" property.
 */
async loadMandArt(source, type, fallbackName = null) {
  console.log(`🔄 Service.loadMandArt where source=${source}`);
  console.log(`🔄 Service.loadMandArt where type=${type}`);

  try {
    let loaderResult;
    if (type === 'file') {
      loaderResult = await fileLoader.loadFromFile(source);
    } else if (type === 'url') {
      loaderResult = await urlLoader.loadFromUrl(source);
    } else if (type === 'catalog') {
      loaderResult = await catalogLoader.loadFromCatalog(source);
    } else {
      throw new Error(`Invalid source type: ${type}`);
    }

    if (!loaderResult.success) {
      throw new Error(loaderResult.error || `Failed to load from ${type}`);
    }

    // The loader gave us { success: true, data: mandArtJson }, so:
    return await this.processAndUpdateMandArt(
      loaderResult.data, 
      type,
      fallbackName
    );
  } catch (error) {
    console.error(`❌ Error loading MandArt from ${type}:`, error);
    return { success: false, error: error.message || `Failed to load from ${type}` };
  }
}

  /**
   * Processes MandArt JSON data, computes its grid, applies colors, and updates state.
   * @param {Object} mandArtJsonData - The MandArt JSON data (often missing "name").
   * @param {string} sourceType - Source identifier, e.g. 'file', 'url', 'catalog'.
   * @param {string} [fallbackName=null] - A short name (like "AAA1") to use if the JSON lacks "name".
   */
  async processAndUpdateMandArt(mandArtJsonData, sourceType, fallbackName = null) {
    try {
      console.log(`🔄 MandArtService.processAndUpdateMandArt() with source=${sourceType}...`);
      console.log("🔄 Received mandArtJsonData:", mandArtJsonData);
      console.log("🔄 Processing hues:", mandArtJsonData.hues);

      if (!mandArtJsonData || typeof mandArtJsonData !== 'object') {
        throw new Error('Invalid MandArt data');
      }
      const finalName = mandArtJsonData.name || fallbackName || "Untitled MandArt";
      console.log(`🔄 Final name resolved to: "${finalName}"`);

      // Parse shape & color inputs
      const shapeInputs = getShapeInputs(mandArtJsonData);
      const colorInputs = getColorInputs(mandArtJsonData);
      console.log("🔄 Extracted shape inputs:", shapeInputs);
      console.log("🔄 Extracted color inputs:", colorInputs);
      console.log("🔄 Processing color input hues:", colorInputs.hues);

      // Attempt to load a precomputed grid using finalName
      const precomputedGrid = await gridCalculator.loadPrecomputedGrid(finalName);
      if (precomputedGrid) {
        console.log("Using precomputed grid");
        this.currentGrid = precomputedGrid;
      } else {
        console.log("Computing grid from shape inputs");
        this.currentGrid = await gridCalculator.compute(mandArtJsonData);
      }

      // Use the standardized palette from colorInputs.hues if present, otherwise generate defaults.
      const palette = (colorInputs.hues && colorInputs.hues.length > 0)
        ? colorInputs.hues
        : this.generateDefaultHues();
      console.log(`Using ${palette.length} hues for coloring`);

      // Apply colors to the computed grid
      const coloredGrid = await colorProcessor.applyColors(this.currentGrid, palette);

      // Construct a locked-down state object with finalName
      const updatedMandArt = {
        name: finalName,
        shapeInputs, // standardized shape inputs
        colorInputs: {
          ...colorInputs,
          hues: palette
        },
        coloredGrid
      };

      // Update the global state & notify subscribers
      mandArtState.updateArt(updatedMandArt, sourceType);
      this.notifySubscribers(updatedMandArt);

      return { success: true, data: updatedMandArt };
    } catch (error) {
      console.error('❌ Error processing MandArt:', error);
      return { success: false, error: error.message || 'Failed to process MandArt' };
    }
  }


  /**
   * Generates default hues if none are provided.
   * Returns six Hue instances matching the Swift defaults.
   * @returns {Hue[]} Array of Hue objects.
   */
  generateDefaultHues() {
    console.log("Generating default hues");
    return [
      new Hue({ num: 1, r: 0, g: 255, b: 0 }),
      new Hue({ num: 2, r: 255, g: 255, b: 0 }),
      new Hue({ num: 3, r: 255, g: 0, b: 0 }),
      new Hue({ num: 4, r: 255, g: 0, b: 255 }),
      new Hue({ num: 5, r: 0, g: 0, b: 255 }),
      new Hue({ num: 6, r: 0, g: 255, b: 255 })
    ];
  }

  /**
   * Reapplies colors to the current grid using the given array of hue objects.
   * @param {Hue[]} hues - The new array of Hue objects.
   */
  async updateColors(hues) {
    try {
      const currentArt = mandArtState.art;
      if (!currentArt) throw new Error('No current MandArt to update');
      if (!this.currentGrid) throw new Error('No grid available, cannot update colors');

      const coloredGrid = await colorProcessor.applyColors(this.currentGrid, hues);
      // Update the locked-down state: colors go inside colorInputs.hues
      const updatedArt = {
        ...currentArt,
        coloredGrid,
        colorInputs: { ...currentArt.colorInputs, hues }
      };

      mandArtState.updateArt(updatedArt, 'color-edit');
      return { success: true, data: updatedArt };
    } catch (error) {
      console.error('❌ Error updating colors:', error);
      return { success: false, error: error.message || 'Failed to update colors' };
    }
  }

  /**
   * Updates a single color in the current MandArt.
   * @param {number} index - The index of the color to update.
   * @param {string} hexColor - The new hex color value.
   */
  async updateColor(index, hexColor) {
    try {
      const currentArt = mandArtState.art;
      if (!currentArt)
        throw new Error('No current MandArt to update');
      if (!Array.isArray(currentArt.colorInputs?.hues))
        throw new Error('Current MandArt does not have a valid hues array');

      const colorManager = new ColorListManager();
      const updatedHues = colorManager.updateColor(currentArt.colorInputs.hues, index, hexColor);
      return await this.updateColors(updatedHues);
    } catch (error) {
      console.error('❌ Error updating single color:', error);
      return { success: false, error: error.message || 'Failed to update color' };
    }
  }

  /**
   * Deletes a color from the current MandArt.
   * @param {number} index - The index of the color to delete.
   */
  async deleteColor(index) {
    try {
      const currentArt = mandArtState.art;
      if (!currentArt)
        throw new Error('No current MandArt to update');
      if (!Array.isArray(currentArt.colorInputs?.hues))
        throw new Error('Current MandArt does not have a valid hues array');

      const colorManager = new ColorListManager();
      const updatedHues = colorManager.removeColor(currentArt.colorInputs.hues, index);
      return await this.updateColors(updatedHues);
    } catch (error) {
      console.error('❌ Error deleting color:', error);
      return { success: false, error: error.message || 'Failed to delete color' };
    }
  }

  /**
   * Saves the current MandArt as a .mandart file.
   */
  saveMandArt() {
    const currentArt = mandArtState.art;
    if (!currentArt) {
      console.error('❌ No MandArt to save.');
      return;
    }
    fileService.saveFile(currentArt, `${currentArt.name || 'art'}.mandart`);
  }

  /**
   * Saves the current rendered canvas as a PNG file.
   * @param {HTMLCanvasElement} canvas - The canvas element to save.
   */
  saveCanvasAsPNG(canvas) {
    if (!canvas) {
      console.error('❌ No canvas to save.');
      return;
    }
    fileService.saveCanvasAsPNG(canvas, `${mandArtState.art?.name || 'art'}.png`);
  }

  /**
   * Returns the current MandArt from state.
   */
  getCurrentArt() {
    return mandArtState.art;
  }

  /**
   * Returns the current uncolored grid.
   */
  getCurrentGrid() {
    return this.currentGrid;
  }

  /**
   * Subscribe to MandArt state changes.
   * @param {function} callback - The callback function.
   */
  subscribe(callback) {
    console.log("🟢 MandArtService: New subscriber added.");
    this.subscribers.push(callback);
    if (mandArtState.art) {
      callback(mandArtState.art);
    }
  }

  notifySubscribers(art) {
    console.log("🔔 Notifying subscribers with new art:", art);
    this.subscribers.forEach(callback => callback(art));
  }
}

// Singleton instance
const mandArtService = new MandArtService();
export default mandArtService;
