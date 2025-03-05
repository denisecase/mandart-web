import { sanitizeShapeInputs, sanitizeColorInputs } from './MandArtServiceValidatorUtils.js';

/**
 * Utility classes for extracting MandArt shape and color inputs.
 */
export class ArtImageShapeInputs {
    constructor(
        imageHeight = 1000, imageWidth = 1000, iterationsMax = 100, scale = 200,
        xCenter = 0, yCenter = 0, theta = 0, dFIterMin = 0, rSqLimit = 4, mandPowerReal = 2
    ) {
        this.imageHeight = Number(imageHeight) || 1000;
        this.imageWidth = Number(imageWidth) || 1000;
        this.iterationsMax = Number(iterationsMax) || 100;
        this.scale = Number(scale) || 200;
        this.xCenter = Number(xCenter) || 0;
        this.yCenter = Number(yCenter) || 0;
        this.theta = Number(theta) || 0;
        this.dFIterMin = Number(dFIterMin) || 0;
        this.rSqLimit = Number(rSqLimit) || 4;
        this.mandPowerReal = Number(mandPowerReal) || 2;
    }
}

export class ArtImageColorInputs {
    constructor(nBlocks = 10, huesLength = 256, spacingColorFar = 1.0, spacingColorNear = 0.1, yY = 0, mandColor = {}, hues = []) {

        this.nBlocks = Number(nBlocks) || 10;
        this.huesLength = Number(huesLength) || 256;
        this.spacingColorFar = Number(spacingColorFar) || 1.0;
        this.spacingColorNear = Number(spacingColorNear) || 0.1;
        this.yY = Number(yY) || 0;
        this.mandColor = mandColor || {};
        this.hues = Array.isArray(hues) ? hues : []; 
    }
}

/**
 * Extracts `shapeInputs` from a given `picdef`.
 * @param {Object} picdef - The MandArt picdef object.
 * @returns {ArtImageShapeInputs} - The extracted shape inputs.
 */
export function getShapeInputs(picdef) {
    if (!picdef || typeof picdef !== "object") {
        console.error("❌ getShapeInputs: Invalid picdef provided", picdef);
        return new ArtImageShapeInputs(); // Return default values
    }
    const sanitizedInputs = sanitizeShapeInputs(picdef);
    return new ArtImageShapeInputs(
        sanitizedInputs.imageHeight, sanitizedInputs.imageWidth, sanitizedInputs.iterationsMax,
        sanitizedInputs.scale, sanitizedInputs.xCenter, sanitizedInputs.yCenter,
        -sanitizedInputs.theta, sanitizedInputs.dFIterMin, sanitizedInputs.rSqLimit, sanitizedInputs.mandPowerReal
    );
}

/**
 * Extracts `colorInputs` from a given `picdef`.
 * @param {Object} picdef - The MandArt picdef object.
 * @returns {ArtImageColorInputs} - The extracted color inputs.
 */
export function getColorInputs(picdef) {
    if (!picdef || typeof picdef !== "object") {
      console.error("❌ getColorInputs: Invalid picdef provided", picdef);
      return new ArtImageColorInputs(); // Return default values
    }
    const sanitizedInputs = sanitizeColorInputs(picdef);
  
    // Use the mandColor provided in the picdef if available; otherwise, default to black.
    const mandColor =
      picdef.mandColor && typeof picdef.mandColor === 'object' && picdef.mandColor.hue
        ? picdef.mandColor
        : { hue: "#000000", r: 0, g: 0, b: 0 };
  
    // Use the top-level "hues" array for the palette.
    const hues = Array.isArray(picdef.hues) ? picdef.hues : [];
    console.log("🔄 getColorInputs: Passing hues array:", hues);

    return new ArtImageColorInputs(
      sanitizedInputs.nBlocks,
      sanitizedInputs.huesLength,
      sanitizedInputs.spacingColorFar,
      sanitizedInputs.spacingColorNear,
      sanitizedInputs.yY,
      mandColor,
      hues
    );
  }
  