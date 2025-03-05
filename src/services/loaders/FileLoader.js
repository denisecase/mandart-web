/**
 * src/services/loaders/FileLoader.js
 * Loader for MandArt data from a local File object.
 */
export default class FileLoader {
  /**
   * Loads the MandArt JSON from a given File object.
   * @param {File} file - The user-selected file (.mandart).
   * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
   */
  async loadFromFile(file) {
    try {
      console.log(`📂 Reading MandArt from local file: ${file.name}`);
      const fileContents = await this._readFileAsText(file);
      const mandArtJson = JSON.parse(fileContents);
      return { success: true, data: mandArtJson };
    } catch (error) {
      console.error('❌ Error loading from file:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper to read the file as text
   */
  _readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }
}
