let wasm;

let WASM_VECTOR_LEN = 0;

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedDataViewMemory0 = null;

function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_4.set(idx, obj);
    return idx;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_export_4.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}
/**
 * **WASM API: Generate an image directly from shape and color inputs**
 *
 * This function optimizes performance by caching uncolored grids and
 * reusing them when possible.
 *
 * # Arguments
 * * `js_shape_inputs` - Shape inputs in JavaScript format
 * * `js_color_inputs` - Color inputs in JavaScript format
 *
 * # Returns
 * * An image data structure as a JsValue
 * @param {any} js_shape_inputs
 * @param {any} js_color_inputs
 * @returns {any}
 */
export function api_get_image_from_inputs(js_shape_inputs, js_color_inputs) {
    const ret = wasm.api_get_image_from_inputs(js_shape_inputs, js_color_inputs);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

/**
 * **WASM API: Clear the grid cache**
 *
 * This function allows clients to explicitly clear the grid cache,
 * which might be useful for low-memory situations.
 *
 * # Returns
 * * The number of cache entries that were cleared
 * @returns {number}
 */
export function api_clear_grid_cache() {
    const ret = wasm.api_clear_grid_cache();
    return ret >>> 0;
}

/**
 * **WASM API: Extract inputs from a PictureDefinition JSON string**
 *
 * This function parses a PictureDefinition JSON string and extracts
 * shape and color inputs for Mandelbrot grid generation.
 *
 * @param {string} picdef_json - The JSON string representing a PictureDefinition
 * @returns {[JsArtImageShapeInputs, JsArtImageColorInputs]} A tuple containing:
 *   - Shape inputs for grid calculation
 *   - Color inputs for grid coloring
 *
 * @example
 * ```javascript
 * const [shapeInputs, colorInputs] = mandart.api_get_inputs_from_picdef_string(jsonString);
 * console.log(shapeInputs.image_width); // Access specific properties
 * ```
 *
 * @remarks
 * - Provides default values if certain JSON fields are missing
 * - Extracts core parameters for Mandelbrot image generation
 * - Converts Swift-generated PictureDefinition JSON to WebAssembly-compatible inputs
 * @param {string} picdef_json
 * @returns {any}
 */
export function api_get_inputs_from_picdef_string(picdef_json) {
    const ptr0 = passStringToWasm0(picdef_json, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.api_get_inputs_from_picdef_string(ptr0, len0);
    return ret;
}

/**
 * Exposes `load_or_compute_default_grid()` to JavaScript.
 * @returns {Float64Array}
 */
export function api_load_or_compute_default_grid() {
    const ret = wasm.api_load_or_compute_default_grid();
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

export function init() {
    wasm.init();
}

/**
 * Returns version information about the MandArt library
 * @returns {string}
 */
export function api_get_version() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.api_get_version();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}

/**
 * **WASM API: Compute a Mandelbrot grid from shape inputs**
 *
 * Takes shape inputs from JavaScript and returns a 2D grid of iteration values.
 *
 * # Arguments
 * * `js_inputs` - Shape inputs in JavaScript format
 *
 * # Returns
 * * A 2D array of iteration values as a JsValue
 * @param {any} js_inputs
 * @returns {any}
 */
export function api_get_grid_from_shape_inputs(js_inputs) {
    const ret = wasm.api_get_grid_from_shape_inputs(js_inputs);
    if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
}

const JsArtImageColorInputsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsartimagecolorinputs_free(ptr >>> 0, 1));
/**
 * Represents color inputs in a WASM-compatible structure
 */
export class JsArtImageColorInputs {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsArtImageColorInputsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsartimagecolorinputs_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get n_blocks() {
        const ret = wasm.__wbg_get_jsartimagecolorinputs_n_blocks(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set n_blocks(arg0) {
        wasm.__wbg_set_jsartimagecolorinputs_n_blocks(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get n_colors() {
        const ret = wasm.__wbg_get_jsartimagecolorinputs_n_colors(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set n_colors(arg0) {
        wasm.__wbg_set_jsartimagecolorinputs_n_colors(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get spacing_color_far() {
        const ret = wasm.__wbg_get_jsartimagecolorinputs_spacing_color_far(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set spacing_color_far(arg0) {
        wasm.__wbg_set_jsartimagecolorinputs_spacing_color_far(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get spacing_color_near() {
        const ret = wasm.__wbg_get_jsartimagecolorinputs_spacing_color_near(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set spacing_color_near(arg0) {
        wasm.__wbg_set_jsartimagecolorinputs_spacing_color_near(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get y_y_input() {
        const ret = wasm.__wbg_get_jsartimagecolorinputs_y_y_input(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set y_y_input(arg0) {
        wasm.__wbg_set_jsartimagecolorinputs_y_y_input(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} n_blocks
     * @param {number} n_colors
     * @param {number} spacing_color_far
     * @param {number} spacing_color_near
     * @param {number} y_y_input
     * @param {Float64Array} mand_color_js
     * @param {Array<any>} colors_js
     * @param {Array<any>} hues_js
     */
    constructor(n_blocks, n_colors, spacing_color_far, spacing_color_near, y_y_input, mand_color_js, colors_js, hues_js) {
        const ret = wasm.jsartimagecolorinputs_new(n_blocks, n_colors, spacing_color_far, spacing_color_near, y_y_input, mand_color_js, colors_js, hues_js);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        this.__wbg_ptr = ret[0] >>> 0;
        JsArtImageColorInputsFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * Get mand_color as Float64Array
     * @returns {Float64Array}
     */
    get mand_color() {
        const ret = wasm.jsartimagecolorinputs_mand_color(this.__wbg_ptr);
        return ret;
    }
    /**
     * Set mand_color from Float64Array
     * @param {Float64Array} value
     */
    set mand_color(value) {
        wasm.jsartimagecolorinputs_set_mand_color(this.__wbg_ptr, value);
    }
}

const JsArtImageShapeInputsFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_jsartimageshapeinputs_free(ptr >>> 0, 1));
/**
 * Represents shape inputs in a WASM-compatible structure
 */
export class JsArtImageShapeInputs {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        JsArtImageShapeInputsFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_jsartimageshapeinputs_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get image_width() {
        const ret = wasm.__wbg_get_jsartimageshapeinputs_image_width(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set image_width(arg0) {
        wasm.__wbg_set_jsartimageshapeinputs_image_width(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get image_height() {
        const ret = wasm.__wbg_get_jsartimageshapeinputs_image_height(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {number} arg0
     */
    set image_height(arg0) {
        wasm.__wbg_set_jsartimageshapeinputs_image_height(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get iterations_max() {
        const ret = wasm.__wbg_get_jsartimagecolorinputs_spacing_color_far(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set iterations_max(arg0) {
        wasm.__wbg_set_jsartimagecolorinputs_spacing_color_far(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get scale() {
        const ret = wasm.__wbg_get_jsartimagecolorinputs_spacing_color_near(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set scale(arg0) {
        wasm.__wbg_set_jsartimagecolorinputs_spacing_color_near(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get x_center() {
        const ret = wasm.__wbg_get_jsartimagecolorinputs_y_y_input(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set x_center(arg0) {
        wasm.__wbg_set_jsartimagecolorinputs_y_y_input(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get y_center() {
        const ret = wasm.__wbg_get_jsartimageshapeinputs_y_center(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set y_center(arg0) {
        wasm.__wbg_set_jsartimageshapeinputs_y_center(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get theta() {
        const ret = wasm.__wbg_get_jsartimageshapeinputs_theta(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set theta(arg0) {
        wasm.__wbg_set_jsartimageshapeinputs_theta(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get r_sq_limit() {
        const ret = wasm.__wbg_get_jsartimageshapeinputs_r_sq_limit(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set r_sq_limit(arg0) {
        wasm.__wbg_set_jsartimageshapeinputs_r_sq_limit(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get mand_power_real() {
        const ret = wasm.__wbg_get_jsartimageshapeinputs_mand_power_real(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set mand_power_real(arg0) {
        wasm.__wbg_set_jsartimageshapeinputs_mand_power_real(this.__wbg_ptr, arg0);
    }
    /**
     * @returns {number}
     */
    get d_f_iter_min() {
        const ret = wasm.__wbg_get_jsartimageshapeinputs_d_f_iter_min(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} arg0
     */
    set d_f_iter_min(arg0) {
        wasm.__wbg_set_jsartimageshapeinputs_d_f_iter_min(this.__wbg_ptr, arg0);
    }
    /**
     * @param {number} image_width
     * @param {number} image_height
     * @param {number} iterations_max
     * @param {number} scale
     * @param {number} x_center
     * @param {number} y_center
     * @param {number} theta
     * @param {number} r_sq_limit
     * @param {number} mand_power_real
     * @param {number} d_f_iter_min
     */
    constructor(image_width, image_height, iterations_max, scale, x_center, y_center, theta, r_sq_limit, mand_power_real, d_f_iter_min) {
        const ret = wasm.jsartimageshapeinputs_new(image_width, image_height, iterations_max, scale, x_center, y_center, theta, r_sq_limit, mand_power_real, d_f_iter_min);
        this.__wbg_ptr = ret >>> 0;
        JsArtImageShapeInputsFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_String_8f0eb39a4a4c2f66 = function(arg0, arg1) {
        const ret = String(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_buffer_609cc3eee51ed158 = function(arg0) {
        const ret = arg0.buffer;
        return ret;
    };
    imports.wbg.__wbg_call_672a4d21634d4a24 = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.call(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_debug_3cb59063b29f58c1 = function(arg0) {
        console.debug(arg0);
    };
    imports.wbg.__wbg_done_769e5ede4b31c67b = function(arg0) {
        const ret = arg0.done;
        return ret;
    };
    imports.wbg.__wbg_error_524f506f44df1645 = function(arg0) {
        console.error(arg0);
    };
    imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_get_67b2ba62fc30de12 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(arg0, arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_get_b9b93047fe3cf45b = function(arg0, arg1) {
        const ret = arg0[arg1 >>> 0];
        return ret;
    };
    imports.wbg.__wbg_getindex_b3df41665d83d8f3 = function(arg0, arg1) {
        const ret = arg0[arg1 >>> 0];
        return ret;
    };
    imports.wbg.__wbg_getwithrefkey_1dc361bd10053bfe = function(arg0, arg1) {
        const ret = arg0[arg1];
        return ret;
    };
    imports.wbg.__wbg_info_3daf2e093e091b66 = function(arg0) {
        console.info(arg0);
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_e14585432e3737fc = function(arg0) {
        let result;
        try {
            result = arg0 instanceof ArrayBuffer;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Uint8Array_17156bcf118086a9 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Uint8Array;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_isArray_a1eab7e0d067391b = function(arg0) {
        const ret = Array.isArray(arg0);
        return ret;
    };
    imports.wbg.__wbg_isSafeInteger_343e2beeeece1bb0 = function(arg0) {
        const ret = Number.isSafeInteger(arg0);
        return ret;
    };
    imports.wbg.__wbg_iterator_9a24c88df860dc65 = function() {
        const ret = Symbol.iterator;
        return ret;
    };
    imports.wbg.__wbg_length_a446193dc22c12f8 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_length_c67d5e5c3b83737f = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_length_e2d2a49132c1b256 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_log_c222819a41e063d3 = function(arg0) {
        console.log(arg0);
    };
    imports.wbg.__wbg_new_405e22f390576ce2 = function() {
        const ret = new Object();
        return ret;
    };
    imports.wbg.__wbg_new_78c8a92080461d08 = function(arg0) {
        const ret = new Float64Array(arg0);
        return ret;
    };
    imports.wbg.__wbg_new_78feb108b6472713 = function() {
        const ret = new Array();
        return ret;
    };
    imports.wbg.__wbg_new_8a6f238a6ece86ea = function() {
        const ret = new Error();
        return ret;
    };
    imports.wbg.__wbg_new_a12002a7f91c75be = function(arg0) {
        const ret = new Uint8Array(arg0);
        return ret;
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_93c8e0c1a479fa1a = function(arg0, arg1, arg2) {
        const ret = new Float64Array(arg0, arg1 >>> 0, arg2 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_newwithlength_5ebc38e611488614 = function(arg0) {
        const ret = new Float64Array(arg0 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_next_25feadfc0913fea9 = function(arg0) {
        const ret = arg0.next;
        return ret;
    };
    imports.wbg.__wbg_next_6574e1a8a62d1055 = function() { return handleError(function (arg0) {
        const ret = arg0.next();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_29b6f95e6adb667e = function(arg0, arg1, arg2) {
        arg0.set(arg1, arg2 >>> 0);
    };
    imports.wbg.__wbg_set_37837023f3d740e8 = function(arg0, arg1, arg2) {
        arg0[arg1 >>> 0] = arg2;
    };
    imports.wbg.__wbg_set_3f1d0b984ed272ed = function(arg0, arg1, arg2) {
        arg0[arg1] = arg2;
    };
    imports.wbg.__wbg_set_65595bdd868b3009 = function(arg0, arg1, arg2) {
        arg0.set(arg1, arg2 >>> 0);
    };
    imports.wbg.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
        const ret = arg1.stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_valueOf_fdbb54fcdfe33477 = function(arg0) {
        const ret = arg0.valueOf();
        return ret;
    };
    imports.wbg.__wbg_value_cd1ffa7b1ab794f1 = function(arg0) {
        const ret = arg0.value;
        return ret;
    };
    imports.wbg.__wbg_warn_4ca3906c248c47c4 = function(arg0) {
        console.warn(arg0);
    };
    imports.wbg.__wbindgen_as_number = function(arg0) {
        const ret = +arg0;
        return ret;
    };
    imports.wbg.__wbindgen_bigint_from_u64 = function(arg0) {
        const ret = BigInt.asUintN(64, arg0);
        return ret;
    };
    imports.wbg.__wbindgen_bigint_get_as_i64 = function(arg0, arg1) {
        const v = arg1;
        const ret = typeof(v) === 'bigint' ? v : undefined;
        getDataViewMemory0().setBigInt64(arg0 + 8 * 1, isLikeNone(ret) ? BigInt(0) : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = arg0;
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_error_new = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbindgen_in = function(arg0, arg1) {
        const ret = arg0 in arg1;
        return ret;
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_export_4;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
        ;
    };
    imports.wbg.__wbindgen_is_bigint = function(arg0) {
        const ret = typeof(arg0) === 'bigint';
        return ret;
    };
    imports.wbg.__wbindgen_is_function = function(arg0) {
        const ret = typeof(arg0) === 'function';
        return ret;
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = arg0;
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = arg0 === undefined;
        return ret;
    };
    imports.wbg.__wbindgen_jsval_eq = function(arg0, arg1) {
        const ret = arg0 === arg1;
        return ret;
    };
    imports.wbg.__wbindgen_jsval_loose_eq = function(arg0, arg1) {
        const ret = arg0 == arg1;
        return ret;
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return ret;
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('mandart_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
