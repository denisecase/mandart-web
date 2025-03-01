// src/utils/WasmUtils.js

// Reference to the loaded WASM module
let wasmModule = null;

/**
 * Sets the current WASM module for utilities to use.
 * This should be called by WasmLoader after initialization.
 * @param {Object} module - The initialized WASM module
 */
export function setWasmModule(module) {
  wasmModule = module;
  console.log("✅ WASM module reference set for utilities");
}

/**
 * Checks if the given WASM function exists before calling it.
 * If it doesn't exist, logs an error and prevents the call.
 *
 * @param {string} funcName - The name of the WASM function to check.
 * @param  {...any} args - The arguments to pass if the function exists.
 * @returns {any} The return value of the WASM function if it exists, otherwise null.
 */
export function safeWasmCall(funcName, ...args) {
  if (!wasmModule) {
    console.error(`❌ WASM module not initialized. Cannot call: ${funcName}`);
    return null;
  }

  if (typeof wasmModule[funcName] !== "function") {
    console.warn(
      `⚠️ Missing WASM function: "${funcName}". Request it before proceeding.`
    );
    return null;
  }

  try {
    return wasmModule[funcName](...args);
  } catch (error) {
    console.error(`❌ Error calling WASM function "${funcName}":`, error);
    return null;
  }
}

/**
 * Validates if expected WASM functions exist.
 * Logs missing functions as warnings but allows execution to continue.
 * @param {string[]} functionNames - List of expected WASM functions.
 * @returns {string[]} List of available functions.
 */
export function validateWasmFunctions(functionNames) {
  if (!wasmModule) {
    console.error("❌ Cannot validate WASM functions. Module not initialized.");
    return [];
  }

  const availableFunctions = [];

  functionNames.forEach((func) => {
    if (typeof wasmModule[func] === "function") {
      console.log(`✅ WASM function "${func}" is available.`);
      availableFunctions.push(func);  // Store the available function
    } else {
      console.warn(`⚠️ WASM function "${func}" is missing.`);
    }
  });

  return availableFunctions;  // Return the list of available functions
}
