// utils/event-emitter.js

/**
 * Creates a simple event emitter.
 * @returns {Object} An event emitter with `on` and `emit` methods.
 */
export function createEventEmitter() {
    const events = {};

    return {
        /**
         * Subscribe to an event.
         * @param {string} event - The event name.
         * @param {Function} listener - The callback to invoke when the event is emitted.
         * @returns {Function} Unsubscribe function.
         */
        on(event, listener) {
            if (!events[event]) {
                events[event] = [];
            }
            events[event].push(listener);
            // Return an unsubscribe function.
            return () => {
                events[event] = events[event].filter(l => l !== listener);
            };
        },

        /**
         * Emit an event.
         * @param {string} event - The event name.
         * @param  {...any} args - Arguments to pass to the event listeners.
         */
        emit(event, ...args) {
            if (events[event]) {
                events[event].forEach(listener => listener(...args));
            }
        }
    };
}
