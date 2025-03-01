//models/ShapeInputs.js

export default class ShapeInputs {
  constructor(
    imageHeight = 1000,
    imageWidth = 1000,
    iterationsMax = 100,
    scale = 200,
    xCenter = 0,
    yCenter = 0,
    theta = 0,
    dFIterMin = 0,
    rSqLimit = 4,
    mandPowerReal = 2
  ) {
    this.image_width = Number(imageWidth) || 1000;
    this.image_height = Number(imageHeight) || 1000;
    this.iterations_max = Number(iterationsMax) || 100;
    this.scale = Number(scale) || 200;
    this.x_center = Number(xCenter) || 0;
    this.y_center = Number(yCenter) || 0;
    this.theta = Number(theta) || 0;
    this.d_f_iter_min = Number(dFIterMin) || 0;
    this.r_sq_limit = Number(rSqLimit) || 4;
    this.mand_power_real = Number(mandPowerReal) || 2;
  }

  to_wasm() {
    return { ...this };
  }
}
