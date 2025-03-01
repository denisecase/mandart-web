// utils/color_editor_utils.js

/**
 * Convert RGB values to Hex color string.
 * Ensures values are within 0-255 range.
 */
export function rgbToHex(r, g, b) {
    return `#${((1 << 24) | (r << 16) | (g << 8) | b)
        .toString(16)
        .slice(1)
        .toUpperCase()}`;
}

/**
 * Convert Hex color string to RGB object.
 * Supports both 3-digit and 6-digit hex formats.
 */
export function hexToRgb(hex) {
    if (typeof hex !== "string") {
        throw new Error("❌ hexToRgb() expects a string input.");
    }

    hex = hex.trim().toUpperCase();

    // Expand shorthand hex codes (#FFF → #FFFFFF)
    if (hex.length === 4) {
        hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
    }

    if (!/^#([0-9A-F]{6})$/.test(hex)) {
        throw new Error(`❌ Invalid hex color format: ${hex}`);
    }

    let bigint = parseInt(hex.substring(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}
