// components/Canvas.js
// ✅ Manages the canvas element & exposes update methods.

import { getUIElement } from '../globals.js';
import { eventBus } from '../state/state-all.js';

export default class Canvas {
    constructor() {
        this.canvas = getUIElement('canvas');
        console.log("Canvas element:", getUIElement('canvas'));
        this.ctx = this.canvas?.getContext('2d');

        if (!this.canvas || !this.ctx) {
            console.error("❌ Canvas: Unable to initialize canvas.");
            return;
        }

        console.log("🎨 Canvas initialized.");

        // Subscribe to canvas update events
        eventBus.subscribe('canvas-update', (imageData) => this.renderCanvas(imageData));
    }

    /**
     * ✅ Sets the dimensions of the canvas.
     * @param {number} width - Canvas width.
     * @param {number} height - Canvas height.
     */
    setCanvasDimensions(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        console.log(`📏 Canvas resized: ${width}x${height}`);
    }

    /**
     * ✅ Clears the entire canvas.
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        console.log("🧹 Canvas cleared.");
    }

    /**
     * ✅ Renders image data on the canvas.
     * @param {ImageData} imageData - Image data to render.
     */
    renderCanvas(imageData) {
        this.clearCanvas();
        this.ctx.putImageData(imageData, 0, 0);
        console.log("🎨 Canvas updated via render function.");
    }
}

/**
 * ✅ Initializes the Canvas component.
 * @returns {Canvas} The instantiated Canvas.
 */
export function initCanvas() {
    const canvasInstance = new Canvas();
    canvasInstance.clearCanvas();
    if (!canvasInstance.canvas || !canvasInstance.ctx) {
        console.error("❌ initCanvas: Canvas initialization failed.");
    } else {
        console.log("✅ initCanvas: Canvas instance created.");
    }
    return canvasInstance;
}
