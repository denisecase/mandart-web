export default class Hue {
  /**
   * @param {Object} options
   * @param {string} [options.id] - A unique identifier (generated if not provided)
   * @param {number} [options.num=1] - Order in the list (use 0 for mandColor)
   * @param {number} [options.r=0] - Red component (0–255)
   * @param {number} [options.g=255] - Green component (0–255)
   * @param {number} [options.b=0] - Blue component (0–255)
   */
  constructor({ id = Hue.generateUUID(), num = 1, r = 0, g = 255, b = 0 } = {}) {
    this.id = id;
    this.num = num;
    this.r = r;
    this.g = g;
    this.b = b;
  }

  /**
   * Generates a pseudo‑UUID.
   * @returns {string}
   */
  static generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Convert this Hue object to a `[num, r, g, b]` array for WASM.
   * @returns {Array<number>}
   */
  to_wasm() {
    return [this.num, this.r, this.g, this.b];  // ✅ Ensure 4 values are always returned
  }
}
