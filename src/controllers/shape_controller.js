import ShapeInputs from "../models/ShapeInputs.js";

export function createShapeInputs(data) {
  return new ShapeInputs(
    data.imageHeight,
    data.imageWidth,
    data.iterationsMax,
    data.scale,
    data.xCenter,
    data.yCenter,
    data.theta,
    data.dFIterMin,
    data.rSqLimit,
    data.mandPowerReal
  );
}

export function getShapeInputsForWasm(shapeInputs) {
  return shapeInputs.to_wasm();
}
