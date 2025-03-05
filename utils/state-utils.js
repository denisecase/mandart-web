// utils/state-utils.js
// State management utility functions for MandArt Web application

/**
 * Create a deep copy of an object or array
 * @param {*} obj - Object to copy
 * @returns {*} Deep copy of the object
 */
export function deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj);
    }
    
    if (obj instanceof Array) {
        return obj.map(item => deepCopy(item));
    }
    
    if (obj instanceof Object) {
        const copy = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                copy[key] = deepCopy(obj[key]);
            }
        }
        return copy;
    }
    
    throw new Error(`Unable to copy object: ${obj}`);
}

/**
 * Compare two objects for equality
 * @param {*} obj1 - First object
 * @param {*} obj2 - Second object
 * @returns {boolean} Whether the objects are equal
 */
export function isEqual(obj1, obj2) {
    // If exactly the same object instance
    if (obj1 === obj2) {
        return true;
    }
    
    // If null or undefined or different types
    if (obj1 == null || obj2 == null || typeof obj1 !== typeof obj2) {
        return false;
    }
    
    // If primitive type
    if (typeof obj1 !== 'object') {
        return obj1 === obj2;
    }
    
    // If both are arrays
    if (Array.isArray(obj1) && Array.isArray(obj2)) {
        if (obj1.length !== obj2.length) {
            return false;
        }
        
        for (let i = 0; i < obj1.length; i++) {
            if (!isEqual(obj1[i], obj2[i])) {
                return false;
            }
        }
        
        return true;
    }
    
    // If objects, compare properties
    if (typeof obj1 === 'object' && typeof obj2 === 'object') {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);
        
        if (keys1.length !== keys2.length) {
            return false;
        }
        
        return keys1.every(key => {
            return Object.prototype.hasOwnProperty.call(obj2, key) && 
                isEqual(obj1[key], obj2[key]);
        });
    }
    
    return false;
}

/**
 * Create a simple event emitter
 * @returns {Object} Event emitter object
 */
export function createEventEmitter() {
    const listeners = {};
    
    return {
        /**
         * Subscribe to an event
         * @param {string} event - Event name
         * @param {Function} callback - Event callback
         * @returns {Function} Unsubscribe function
         */
        subscribe(event, callback) {
            if (!listeners[event]) {
                listeners[event] = [];
            }
            
            listeners[event].push(callback);
            
            // Return unsubscribe function
            return () => this.unsubscribe(event, callback);
        },
        
        /**
         * Unsubscribe from an event
         * @param {string} event - Event name
         * @param {Function} callback - Event callback
         */
        unsubscribe(event, callback) {
            if (!listeners[event]) return;
            
            const index = listeners[event].indexOf(callback);
            if (index !== -1) {
                listeners[event].splice(index, 1);
            }
        },
        
        /**
         * Emit an event
         * @param {string} event - Event name
         * @param {*} data - Event data
         */
        emit(event, data) {
            if (!listeners[event]) return;
            
            listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event ${event} callback:`, error);
                }
            });
        },
        
        /**
         * Get the number of listeners for an event
         * @param {string} event - Event name
         * @returns {number} Number of listeners
         */
        listenerCount(event) {
            return listeners[event]?.length || 0;
        },
        
        /**
         * Clear all listeners for an event
         * @param {string} event - Event name
         */
        clearListeners(event) {
            if (event) {
                delete listeners[event];
            } else {
                // Clear all listeners
                for (const key in listeners) {
                    delete listeners[key];
                }
            }
        }
    };
}

/**
 * Create a throttled function
 * @param {Function} func - Function to throttle
 * @param {number} wait - Throttle delay in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, wait) {
    let timeout = null;
    let lastArgs = null;
    let lastThis = null;
    let lastCallTime = 0;
    
    function invoke() {
        const now = Date.now();
        const remaining = wait - (now - lastCallTime);
        
        if (remaining <= 0) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            
            lastCallTime = now;
            func.apply(lastThis, lastArgs);
            lastArgs = lastThis = null;
        }
    }
    
    return function throttled(...args) {
        const now = Date.now();
        lastArgs = args;
        lastThis = this;
        
        if (!lastCallTime) {
            lastCallTime = now;
            func.apply(lastThis, lastArgs);
            lastArgs = lastThis = null;
        } else {
            if (!timeout) {
                const remaining = wait - (now - lastCallTime);
                timeout = setTimeout(invoke, remaining);
            }
        }
    };
}

/**
 * Create a debounced function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Debounce delay in milliseconds
 * @param {boolean} [immediate=false] - Whether to call immediately on the leading edge
 * @returns {Function} Debounced function
 */
export function debounce(func, wait, immediate = false) {
    let timeout = null;
    
    return function debounced(...args) {
        const context = this;
        
        const later = () => {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        };
        
        const callNow = immediate && !timeout;
        
        if (timeout) {
            clearTimeout(timeout);
        }
        
        timeout = setTimeout(later, wait);
        
        if (callNow) {
            func.apply(context, args);
        }
    };
}

/**
 * Create a memoized function
 * @param {Function} func - Function to memoize
 * @returns {Function} Memoized function
 */
export function memoize(func) {
    const cache = new Map();
    
    return function memoized(...args) {
        const key = JSON.stringify(args);
        
        if (cache.has(key)) {
            return cache.get(key);
        }
        
        const result = func.apply(this, args);
        cache.set(key, result);
        
        return result;
    };
}
