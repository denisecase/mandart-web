//utils/ArtImage.js

import { getShapeInputs, getColorInputs } from "../services/MandArtService.js";
import { generateGrid } from "./GridUtils.js";
import { renderMandelbrot } from "./RenderUtils.js";

export class ArtImage {
    constructor(picdef) {
        if (!picdef) throw new Error("❌ picdef is required to initialize ArtImage.");

        this.shapeInputs = getShapeInputs(picdef);
        this.colorInputs = getColorInputs(picdef);
    }

    computeGrid() {
        return generateGrid(this.shapeInputs);
    }

    render(canvas, hues) {
        renderMandelbrot(canvas, hues, this.computeGrid());
    }
}
