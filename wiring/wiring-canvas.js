// ✅ Listens to shape & color state changes and triggers rendering.

import { eventBus } from '../state/state-all.js';
import { renderCanvas } from '../render/render-canvas.js';

/**
 * ✅ Initializes event wiring for canvas rendering.
 */
export function initCanvasWiring() {
    console.log("🖼️ Wiring: Subscribing to shape & color state updates...");

    eventBus.subscribe('shape-updated', () => {
        console.debug("🔄 Wiring: Shape state changed, triggering render.");
        renderCanvas();
    });

    eventBus.subscribe('color-state-changed', () => {
        console.debug("🎨 Wiring: Color state changed, triggering render.");
        renderCanvas();
    });
}
