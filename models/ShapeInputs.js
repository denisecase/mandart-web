// models/ShapeInputs.js
// Defines the shape input structure for MandArt Web

export default class ShapeInputs {
  /**
   * @param {Object} data - Shape input values
   * @param {number} data.image_width - Image width (pixels)
   * @param {number} data.image_height - Image height (pixels)
   * @param {number} data.iterations_max - Max iterations for Mandelbrot calculation
   * @param {number} data.scale - Scale factor
   * @param {number} data.x_center - X coordinate of center
   * @param {number} data.y_center - Y coordinate of center
   * @param {number} data.theta - Rotation in radians
   * @param {number} data.r_sq_limit - Escape radius squared
   * @param {number} data.mand_power_real - Power of Mandelbrot equation (integer)
   * @param {number} data.d_f_iter_min - Minimum iteration threshold
   */
  constructor(data = {}) {
      this.image_width = data.image_width ?? 500;
      this.image_height = data.image_height ?? 500;
      this.iterations_max = data.iterations_max ?? 1000.0;
      this.scale = data.scale ?? 1.0;
      this.x_center = data.x_center ?? 0.0;
      this.y_center = data.y_center ?? 0.0;
      this.theta = data.theta ?? 0.0;
      this.r_sq_limit = data.r_sq_limit ?? 4.0;
      this.mand_power_real = data.mand_power_real ?? 2;
      this.d_f_iter_min = data.d_f_iter_min ?? 0.1;
  }

  /**
   * ✅ Converts the object into a JSON representation
   * @returns {Object} JSON-friendly object
   */
  toJSON() {
      return { ...this };
  }
}
