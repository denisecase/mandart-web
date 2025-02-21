/**
 * Reassigns hue numbers sequentially after a deletion.
 * Ensures `num` values are unique, sequential, and ordered correctly.
 *
 * @param {Array} hues - The list of hues to be renumbered.
 * @returns {Array} - The updated hues list with corrected `num` values.
 */
export function reassignHueNumbers(hues) {
    return hues.map((hue, index) => ({
        ...hue,
        num: index + 1 // ✅ Reassign sequential numbers starting from 1
    }));
}
