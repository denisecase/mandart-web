/**
 * src/services/loaders/UrlLoader.js
 * Loader for MandArt data from URL sources.
 */
export default class UrlLoader {
  /**
   * Loads the MandArt JSON from a given URL, returns { success, data, error }.
   * No calls to processAndUpdateMandArt here.
   * @param {string} url - The URL to fetch.
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async loadFromUrl(url) {
    try {
      console.log(`🌍 Fetching MandArt from: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const mandArtJson = await response.json();
      return { success: true, data: mandArtJson };
    } catch (error) {
      console.error('❌ Error loading from URL:', error);
      return { success: false, error: error.message };
    }
  }
}
