/**
 * src/services/loaders/CatalogLoader.js
 * Loader for MandArt data from shortName in the local catalog.
 */
import PathConfig from '../../core/PathConfig.js';

export default class CatalogLoader {
  /**
   * Loads the MandArt JSON given a shortName (e.g. "AAA1"),
   * returns { success, data, error }.
   * @param {string} shortName
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async loadFromCatalog(shortName) {
    try {
      console.log(`🔄 CatalogLoader.loadFromCatalog() with itemId=${shortName}`);
      const filePath = PathConfig.getMandArtFilePath(shortName); 
      console.log(`🔄 Loading MandArt from catalog: ${filePath}`);
      
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const mandArtJson = await response.json();
      console.log(`🔄 CatalogLoader.loadFromCatalog() parse success.`, mandArtJson);

      return { success: true, data: mandArtJson };
    } catch (error) {
      console.error('❌ Error loading from catalog:', error);
      return { success: false, error: error.message };
    }
  }
}
