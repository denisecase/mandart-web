//utils/WasmUtils.js

/**
 * Checks if the given WASM function exists before calling it.
 * If it doesn't exist, logs an error and prevents the call.
 *
 * @param {string} funcName - The name of the WASM function to check.
 * @param  {...any} args - The arguments to pass if the function exists.
 * @returns {any} The return value of the WASM function if it exists, otherwise null.
 */
export function safeWasmCall(funcName, ...args) {
    if (!window.wasmModule) {
      console.error(`❌ WASM module not initialized. Cannot call: ${funcName}`);
      return null;
    }
  
    if (typeof window.wasmModule[funcName] !== "function") {
      console.warn(
        `⚠️ Missing WASM function: "${funcName}". Request it before proceeding.`
      );
      return null;
    }
  
    try {
      return window.wasmModule[funcName](...args);
    } catch (error) {
      console.error(`❌ Error calling WASM function "${funcName}":`, error);
      return null;
    }
}



/**
 * Validates if expected WASM functions exist.
 * Logs missing functions as warnings but allows execution to continue.
 * @param {string[]} functionNames - List of expected WASM functions.
 */
function validateWasmFunctions(functionNames) {
  if (!window.wasmModule) {
    console.error("❌ Cannot validate WASM functions. Module not initialized.");
    return;
  }

  functionNames.forEach((func) => {
    if (typeof window.wasmModule[func] !== "function") {
      console.warn(`⚠️ WASM function "${func}" is missing. Consider adding it.`);
    } else {
      console.log(`✅ WASM function "${func}" is available.`);
    }
  });
}

