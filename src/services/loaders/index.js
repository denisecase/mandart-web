/**
 * src/services/loaders/index.js
 * Loader facade that provides a unified interface for all MandArt data sources.
 * This module exports singleton instances of each loader and a factory function.
 */

import CatalogLoader from './CatalogLoader.js';
import FileLoader from './FileLoader.js';
import UrlLoader from './UrlLoader.js';

// Singleton instances
export const catalogLoader = new CatalogLoader();
export const fileLoader = new FileLoader();
export const urlLoader = new UrlLoader();

/**
 * Factory function to get the appropriate loader.
 * @param {string} source - The source type ('file', 'url', 'catalog').
 * @returns {object|null} The corresponding loader instance or null if invalid.
 */
export function getLoader(source) {
  switch (source?.toLowerCase()) {
    case 'file': return fileLoader;
    case 'url': return urlLoader;
    case 'catalog': return catalogLoader;
    default:
      console.warn(`⚠️ Unknown source type: ${source}`);
      return null;
  }
}

/**
 * Load MandArt data from a specified source.
 * @param {string} source - The source type ('file', 'url', 'catalog').
 * @param {*} data - The source-specific input (File, URL, or Catalog ID).
 * @returns {Promise<object>} Result object with { success, data, error }.
 */
export async function loadFrom(source, data) {
  const loader = getLoader(source);
  if (!loader) return { success: false, error: `Unknown source type: ${source}` };

  try {
    switch (source.toLowerCase()) {
      case 'file': return await loader.loadFromFile(data);
      case 'url': return await loader.loadFromUrl(data);
      case 'catalog': return await loader.loadFromCatalog(data);
      default: throw new Error(`Unhandled source type: ${source}`);
    }
  } catch (error) {
    console.error(`❌ Error loading from ${source}:`, error);
    return { success: false, error: error.message || `Failed to load from ${source}` };
  }
}
