// utils/color-utils.js
// Color utility functions for MandArt Web application

/**
 * Convert RGB values to hex color code
 * @param {number} r - Red component (0-255)
 * @param {number} g - Green component (0-255)
 * @param {number} b - Blue component (0-255)
 * @returns {string} Hex color code (#RRGGBB)
 */
export function rgbToHex(r, g, b) {
    // Ensure RGB values are valid integers
    r = Math.max(0, Math.min(255, Math.round(r)));
    g = Math.max(0, Math.min(255, Math.round(g)));
    b = Math.max(0, Math.min(255, Math.round(b)));
    
    // Convert to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Convert hex color code to RGB values
 * @param {string} hex - Hex color code (#RRGGBB or RRGGBB)
 * @returns {Object} RGB components { r, g, b }
 */
export function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');
    
    // Parse RGB values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
}

/**
 * Create a color interpolation function
 * @param {Array} colors - Array of RGB colors in format [r, g, b]
 * @returns {Function} Interpolation function that takes a value between 0 and 1
 */
export function createColorInterpolator(colors) {
    if (!colors || colors.length < 2) {
        throw new Error('At least two colors are required for interpolation');
    }
    
    /**
     * Interpolate between colors based on a value
     * @param {number} t - Value between 0 and 1
     * @returns {Array} RGB color in format [r, g, b]
     */
    return function(t) {
        // Ensure t is between 0 and 1
        t = Math.max(0, Math.min(1, t));
        
        // Calculate which segment to use
        const segment = t * (colors.length - 1);
        const index = Math.floor(segment);
        
        // Handle edge case
        if (index >= colors.length - 1) {
            return colors[colors.length - 1];
        }
        
        // Get the two colors to interpolate between
        const color1 = colors[index];
        const color2 = colors[index + 1];
        
        // Calculate the weight
        const weight = segment - index;
        
        // Interpolate RGB values
        const r = Math.round(color1[0] + weight * (color2[0] - color1[0]));
        const g = Math.round(color1[1] + weight * (color2[1] - color1[1]));
        const b = Math.round(color1[2] + weight * (color2[2] - color1[2]));
        
        return [r, g, b];
    };
}

/**
 * Generate a color palette from hues
 * @param {Array} hues - Array of Hue objects
 * @param {number} steps - Number of colors in the palette
 * @returns {Array} Array of colors in format [r, g, b]
 */
export function generatePalette(hues, steps = 256) {
    if (!hues || hues.length === 0) {
        return Array(steps).fill([0, 0, 0]);
    }
    
    // Extract RGB values from hues
    const colors = hues.map(hue => [hue.r, hue.g, hue.b]);
    
    // Create interpolator
    const interpolate = createColorInterpolator(colors);
    
    // Generate palette
    const palette = [];
    for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        palette.push(interpolate(t));
    }
    
    return palette;
}

/**
 * Calculate contrast ratio between two colors
 * @param {Array} color1 - RGB color in format [r, g, b]
 * @param {Array} color2 - RGB color in format [r, g, b]
 * @returns {number} Contrast ratio (1-21)
 */
export function calculateContrastRatio(color1, color2) {
    // Calculate luminance for each color
    const l1 = calculateLuminance(color1);
    const l2 = calculateLuminance(color2);
    
    // Calculate contrast ratio
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    
    return ratio;
}

/**
 * Calculate luminance of an RGB color
 * @param {Array} color - RGB color in format [r, g, b]
 * @returns {number} Luminance value (0-1)
 */
function calculateLuminance(color) {
    // Normalize RGB values
    const [r, g, b] = color.map(channel => {
        const value = channel / 255;
        return value <= 0.03928
            ? value / 12.92
            : Math.pow((value + 0.055) / 1.055, 2.4);
    });
    
    // Calculate luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Generate a complementary color
 * @param {Array} color - RGB color in format [r, g, b]
 * @returns {Array} Complementary RGB color
 */
export function getComplementaryColor(color) {
    return [
        255 - color[0],
        255 - color[1],
        255 - color[2]
    ];
}

/**
 * Adjust color brightness
 * @param {Array} color - RGB color in format [r, g, b]
 * @param {number} factor - Brightness factor (0-2, 1 is unchanged)
 * @returns {Array} Adjusted RGB color
 */
export function adjustBrightness(color, factor) {
    return color.map(channel => {
        return Math.max(0, Math.min(255, Math.round(channel * factor)));
    });
}