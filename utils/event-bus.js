// utils/event-bus.js
export function createEventEmitter() {
    const events = {};
    return {
        subscribe(event, listener) {
            if (!events[event]) {
                events[event] = [];
            }
            events[event].push(listener);
            return () => {
                events[event] = events[event].filter(l => l !== listener);
            };
        },
        emit(event, ...args) {
            if (events[event]) {
                events[event].forEach(listener => listener(...args));
            }
        }
    };
}

export const eventBus = createEventEmitter();
