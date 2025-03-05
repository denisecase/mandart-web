/**
 * src/services/MandArtServiceValidatorUtils.js
 * Centralized validation and sanitization for MandArt objects.
 */

/**
 * Validates a MandArt object to ensure it has the required structure and properties.
 * @param {object} mandArt - The MandArt object to validate
 * @returns {boolean} True if the object is valid, false otherwise
 */
export function validateMandArt(mandArt) {
    if (!mandArt || typeof mandArt !== 'object' || Array.isArray(mandArt)) {
        console.error('❌ Invalid MandArt: not an object');
        return false;
    }

    // Required fields validation
    const requiredFields = ['id', 'scale', 'xCenter', 'yCenter', 'imageWidth', 'imageHeight', 'hues'];
    for (const field of requiredFields) {
        if (!(field in mandArt)) {
            console.error(`❌ Invalid MandArt: missing required field '${field}'`);
            return false;
        }
    }

    // Validate ID
    if (typeof mandArt.id !== 'string' || mandArt.id.trim() === '') {
        console.error('❌ Invalid MandArt: id must be a non-empty string');
        return false;
    }

    // Validate numeric properties
    const numericProps = ['scale', 'xCenter', 'yCenter', 'imageWidth', 'imageHeight', 'iterationsMax', 'rSqLimit'];
    for (const prop of numericProps) {
        if (prop in mandArt && (typeof mandArt[prop] !== 'number' || isNaN(mandArt[prop]))) {
            console.error(`❌ Invalid MandArt: ${prop} must be a valid number`);
            return false;
        }
    }

    // Validate hues array
    if (!Array.isArray(mandArt.hues)) {
        console.error('❌ Invalid MandArt: hues must be an array');
        return false;
    }

    // Validate each hue object
    for (let i = 0; i < mandArt.hues.length; i++) {
        const hue = mandArt.hues[i];

        // Each hue should have required properties
        if (!hue.id || typeof hue.id !== 'string') {
            console.error(`❌ Invalid MandArt: hue at index ${i} has an invalid id`);
            return false;
        }

        // Validate RGB values
        const rgbProps = ['r', 'g', 'b', 'num'];
        for (const prop of rgbProps) {
            if (typeof hue[prop] !== 'number' || hue[prop] < 0 || (prop !== 'num' && hue[prop] > 255)) {
                console.error(`❌ Invalid MandArt: hue at index ${i} has an invalid ${prop} value`);
                return false;
            }
        }

        // Validate color object if it exists
        if (hue.color && typeof hue.color === 'object') {
            const colorProps = ['red', 'green', 'blue'];
            for (const prop of colorProps) {
                if (typeof hue.color[prop] !== 'number' || hue.color[prop] < 0 || hue.color[prop] > 1) {
                    console.error(`❌ Invalid MandArt: hue at index ${i} has an invalid color.${prop} value`);
                    return false;
                }
            }
        }
    }

    // Optional arrays validation
    const optionalArrays = ['huesOptimizedForPrinter', 'huesEstimatedPrintPreview'];
    for (const arrayName of optionalArrays) {
        if (arrayName in mandArt && !Array.isArray(mandArt[arrayName])) {
            console.error(`❌ Invalid MandArt: ${arrayName} must be an array`);
            return false;
        }
    }

    // All checks passed
    return true;
}

/**
 * Ensures valid shape inputs by providing defaults if missing.
 * @param {Object} shapeInputs - The shape input object.
 * @returns {Object} Sanitized shape inputs.
 */
export function sanitizeShapeInputs(shapeInputs) {
    if (!shapeInputs || typeof shapeInputs !== "object") {
        console.warn("⚠️ sanitizeShapeInputs: Invalid input, using defaults.");
        return getDefaultShapeInputs();
    }

    return {
        imageHeight: sanitizeNumber(shapeInputs.imageHeight, 1000),
        imageWidth: sanitizeNumber(shapeInputs.imageWidth, 1000),
        iterationsMax: sanitizeNumber(shapeInputs.iterationsMax, 100),
        scale: sanitizeNumber(shapeInputs.scale, 200),
        xCenter: sanitizeNumber(shapeInputs.xCenter, 0),
        yCenter: sanitizeNumber(shapeInputs.yCenter, 0),
        theta: sanitizeNumber(shapeInputs.theta, 0),
        dFIterMin: sanitizeNumber(shapeInputs.dFIterMin, 0),
        rSqLimit: sanitizeNumber(shapeInputs.rSqLimit, 4),
        mandPowerReal: sanitizeNumber(shapeInputs.mandPowerReal, 2)
    };
}

/**
 * Ensures valid color inputs by providing defaults if missing.
 * @param {Object} colorInputs - The color input object.
 * @returns {Object} Sanitized color inputs.
 */
export function sanitizeColorInputs(colorInputs) {
    if (!colorInputs || typeof colorInputs !== "object") {
        console.warn("⚠️ sanitizeColorInputs: Invalid input, using defaults.");
        return getDefaultColorInputs();
    }

    return {
        nBlocks: sanitizeNumber(colorInputs.nBlocks, 10),
        huesLength: sanitizeNumber(colorInputs.huesLength, 256),
        spacingColorFar: sanitizeNumber(colorInputs.spacingColorFar, 1.0),
        spacingColorNear: sanitizeNumber(colorInputs.spacingColorNear, 0.1),
        yY: sanitizeNumber(colorInputs.yY, 0),
        mandColor: colorInputs.mandColor ?? {},
        
        // ✅ FIX: Preserve full hue objects
        hues: Array.isArray(colorInputs.hues)
            ? colorInputs.hues.map(hue => ({
                id: hue.id ?? `hue-${Math.random()}`,  // Preserve ID or generate one
                hue: hue.hue ?? "#000000",  // Preserve original hue hex value
                num: hue.num ?? 1,  // Keep the original order number
                r: hue.r ?? 0, 
                g: hue.g ?? 0,
                b: hue.b ?? 0,
            }))
            : []
    };
}


/**
 * Default shape inputs (used if no valid input is provided).
 * @returns {Object} Default shape inputs.
 */
function getDefaultShapeInputs() {
    return {
        imageHeight: 1000,
        imageWidth: 1000,
        iterationsMax: 100,
        scale: 200,
        xCenter: 0,
        yCenter: 0,
        theta: 0,
        dFIterMin: 0,
        rSqLimit: 4,
        mandPowerReal: 2
    };
}

/**
 * Default color inputs (used if no valid input is provided).
 * @returns {Object} Default color inputs.
 */
function getDefaultColorInputs() {
    return {
        nBlocks: 10,
        huesLength: 256,
        spacingColorFar: 1.0,
        spacingColorNear: 0.1,
        yY: 0,
        mandColor: {},
        hues: []
    };
}

/**
 * Ensures a number is valid, or provides a default value.
 * @param {any} value - The value to check.
 * @param {number} defaultValue - The default to use if invalid.
 * @returns {number} A valid number.
 */
function sanitizeNumber(value, defaultValue) {
    return (typeof value === 'number' && !isNaN(value)) ? value : defaultValue;
}
