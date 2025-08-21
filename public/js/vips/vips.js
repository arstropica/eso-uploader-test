var Vips = (() => {
  var _scriptName = typeof document != 'undefined' ? document.currentScript?.src : undefined;
  return (
async function(moduleArg = {}) {
  var moduleRtn;

// include: shell.js
// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(moduleArg) => Promise<Module>
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = moduleArg;

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

// Attempt to auto-detect the environment
var ENVIRONMENT_IS_WEB = typeof window == 'object';
var ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != 'undefined';
// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
var ENVIRONMENT_IS_NODE = typeof process == 'object' && process.versions?.node && process.type != 'renderer';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

// Three configurations we can be running in:
// 1) We could be the application main() thread running in the main JS UI thread. (ENVIRONMENT_IS_WORKER == false and ENVIRONMENT_IS_PTHREAD == false)
// 2) We could be the application main() thread proxied to worker. (with Emscripten -sPROXY_TO_WORKER) (ENVIRONMENT_IS_WORKER == true, ENVIRONMENT_IS_PTHREAD == false)
// 3) We could be an application pthread running in a worker. (ENVIRONMENT_IS_WORKER == true and ENVIRONMENT_IS_PTHREAD == true)

// The way we signal to a worker that it is hosting a pthread is to construct
// it with a specific name.
var ENVIRONMENT_IS_PTHREAD = ENVIRONMENT_IS_WORKER && self.name?.startsWith('em-pthread');

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)
// include: /src/src/modules-pre.js
// Load dynamic modules by default
Module['dynamicLibraries'] = Module['dynamicLibraries'] || ['vips-jxl.wasm', 'vips-heif.wasm'];
// end include: /src/src/modules-pre.js
// include: /src/src/workaround-cors-pre.js
// https://stackoverflow.com/q/25458104
if (Module['workaroundCors']) {
  Module['mainScriptUrlOrBlob'] = Module['mainScriptUrlOrBlob'] ||
    URL.createObjectURL(new Blob(
      [`importScripts('${_scriptName}');`],
      {'type': 'application/javascript'}));
}
// end include: /src/src/workaround-cors-pre.js


var arguments_ = [];
var thisProgram = './this.program';
var quit_ = (status, toThrow) => {
  throw toThrow;
};

if (ENVIRONMENT_IS_WORKER) {
  _scriptName = self.location.href;
}

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var readAsync, readBinary;

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  try {
    scriptDirectory = new URL('.', _scriptName).href; // includes trailing slash
  } catch {
    // Must be a `blob:` or `data:` URL (e.g. `blob:http://site.com/etc/etc`), we cannot
    // infer anything from them.
  }

  {
// include: web_or_worker_shell_read.js
if (ENVIRONMENT_IS_WORKER) {
    readBinary = (url) => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.responseType = 'arraybuffer';
      xhr.send(null);
      return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
    };
  }

  readAsync = async (url) => {
    var response = await fetch(url, { credentials: 'same-origin' });
    if (response.ok) {
      return response.arrayBuffer();
    }
    throw new Error(response.status + ' : ' + response.url);
  };
// end include: web_or_worker_shell_read.js
  }
} else
{
}

var out = console.log.bind(console);
var err = console.error.bind(console);

// end include: shell.js

// include: preamble.js
// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var dynamicLibraries = [];

var wasmBinary;

// Wasm globals

// For sending to workers.
var wasmModule;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

// In STRICT mode, we only define assert() when ASSERTIONS is set.  i.e. we
// don't define it at all in release modes.  This matches the behaviour of
// MINIMAL_RUNTIME.
// TODO(sbc): Make this the default even without STRICT enabled.
/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    // This build was created without ASSERTIONS defined.  `assert()` should not
    // ever be called in this configuration but in case there are callers in
    // the wild leave this simple abort() implementation here for now.
    abort(text);
  }
}

/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */
var isFileURI = (filename) => filename.startsWith('file://');

// include: runtime_common.js
// include: runtime_stack_check.js
// end include: runtime_stack_check.js
// include: runtime_exceptions.js
// Base Emscripten EH error class
class EmscriptenEH extends Error {}

class EmscriptenSjLj extends EmscriptenEH {}

class CppException extends EmscriptenEH {
  constructor(excPtr) {
    super(excPtr);
    this.excPtr = excPtr;
    const excInfo = getExceptionMessage(excPtr);
    this.name = excInfo[0];
    this.message = excInfo[1];
  }
}
// end include: runtime_exceptions.js
// include: runtime_debug.js
// end include: runtime_debug.js
var readyPromiseResolve, readyPromiseReject;

var wasmModuleReceived;

// include: runtime_pthread.js
// Pthread Web Worker handling code.
// This code runs only on pthread web workers and handles pthread setup
// and communication with the main thread via postMessage.

// Map of modules to be shared with new threads.  This gets populated by the
// main thread and shared with all new workers via the initial `load` message.
var sharedModules = {};

if (ENVIRONMENT_IS_PTHREAD) {
  // Thread-local guard variable for one-time init of the JS state
  var initializedJS = false;

  // Turn unhandled rejected promises into errors so that the main thread will be
  // notified about them.
  self.onunhandledrejection = (e) => { throw e.reason || e; };

  function handleMessage(e) {
    try {
      var msgData = e['data'];
      //dbg('msgData: ' + Object.keys(msgData));
      var cmd = msgData.cmd;
      if (cmd === 'load') { // Preload command that is called once per worker to parse and load the Emscripten code.

        // Until we initialize the runtime, queue up any further incoming messages.
        let messageQueue = [];
        self.onmessage = (e) => messageQueue.push(e);

        // And add a callback for when the runtime is initialized.
        self.startWorker = (instance) => {
          // Notify the main thread that this thread has loaded.
          postMessage({ cmd: 'loaded' });
          // Process any messages that were queued before the thread was ready.
          for (let msg of messageQueue) {
            handleMessage(msg);
          }
          // Restore the real message handler.
          self.onmessage = handleMessage;
        };

        dynamicLibraries = msgData.dynamicLibraries;
        sharedModules = msgData.sharedModules;

        // Use `const` here to ensure that the variable is scoped only to
        // that iteration, allowing safe reference from a closure.
        for (const handler of msgData.handlers) {
          // The the main module has a handler for a certain even, but no
          // handler exists on the pthread worker, then proxy that handler
          // back to the main thread.
          if (!Module[handler] || Module[handler].proxy) {
            Module[handler] = (...args) => {
              postMessage({ cmd: 'callHandler', handler, args: args });
            }
            // Rebind the out / err handlers if needed
            if (handler == 'print') out = Module[handler];
            if (handler == 'printErr') err = Module[handler];
          }
        }

        wasmMemory = msgData.wasmMemory;
        updateMemoryViews();

        wasmModuleReceived(msgData.wasmModule);
      } else if (cmd === 'run') {
        // Call inside JS module to set up the stack frame for this pthread in JS module scope.
        // This needs to be the first thing that we do, as we cannot call to any C/C++ functions
        // until the thread stack is initialized.
        establishStackSpace(msgData.pthread_ptr);

        // Pass the thread address to wasm to store it for fast access.
        __emscripten_thread_init(msgData.pthread_ptr, /*is_main=*/0, /*is_runtime=*/0, /*can_block=*/1, 0, 0);

        PThread.threadInitTLS();

        // Await mailbox notifications with `Atomics.waitAsync` so we can start
        // using the fast `Atomics.notify` notification path.
        __emscripten_thread_mailbox_await(msgData.pthread_ptr);

        if (!initializedJS) {
          // Embind must initialize itself on all threads, as it generates support JS.
          // We only do this once per worker since they get reused
          __embind_initialize_bindings();
          initializedJS = true;
        }

        try {
          invokeEntryPoint(msgData.start_routine, msgData.arg);
        } catch(ex) {
          if (ex != 'unwind') {
            // The pthread "crashed".  Do not call `_emscripten_thread_exit` (which
            // would make this thread joinable).  Instead, re-throw the exception
            // and let the top level handler propagate it back to the main thread.
            throw ex;
          }
        }
      } else if (msgData.target === 'setimmediate') {
        // no-op
      } else if (cmd === 'checkMailbox') {
        if (initializedJS) {
          checkMailbox();
        }
      } else if (cmd) {
        // The received message looks like something that should be handled by this message
        // handler, (since there is a cmd field present), but is not one of the
        // recognized commands:
        err(`worker: received unknown command ${cmd}`);
        err(msgData);
      }
    } catch(ex) {
      __emscripten_thread_crashed();
      throw ex;
    }
  };

  self.onmessage = handleMessage;

} // ENVIRONMENT_IS_PTHREAD
// end include: runtime_pthread.js
// Memory management

var wasmMemory;

var
/** @type {!Int8Array} */
  HEAP8,
/** @type {!Uint8Array} */
  HEAPU8,
/** @type {!Int16Array} */
  HEAP16,
/** @type {!Uint16Array} */
  HEAPU16,
/** @type {!Int32Array} */
  HEAP32,
/** @type {!Uint32Array} */
  HEAPU32,
/** @type {!Float32Array} */
  HEAPF32,
/** @type {!Float64Array} */
  HEAPF64;

// BigInt64Array type is not correctly defined in closure
var
/** not-@type {!BigInt64Array} */
  HEAP64,
/* BigUint64Array type is not correctly defined in closure
/** not-@type {!BigUint64Array} */
  HEAPU64;

var runtimeInitialized = false;

var runtimeExited = false;



function updateMemoryViews() {
  var b = wasmMemory.buffer;
  Module['HEAP8'] = HEAP8 = new Int8Array(b);
  Module['HEAP16'] = HEAP16 = new Int16Array(b);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
  Module['HEAP32'] = HEAP32 = new Int32Array(b);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
  Module['HEAP64'] = HEAP64 = new BigInt64Array(b);
  Module['HEAPU64'] = HEAPU64 = new BigUint64Array(b);
}

// In non-standalone/normal mode, we create the memory here.
// include: runtime_init_memory.js
// Create the wasm memory. (Note: this only applies if IMPORTED_MEMORY is defined)

// check for full engine support (use string 'subarray' to avoid closure compiler confusion)

function initMemory() {
  if ((ENVIRONMENT_IS_PTHREAD)) { return }

  if (Module['wasmMemory']) {
    wasmMemory = Module['wasmMemory'];
  } else
  {
    var INITIAL_MEMORY = Module['INITIAL_MEMORY'] || 1073741824;

    /** @suppress {checkTypes} */
    wasmMemory = new WebAssembly.Memory({
      'initial': INITIAL_MEMORY / 65536,
      'maximum': INITIAL_MEMORY / 65536,
      'shared': true,
    });
  }

  updateMemoryViews();
}

// end include: runtime_init_memory.js

// include: memoryprofiler.js
// end include: memoryprofiler.js
// end include: runtime_common.js
var __RELOC_FUNCS__ = [];

function preRun() {
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  // Begin ATPRERUNS hooks
  callRuntimeCallbacks(onPreRuns);
  // End ATPRERUNS hooks
}

function initRuntime() {
  runtimeInitialized = true;

  if (ENVIRONMENT_IS_PTHREAD) return startWorker(Module);

  callRuntimeCallbacks(__RELOC_FUNCS__);

  // Begin ATINITS hooks
  if (!Module['noFSInit'] && !FS.initialized) FS.init();
TTY.init();
  // End ATINITS hooks

  wasmExports['__wasm_call_ctors']();

  // Begin ATPOSTCTORS hooks
  callRuntimeCallbacks(onPostCtors);
FS.ignorePermissions = false;
  // End ATPOSTCTORS hooks
}

function preMain() {
  // No ATMAINS hooks
}

function exitRuntime() {
  if ((ENVIRONMENT_IS_PTHREAD)) { return; } // PThreads reuse the runtime from the main thread.
  ___funcs_on_exit(); // Native atexit() functions
  // Begin ATEXITS hooks
  FS.quit();
TTY.shutdown();
  // End ATEXITS hooks
  PThread.terminateAllThreads();
  runtimeExited = true;
}

function postRun() {
  if ((ENVIRONMENT_IS_PTHREAD)) { return; } // PThreads reuse the runtime from the main thread.

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }

  // Begin ATPOSTRUNS hooks
  callRuntimeCallbacks(onPostRuns);
  // End ATPOSTRUNS hooks
}

// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function addRunDependency(id) {
  runDependencies++;

  Module['monitorRunDependencies']?.(runDependencies);

}

function removeRunDependency(id) {
  runDependencies--;

  Module['monitorRunDependencies']?.(runDependencies);

  if (runDependencies == 0) {
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

/** @param {string|number=} what */
function abort(what) {
  Module['onAbort']?.(what);

  what = 'Aborted(' + what + ')';
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);

  ABORT = true;

  what += '. Build with -sASSERTIONS for more info.';

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  // FIXME This approach does not work in Wasm EH because it currently does not assume
  // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
  // a trap or not based on a hidden field within the object. So at the moment
  // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
  // allows this in the wasm spec.

  // Suppress closure compiler warning here. Closure compiler's builtin extern
  // definition for WebAssembly.RuntimeError claims it takes no arguments even
  // though it can.
  // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
  /** @suppress {checkTypes} */
  var e = new WebAssembly.RuntimeError(what);

  readyPromiseReject?.(e);
  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

var wasmBinaryFile;

function findWasmBinary() {
    return locateFile('vips.wasm');
}

function getBinarySync(file) {
  if (file == wasmBinaryFile && wasmBinary) {
    return new Uint8Array(wasmBinary);
  }
  if (readBinary) {
    return readBinary(file);
  }
  throw 'both async and sync fetching of the wasm failed';
}

async function getWasmBinary(binaryFile) {
  // If we don't have the binary yet, load it asynchronously using readAsync.
  if (!wasmBinary) {
    // Fetch the binary using readAsync
    try {
      var response = await readAsync(binaryFile);
      return new Uint8Array(response);
    } catch {
      // Fall back to getBinarySync below;
    }
  }

  // Otherwise, getBinarySync should be able to get it synchronously
  return getBinarySync(binaryFile);
}

async function instantiateArrayBuffer(binaryFile, imports) {
  try {
    var binary = await getWasmBinary(binaryFile);
    var instance = await WebAssembly.instantiate(binary, imports);
    return instance;
  } catch (reason) {
    err(`failed to asynchronously prepare wasm: ${reason}`);

    abort(reason);
  }
}

async function instantiateAsync(binary, binaryFile, imports) {
  if (!binary && typeof WebAssembly.instantiateStreaming == 'function'
     ) {
    try {
      var response = fetch(binaryFile, { credentials: 'same-origin' });
      var instantiationResult = await WebAssembly.instantiateStreaming(response, imports);
      return instantiationResult;
    } catch (reason) {
      // We expect the most common failure cause to be a bad MIME type for the binary,
      // in which case falling back to ArrayBuffer instantiation should work.
      err(`wasm streaming compile failed: ${reason}`);
      err('falling back to ArrayBuffer instantiation');
      // fall back of instantiateArrayBuffer below
    };
  }
  return instantiateArrayBuffer(binaryFile, imports);
}

function getWasmImports() {
  assignWasmImports();
  // prepare imports
  return {
    'env': wasmImports,
    'wasi_snapshot_preview1': wasmImports,
    'GOT.mem': new Proxy(wasmImports, GOTHandler),
    'GOT.func': new Proxy(wasmImports, GOTHandler),
  }
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
async function createWasm() {
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    wasmExports = instance.exports;

    wasmExports = relocateExports(wasmExports, 1024);

    var metadata = getDylinkMetadata(module);
    mergeLibSymbols(wasmExports, 'main')
    LDSO.init();
    loadDylibs();

    

    registerTLSInit(wasmExports['_emscripten_tls_init'], instance.exports, metadata);

    __RELOC_FUNCS__.push(wasmExports['__wasm_apply_data_relocs']);

    // We now have the Wasm module loaded up, keep a reference to the compiled module so we can post it to the workers.
    wasmModule = module;
    assignWasmExports(wasmExports);
    removeRunDependency('wasm-instantiate');
    return wasmExports;
  }
  // wait for the pthread pool (if any)
  addRunDependency('wasm-instantiate');

  // Prefer streaming instantiation if available.
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    return receiveInstance(result['instance'], result['module']);
  }

  var info = getWasmImports();

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to
  // run the instantiation parallel to any other async startup actions they are
  // performing.
  // Also pthreads and wasm workers initialize the wasm instance through this
  // path.
  if (Module['instantiateWasm']) {
    return new Promise((resolve, reject) => {
        Module['instantiateWasm'](info, (mod, inst) => {
          resolve(receiveInstance(mod, inst));
        });
    });
  }

  if ((ENVIRONMENT_IS_PTHREAD)) {
    return new Promise((resolve) => {
      wasmModuleReceived = (module) => {
        // Instantiate from the module posted from the main thread.
        // We can just use sync instantiation in the worker.
        var instance = new WebAssembly.Instance(module, getWasmImports());
        resolve(receiveInstance(instance, module));
      };
    });
  }

  wasmBinaryFile ??= findWasmBinary();
  var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info);
  var exports = receiveInstantiationResult(result);
  return exports;
}

// end include: preamble.js

// Begin JS library code


  var handleException = (e) => {
      // Certain exception types we do not treat as errors since they are used for
      // internal control flow.
      // 1. ExitStatus, which is thrown by exit()
      // 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
      //    that wish to return to JS event loop.
      if (e instanceof ExitStatus || e == 'unwind') {
        return EXITSTATUS;
      }
      quit_(1, e);
    };
  
  class ExitStatus {
      name = 'ExitStatus';
      constructor(status) {
        this.message = `Program terminated with exit(${status})`;
        this.status = status;
      }
    }
  
  var runtimeKeepaliveCounter = 0;
  var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
  
  var stackSave = () => _emscripten_stack_get_current();
  
  var stackRestore = (val) => __emscripten_stack_restore(val);
  
  var stackAlloc = (sz) => __emscripten_stack_alloc(sz);
  
  
  
  var terminateWorker = (worker) => {
      worker.terminate();
      // terminate() can be asynchronous, so in theory the worker can continue
      // to run for some amount of time after termination.  However from our POV
      // the worker now dead and we don't want to hear from it again, so we stub
      // out its message handler here.  This avoids having to check in each of
      // the onmessage handlers if the message was coming from valid worker.
      worker.onmessage = (e) => {
      };
    };
  
  var cleanupThread = (pthread_ptr) => {
      var worker = PThread.pthreads[pthread_ptr];
      PThread.finishedThreads.delete(pthread_ptr);
      if (pthread_ptr in PThread.outstandingPromises) {
        PThread.outstandingPromises[pthread_ptr].resolve();
      }
      PThread.returnWorkerToPool(worker);
    };
  
  var callRuntimeCallbacks = (callbacks) => {
      while (callbacks.length > 0) {
        // Pass the module as the first argument.
        callbacks.shift()(Module);
      }
    };
  var onPreRuns = [];
  var addOnPreRun = (cb) => onPreRuns.push(cb);
  
  var markAsFinished = (pthread_ptr) => {
      PThread.finishedThreads.add(pthread_ptr);
      if (pthread_ptr in PThread.outstandingPromises) {
        PThread.outstandingPromises[pthread_ptr].resolve();
      }
    };
  
  var spawnThread = (threadParams) => {
  
      var worker = PThread.getNewWorker();
      if (!worker) {
        // No available workers in the PThread pool.
        return 6;
      }
  
      PThread.runningWorkers.push(worker);
  
      // Add to pthreads map
      PThread.pthreads[threadParams.pthread_ptr] = worker;
  
      worker.pthread_ptr = threadParams.pthread_ptr;
      var msg = {
          cmd: 'run',
          start_routine: threadParams.startRoutine,
          arg: threadParams.arg,
          pthread_ptr: threadParams.pthread_ptr,
      };
      // Ask the worker to start executing its pthread entry point function.
      worker.postMessage(msg, threadParams.transferList);
      return 0;
    };
  
  
  
  var PThread = {
  unusedWorkers:[],
  runningWorkers:[],
  tlsInitFunctions:[],
  pthreads:{
  },
  init() {
        if ((!(ENVIRONMENT_IS_PTHREAD))) {
          PThread.initMainThread();
        }
      },
  initMainThread() {
        var pthreadPoolSize = navigator.hardwareConcurrency>6?navigator.hardwareConcurrency:6;
        // Start loading up the Worker pool, if requested.
        while (pthreadPoolSize--) {
          PThread.allocateUnusedWorker();
        }
        // MINIMAL_RUNTIME takes care of calling loadWasmModuleToAllWorkers
        // in postamble_minimal.js
        addOnPreRun(() => {
          addRunDependency('loading-workers')
          PThread.loadWasmModuleToAllWorkers(() => removeRunDependency('loading-workers'));
        });
        PThread.outstandingPromises = {};
        // Finished threads are threads that have finished running but we not yet
        // joined.
        PThread.finishedThreads = new Set();
      },
  terminateAllThreads:() => {
        // Attempt to kill all workers.  Sadly (at least on the web) there is no
        // way to terminate a worker synchronously, or to be notified when a
        // worker in actually terminated.  This means there is some risk that
        // pthreads will continue to be executing after `worker.terminate` has
        // returned.  For this reason, we don't call `returnWorkerToPool` here or
        // free the underlying pthread data structures.
        for (var worker of PThread.runningWorkers) {
          terminateWorker(worker);
        }
        for (var worker of PThread.unusedWorkers) {
          terminateWorker(worker);
        }
        PThread.unusedWorkers = [];
        PThread.runningWorkers = [];
        PThread.pthreads = {};
      },
  returnWorkerToPool:(worker) => {
        // We don't want to run main thread queued calls here, since we are doing
        // some operations that leave the worker queue in an invalid state until
        // we are completely done (it would be bad if free() ends up calling a
        // queued pthread_create which looks at the global data structures we are
        // modifying). To achieve that, defer the free() til the very end, when
        // we are all done.
        var pthread_ptr = worker.pthread_ptr;
        delete PThread.pthreads[pthread_ptr];
        // Note: worker is intentionally not terminated so the pool can
        // dynamically grow.
        PThread.unusedWorkers.push(worker);
        PThread.runningWorkers.splice(PThread.runningWorkers.indexOf(worker), 1);
        // Not a running Worker anymore
        // Detach the worker from the pthread object, and return it to the
        // worker pool as an unused worker.
        worker.pthread_ptr = 0;
  
        // Finally, free the underlying (and now-unused) pthread structure in
        // linear memory.
        __emscripten_thread_free_data(pthread_ptr);
      },
  threadInitTLS() {
        // Call thread init functions (these are the _emscripten_tls_init for each
        // module loaded.
        PThread.tlsInitFunctions.forEach((f) => f());
      },
  loadWasmModuleToWorker:(worker) => new Promise((onFinishedLoading) => {
        worker.onmessage = (e) => {
          var d = e['data'];
          var cmd = d.cmd;
  
          // If this message is intended to a recipient that is not the main
          // thread, forward it to the target thread.
          if (d.targetThread && d.targetThread != _pthread_self()) {
            var targetWorker = PThread.pthreads[d.targetThread];
            if (targetWorker) {
              targetWorker.postMessage(d, d.transferList);
            } else {
              err(`Internal error! Worker sent a message "${cmd}" to target pthread ${d.targetThread}, but that thread no longer exists!`);
            }
            return;
          }
  
          if (cmd === 'checkMailbox') {
            checkMailbox();
          } else if (cmd === 'spawnThread') {
            spawnThread(d);
          } else if (cmd === 'cleanupThread') {
            cleanupThread(d.thread);
          } else if (cmd === 'markAsFinished') {
            markAsFinished(d.thread);
          } else if (cmd === 'loaded') {
            worker.loaded = true;
            onFinishedLoading(worker);
          } else if (d.target === 'setimmediate') {
            // Worker wants to postMessage() to itself to implement setImmediate()
            // emulation.
            worker.postMessage(d);
          } else if (cmd === 'callHandler') {
            Module[d.handler](...d.args);
          } else if (cmd) {
            // The received message looks like something that should be handled by this message
            // handler, (since there is a e.data.cmd field present), but is not one of the
            // recognized commands:
            err(`worker sent an unknown command ${cmd}`);
          }
        };
  
        worker.onerror = (e) => {
          var message = 'worker sent an error!';
          err(`${message} ${e.filename}:${e.lineno}: ${e.message}`);
          throw e;
        };
  
        // When running on a pthread, none of the incoming parameters on the module
        // object are present. Proxy known handlers back to the main thread if specified.
        var handlers = [];
        var knownHandlers = [
          'onExit',
          'onAbort',
          'print',
          'printErr',
        ];
        for (var handler of knownHandlers) {
          if (Module.propertyIsEnumerable(handler)) {
            handlers.push(handler);
          }
        }
  
        // Ask the new worker to load up the Emscripten-compiled page. This is a heavy operation.
        worker.postMessage({
          cmd: 'load',
          handlers: handlers,
          wasmMemory,
          wasmModule,
          dynamicLibraries,
          // Share all modules that have been loaded so far.  New workers
          // won't start running threads until these are all loaded.
          sharedModules,
        });
      }),
  loadWasmModuleToAllWorkers(onMaybeReady) {
        // Instantiation is synchronous in pthreads.
        if (
          ENVIRONMENT_IS_PTHREAD
        ) {
          return onMaybeReady();
        }
  
        let pthreadPoolReady = Promise.all(PThread.unusedWorkers.map(PThread.loadWasmModuleToWorker));
        pthreadPoolReady.then(onMaybeReady);
      },
  allocateUnusedWorker() {
        var worker;
        var pthreadMainJs = _scriptName;
        // We can't use makeModuleReceiveWithVar here since we want to also
        // call URL.createObjectURL on the mainScriptUrlOrBlob.
        if (Module['mainScriptUrlOrBlob']) {
          pthreadMainJs = Module['mainScriptUrlOrBlob'];
          if (typeof pthreadMainJs != 'string') {
            pthreadMainJs = URL.createObjectURL(pthreadMainJs);
          }
        }
        worker = new Worker(pthreadMainJs, {
          // This is the way that we signal to the Web Worker that it is hosting
          // a pthread.
          'name': 'em-pthread',
  });
        PThread.unusedWorkers.push(worker);
      },
  getNewWorker() {
        if (PThread.unusedWorkers.length == 0) {
  // PTHREAD_POOL_SIZE_STRICT should show a warning and, if set to level `2`, return from the function.
          PThread.allocateUnusedWorker();
          PThread.loadWasmModuleToWorker(PThread.unusedWorkers[0]);
        }
        return PThread.unusedWorkers.pop();
      },
  };
  /** @type{function(number, (number|boolean), ...number)} */
  var proxyToMainThread = (funcIndex, emAsmAddr, sync, ...callArgs) => {
      // EM_ASM proxying is done by passing a pointer to the address of the EM_ASM
      // content as `emAsmAddr`.  JS library proxying is done by passing an index
      // into `proxiedJSCallArgs` as `funcIndex`. If `emAsmAddr` is non-zero then
      // `funcIndex` will be ignored.
      // Additional arguments are passed after the first three are the actual
      // function arguments.
      // The serialization buffer contains the number of call params, and then
      // all the args here.
      // We also pass 'sync' to C separately, since C needs to look at it.
      // Allocate a buffer, which will be copied by the C code.
      //
      // First passed parameter specifies the number of arguments to the function.
      // When BigInt support is enabled, we must handle types in a more complex
      // way, detecting at runtime if a value is a BigInt or not (as we have no
      // type info here). To do that, add a "prefix" before each value that
      // indicates if it is a BigInt, which effectively doubles the number of
      // values we serialize for proxying. TODO: pack this?
      var serializedNumCallArgs = callArgs.length * 2;
      var sp = stackSave();
      var args = stackAlloc(serializedNumCallArgs * 8);
      var b = ((args)>>3);
      for (var i = 0; i < callArgs.length; i++) {
        var arg = callArgs[i];
        if (typeof arg == 'bigint') {
          // The prefix is non-zero to indicate a bigint.
          HEAP64[b + 2*i] = 1n;
          HEAP64[b + 2*i + 1] = arg;
        } else {
          // The prefix is zero to indicate a JS Number.
          HEAP64[b + 2*i] = 0n;
          HEAPF64[b + 2*i + 1] = arg;
        }
      }
      var rtn = __emscripten_run_on_main_thread_js(funcIndex, emAsmAddr, serializedNumCallArgs, args, sync);
      stackRestore(sp);
      return rtn;
    };
  
  function _proc_exit(code) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(0, 0, 1, code);
  
      EXITSTATUS = code;
      if (!keepRuntimeAlive()) {
        PThread.terminateAllThreads();
        Module['onExit']?.(code);
        ABORT = true;
      }
      quit_(code, new ExitStatus(code));
    
  }
  
  _proc_exit.sig = 'vi';
  
  
  
  
  
  function exitOnMainThread(returnCode) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(1, 0, 0, returnCode);
  
      _exit(returnCode);
    
  }
  
  /** @suppress {duplicate } */
  /** @param {boolean|number=} implicit */
  var exitJS = (status, implicit) => {
      EXITSTATUS = status;
  
      if (ENVIRONMENT_IS_PTHREAD) {
        // implicit exit can never happen on a pthread
        // When running in a pthread we propagate the exit back to the main thread
        // where it can decide if the whole process should be shut down or not.
        // The pthread may have decided not to exit its own runtime, for example
        // because it runs a main loop, but that doesn't affect the main thread.
        exitOnMainThread(status);
        throw 'unwind';
      }
  
      if (!keepRuntimeAlive()) {
        exitRuntime();
      }
  
      _proc_exit(status);
    };
  var _exit = exitJS;
  _exit.sig = 'vi';
  
  
  
  var maybeExit = () => {
      if (runtimeExited) {
        return;
      }
      if (!keepRuntimeAlive()) {
        try {
          if (ENVIRONMENT_IS_PTHREAD) __emscripten_thread_exit(EXITSTATUS);
          else
          _exit(EXITSTATUS);
        } catch (e) {
          handleException(e);
        }
      }
    };
  var callUserCallback = (func) => {
      if (runtimeExited || ABORT) {
        return;
      }
      try {
        func();
        maybeExit();
      } catch (e) {
        handleException(e);
      }
    };
  
  
  var runtimeKeepalivePush = () => {
      runtimeKeepaliveCounter += 1;
    };
  runtimeKeepalivePush.sig = 'v';
  
  var runtimeKeepalivePop = () => {
      runtimeKeepaliveCounter -= 1;
    };
  runtimeKeepalivePop.sig = 'v';
  /** @param {number=} timeout */
  var safeSetTimeout = (func, timeout) => {
      runtimeKeepalivePush();
      return setTimeout(() => {
        runtimeKeepalivePop();
        callUserCallback(func);
      }, timeout);
    };
  
  var warnOnce = (text) => {
      warnOnce.shown ||= {};
      if (!warnOnce.shown[text]) {
        warnOnce.shown[text] = 1;
        err(text);
      }
    };
  
  var preloadPlugins = [];
  
  var registerWasmPlugin = () => {
      // Use string keys here to avoid minification since the plugin consumer
      // also uses string keys.
      var wasmPlugin = {
        'promiseChainEnd': Promise.resolve(),
        'canHandle': (name) => {
          return !Module['noWasmDecoding'] && name.endsWith('.so')
        },
        'handle': (byteArray, name, onload, onerror) => {
          // loadWebAssemblyModule can not load modules out-of-order, so rather
          // than just running the promises in parallel, this makes a chain of
          // promises to run in series.
          wasmPlugin['promiseChainEnd'] = wasmPlugin['promiseChainEnd'].then(
            () => loadWebAssemblyModule(byteArray, {loadAsync: true, nodelete: true}, name, {})).then(
              (exports) => {
                preloadedWasm[name] = exports;
                onload(byteArray);
              },
              (error) => {
                err(`failed to instantiate wasm: ${name}: ${error}`);
                onerror();
              });
        }
      };
      preloadPlugins.push(wasmPlugin);
    };
  var preloadedWasm = {
  };
  
  var Browser = {
  useWebGL:false,
  isFullscreen:false,
  pointerLock:false,
  moduleContextCreatedCallbacks:[],
  workers:[],
  preloadedImages:{
  },
  preloadedAudios:{
  },
  getCanvas:() => Module['canvas'],
  init() {
        if (Browser.initted) return;
        Browser.initted = true;
  
        // Support for plugins that can process preloaded files. You can add more of these to
        // your app by creating and appending to preloadPlugins.
        //
        // Each plugin is asked if it can handle a file based on the file's name. If it can,
        // it is given the file's raw data. When it is done, it calls a callback with the file's
        // (possibly modified) data. For example, a plugin might decompress a file, or it
        // might create some side data structure for use later (like an Image element, etc.).
  
        var imagePlugin = {};
        imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
          return !Module['noImageDecoding'] && /\.(jpg|jpeg|png|bmp|webp)$/i.test(name);
        };
        imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
          var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
          if (b.size !== byteArray.length) { // Safari bug #118630
            // Safari's Blob can only take an ArrayBuffer
            b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
          }
          var url = URL.createObjectURL(b);
          var img = new Image();
          img.onload = () => {
            var canvas = /** @type {!HTMLCanvasElement} */ (document.createElement('canvas'));
            canvas.width = img.width;
            canvas.height = img.height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            Browser.preloadedImages[name] = canvas;
            URL.revokeObjectURL(url);
            onload?.(byteArray);
          };
          img.onerror = (event) => {
            err(`Image ${url} could not be decoded`);
            onerror?.();
          };
          img.src = url;
        };
        preloadPlugins.push(imagePlugin);
  
        var audioPlugin = {};
        audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
          return !Module['noAudioDecoding'] && name.slice(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
        };
        audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
          var done = false;
          function finish(audio) {
            if (done) return;
            done = true;
            Browser.preloadedAudios[name] = audio;
            onload?.(byteArray);
          }
          function fail() {
            if (done) return;
            done = true;
            Browser.preloadedAudios[name] = new Audio(); // empty shim
            onerror?.();
          }
          var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
          var url = URL.createObjectURL(b); // XXX we never revoke this!
          var audio = new Audio();
          audio.addEventListener('canplaythrough', () => finish(audio), false); // use addEventListener due to chromium bug 124926
          audio.onerror = function audio_onerror(event) {
            if (done) return;
            err(`warning: browser could not fully decode audio ${name}, trying slower base64 approach`);
            function encode64(data) {
              var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
              var PAD = '=';
              var ret = '';
              var leftchar = 0;
              var leftbits = 0;
              for (var i = 0; i < data.length; i++) {
                leftchar = (leftchar << 8) | data[i];
                leftbits += 8;
                while (leftbits >= 6) {
                  var curr = (leftchar >> (leftbits-6)) & 0x3f;
                  leftbits -= 6;
                  ret += BASE[curr];
                }
              }
              if (leftbits == 2) {
                ret += BASE[(leftchar&3) << 4];
                ret += PAD + PAD;
              } else if (leftbits == 4) {
                ret += BASE[(leftchar&0xf) << 2];
                ret += PAD;
              }
              return ret;
            }
            audio.src = 'data:audio/x-' + name.slice(-3) + ';base64,' + encode64(byteArray);
            finish(audio); // we don't wait for confirmation this worked - but it's worth trying
          };
          audio.src = url;
          // workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
          safeSetTimeout(() => {
            finish(audio); // try to use it even though it is not necessarily ready to play
          }, 10000);
        };
        preloadPlugins.push(audioPlugin);
  
        // Canvas event setup
  
        function pointerLockChange() {
          var canvas = Browser.getCanvas();
          Browser.pointerLock = document['pointerLockElement'] === canvas ||
                                document['mozPointerLockElement'] === canvas ||
                                document['webkitPointerLockElement'] === canvas ||
                                document['msPointerLockElement'] === canvas;
        }
        var canvas = Browser.getCanvas();
        if (canvas) {
          // forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
          // Module['forcedAspectRatio'] = 4 / 3;
  
          canvas.requestPointerLock = canvas['requestPointerLock'] ||
                                      canvas['mozRequestPointerLock'] ||
                                      canvas['webkitRequestPointerLock'] ||
                                      canvas['msRequestPointerLock'] ||
                                      (() => {});
          canvas.exitPointerLock = document['exitPointerLock'] ||
                                   document['mozExitPointerLock'] ||
                                   document['webkitExitPointerLock'] ||
                                   document['msExitPointerLock'] ||
                                   (() => {}); // no-op if function does not exist
          canvas.exitPointerLock = canvas.exitPointerLock.bind(document);
  
          document.addEventListener('pointerlockchange', pointerLockChange, false);
          document.addEventListener('mozpointerlockchange', pointerLockChange, false);
          document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
          document.addEventListener('mspointerlockchange', pointerLockChange, false);
  
          if (Module['elementPointerLock']) {
            canvas.addEventListener("click", (ev) => {
              if (!Browser.pointerLock && Browser.getCanvas().requestPointerLock) {
                Browser.getCanvas().requestPointerLock();
                ev.preventDefault();
              }
            }, false);
          }
        }
      },
  createContext(/** @type {HTMLCanvasElement} */ canvas, useWebGL, setInModule, webGLContextAttributes) {
        if (useWebGL && Module['ctx'] && canvas == Browser.getCanvas()) return Module['ctx']; // no need to recreate GL context if it's already been created for this canvas.
  
        var ctx;
        var contextHandle;
        if (useWebGL) {
          // For GLES2/desktop GL compatibility, adjust a few defaults to be different to WebGL defaults, so that they align better with the desktop defaults.
          var contextAttributes = {
            antialias: false,
            alpha: false,
            majorVersion: 1,
          };
  
          if (webGLContextAttributes) {
            for (var attribute in webGLContextAttributes) {
              contextAttributes[attribute] = webGLContextAttributes[attribute];
            }
          }
  
          // This check of existence of GL is here to satisfy Closure compiler, which yells if variable GL is referenced below but GL object is not
          // actually compiled in because application is not doing any GL operations. TODO: Ideally if GL is not being used, this function
          // Browser.createContext() should not even be emitted.
          if (typeof GL != 'undefined') {
            contextHandle = GL.createContext(canvas, contextAttributes);
            if (contextHandle) {
              ctx = GL.getContext(contextHandle).GLctx;
            }
          }
        } else {
          ctx = canvas.getContext('2d');
        }
  
        if (!ctx) return null;
  
        if (setInModule) {
          Module['ctx'] = ctx;
          if (useWebGL) GL.makeContextCurrent(contextHandle);
          Browser.useWebGL = useWebGL;
          Browser.moduleContextCreatedCallbacks.forEach((callback) => callback());
          Browser.init();
        }
        return ctx;
      },
  fullscreenHandlersInstalled:false,
  lockPointer:undefined,
  resizeCanvas:undefined,
  requestFullscreen(lockPointer, resizeCanvas) {
        Browser.lockPointer = lockPointer;
        Browser.resizeCanvas = resizeCanvas;
        if (typeof Browser.lockPointer == 'undefined') Browser.lockPointer = true;
        if (typeof Browser.resizeCanvas == 'undefined') Browser.resizeCanvas = false;
  
        var canvas = Browser.getCanvas();
        function fullscreenChange() {
          Browser.isFullscreen = false;
          var canvasContainer = canvas.parentNode;
          if ((document['fullscreenElement'] || document['mozFullScreenElement'] ||
               document['msFullscreenElement'] || document['webkitFullscreenElement'] ||
               document['webkitCurrentFullScreenElement']) === canvasContainer) {
            canvas.exitFullscreen = Browser.exitFullscreen;
            if (Browser.lockPointer) canvas.requestPointerLock();
            Browser.isFullscreen = true;
            if (Browser.resizeCanvas) {
              Browser.setFullscreenCanvasSize();
            } else {
              Browser.updateCanvasDimensions(canvas);
            }
          } else {
            // remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
            canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
            canvasContainer.parentNode.removeChild(canvasContainer);
  
            if (Browser.resizeCanvas) {
              Browser.setWindowedCanvasSize();
            } else {
              Browser.updateCanvasDimensions(canvas);
            }
          }
          Module['onFullScreen']?.(Browser.isFullscreen);
          Module['onFullscreen']?.(Browser.isFullscreen);
        }
  
        if (!Browser.fullscreenHandlersInstalled) {
          Browser.fullscreenHandlersInstalled = true;
          document.addEventListener('fullscreenchange', fullscreenChange, false);
          document.addEventListener('mozfullscreenchange', fullscreenChange, false);
          document.addEventListener('webkitfullscreenchange', fullscreenChange, false);
          document.addEventListener('MSFullscreenChange', fullscreenChange, false);
        }
  
        // create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
        var canvasContainer = document.createElement("div");
        canvas.parentNode.insertBefore(canvasContainer, canvas);
        canvasContainer.appendChild(canvas);
  
        // use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
        canvasContainer.requestFullscreen = canvasContainer['requestFullscreen'] ||
                                            canvasContainer['mozRequestFullScreen'] ||
                                            canvasContainer['msRequestFullscreen'] ||
                                           (canvasContainer['webkitRequestFullscreen'] ? () => canvasContainer['webkitRequestFullscreen'](Element['ALLOW_KEYBOARD_INPUT']) : null) ||
                                           (canvasContainer['webkitRequestFullScreen'] ? () => canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) : null);
  
        canvasContainer.requestFullscreen();
      },
  exitFullscreen() {
        // This is workaround for chrome. Trying to exit from fullscreen
        // not in fullscreen state will cause "TypeError: Document not active"
        // in chrome. See https://github.com/emscripten-core/emscripten/pull/8236
        if (!Browser.isFullscreen) {
          return false;
        }
  
        var CFS = document['exitFullscreen'] ||
                  document['cancelFullScreen'] ||
                  document['mozCancelFullScreen'] ||
                  document['msExitFullscreen'] ||
                  document['webkitCancelFullScreen'] ||
            (() => {});
        CFS.apply(document, []);
        return true;
      },
  safeSetTimeout(func, timeout) {
        // Legacy function, this is used by the SDL2 port so we need to keep it
        // around at least until that is updated.
        // See https://github.com/libsdl-org/SDL/pull/6304
        return safeSetTimeout(func, timeout);
      },
  getMimetype(name) {
        return {
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'bmp': 'image/bmp',
          'ogg': 'audio/ogg',
          'wav': 'audio/wav',
          'mp3': 'audio/mpeg'
        }[name.slice(name.lastIndexOf('.')+1)];
      },
  getUserMedia(func) {
        window.getUserMedia ||= navigator['getUserMedia'] ||
                                navigator['mozGetUserMedia'];
        window.getUserMedia(func);
      },
  getMovementX(event) {
        return event['movementX'] ||
               event['mozMovementX'] ||
               event['webkitMovementX'] ||
               0;
      },
  getMovementY(event) {
        return event['movementY'] ||
               event['mozMovementY'] ||
               event['webkitMovementY'] ||
               0;
      },
  getMouseWheelDelta(event) {
        var delta = 0;
        switch (event.type) {
          case 'DOMMouseScroll':
            // 3 lines make up a step
            delta = event.detail / 3;
            break;
          case 'mousewheel':
            // 120 units make up a step
            delta = event.wheelDelta / 120;
            break;
          case 'wheel':
            delta = event.deltaY
            switch (event.deltaMode) {
              case 0:
                // DOM_DELTA_PIXEL: 100 pixels make up a step
                delta /= 100;
                break;
              case 1:
                // DOM_DELTA_LINE: 3 lines make up a step
                delta /= 3;
                break;
              case 2:
                // DOM_DELTA_PAGE: A page makes up 80 steps
                delta *= 80;
                break;
              default:
                throw 'unrecognized mouse wheel delta mode: ' + event.deltaMode;
            }
            break;
          default:
            throw 'unrecognized mouse wheel event: ' + event.type;
        }
        return delta;
      },
  mouseX:0,
  mouseY:0,
  mouseMovementX:0,
  mouseMovementY:0,
  touches:{
  },
  lastTouches:{
  },
  calculateMouseCoords(pageX, pageY) {
        // Calculate the movement based on the changes
        // in the coordinates.
        var canvas = Browser.getCanvas();
        var rect = canvas.getBoundingClientRect();
  
        // Neither .scrollX or .pageXOffset are defined in a spec, but
        // we prefer .scrollX because it is currently in a spec draft.
        // (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
        var scrollX = ((typeof window.scrollX != 'undefined') ? window.scrollX : window.pageXOffset);
        var scrollY = ((typeof window.scrollY != 'undefined') ? window.scrollY : window.pageYOffset);
        var adjustedX = pageX - (scrollX + rect.left);
        var adjustedY = pageY - (scrollY + rect.top);
  
        // the canvas might be CSS-scaled compared to its backbuffer;
        // SDL-using content will want mouse coordinates in terms
        // of backbuffer units.
        adjustedX = adjustedX * (canvas.width / rect.width);
        adjustedY = adjustedY * (canvas.height / rect.height);
  
        return { x: adjustedX, y: adjustedY };
      },
  setMouseCoords(pageX, pageY) {
        const {x, y} = Browser.calculateMouseCoords(pageX, pageY);
        Browser.mouseMovementX = x - Browser.mouseX;
        Browser.mouseMovementY = y - Browser.mouseY;
        Browser.mouseX = x;
        Browser.mouseY = y;
      },
  calculateMouseEvent(event) { // event should be mousemove, mousedown or mouseup
        if (Browser.pointerLock) {
          // When the pointer is locked, calculate the coordinates
          // based on the movement of the mouse.
          // Workaround for Firefox bug 764498
          if (event.type != 'mousemove' &&
              ('mozMovementX' in event)) {
            Browser.mouseMovementX = Browser.mouseMovementY = 0;
          } else {
            Browser.mouseMovementX = Browser.getMovementX(event);
            Browser.mouseMovementY = Browser.getMovementY(event);
          }
  
          // add the mouse delta to the current absolute mouse position
          Browser.mouseX += Browser.mouseMovementX;
          Browser.mouseY += Browser.mouseMovementY;
        } else {
          if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
            var touch = event.touch;
            if (touch === undefined) {
              return; // the "touch" property is only defined in SDL
  
            }
            var coords = Browser.calculateMouseCoords(touch.pageX, touch.pageY);
  
            if (event.type === 'touchstart') {
              Browser.lastTouches[touch.identifier] = coords;
              Browser.touches[touch.identifier] = coords;
            } else if (event.type === 'touchend' || event.type === 'touchmove') {
              var last = Browser.touches[touch.identifier];
              last ||= coords;
              Browser.lastTouches[touch.identifier] = last;
              Browser.touches[touch.identifier] = coords;
            }
            return;
          }
  
          Browser.setMouseCoords(event.pageX, event.pageY);
        }
      },
  resizeListeners:[],
  updateResizeListeners() {
        var canvas = Browser.getCanvas();
        Browser.resizeListeners.forEach((listener) => listener(canvas.width, canvas.height));
      },
  setCanvasSize(width, height, noUpdates) {
        var canvas = Browser.getCanvas();
        Browser.updateCanvasDimensions(canvas, width, height);
        if (!noUpdates) Browser.updateResizeListeners();
      },
  windowedWidth:0,
  windowedHeight:0,
  setFullscreenCanvasSize() {
        // check if SDL is available
        if (typeof SDL != "undefined") {
          var flags = HEAPU32[((SDL.screen)>>2)];
          flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
          HEAP32[((SDL.screen)>>2)] = flags;
        }
        Browser.updateCanvasDimensions(Browser.getCanvas());
        Browser.updateResizeListeners();
      },
  setWindowedCanvasSize() {
        // check if SDL is available
        if (typeof SDL != "undefined") {
          var flags = HEAPU32[((SDL.screen)>>2)];
          flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
          HEAP32[((SDL.screen)>>2)] = flags;
        }
        Browser.updateCanvasDimensions(Browser.getCanvas());
        Browser.updateResizeListeners();
      },
  updateCanvasDimensions(canvas, wNative, hNative) {
        if (wNative && hNative) {
          canvas.widthNative = wNative;
          canvas.heightNative = hNative;
        } else {
          wNative = canvas.widthNative;
          hNative = canvas.heightNative;
        }
        var w = wNative;
        var h = hNative;
        if (Module['forcedAspectRatio'] > 0) {
          if (w/h < Module['forcedAspectRatio']) {
            w = Math.round(h * Module['forcedAspectRatio']);
          } else {
            h = Math.round(w / Module['forcedAspectRatio']);
          }
        }
        if (((document['fullscreenElement'] || document['mozFullScreenElement'] ||
             document['msFullscreenElement'] || document['webkitFullscreenElement'] ||
             document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
           var factor = Math.min(screen.width / w, screen.height / h);
           w = Math.round(w * factor);
           h = Math.round(h * factor);
        }
        if (Browser.resizeCanvas) {
          if (canvas.width  != w) canvas.width  = w;
          if (canvas.height != h) canvas.height = h;
          if (typeof canvas.style != 'undefined') {
            canvas.style.removeProperty( "width");
            canvas.style.removeProperty("height");
          }
        } else {
          if (canvas.width  != wNative) canvas.width  = wNative;
          if (canvas.height != hNative) canvas.height = hNative;
          if (typeof canvas.style != 'undefined') {
            if (w != wNative || h != hNative) {
              canvas.style.setProperty( "width", w + "px", "important");
              canvas.style.setProperty("height", h + "px", "important");
            } else {
              canvas.style.removeProperty( "width");
              canvas.style.removeProperty("height");
            }
          }
        }
      },
  };


  var GOT = {
  };
  
  var currentModuleWeakSymbols = new Set(["__lsan_ignore_object","__lsan_ignore_object"]);
  var GOTHandler = {
  get(obj, symName) {
        var rtn = GOT[symName];
        if (!rtn) {
          rtn = GOT[symName] = new WebAssembly.Global({'value': 'i32', 'mutable': true});
        }
        if (!currentModuleWeakSymbols.has(symName)) {
          // Any non-weak reference to a symbol marks it as `required`, which
          // enabled `reportUndefinedSymbols` to report undefined symbol errors
          // correctly.
          rtn.required = true;
        }
        return rtn;
      },
  };


  var onPostRuns = [];
  var addOnPostRun = (cb) => onPostRuns.push(cb);



  
  
  function establishStackSpace(pthread_ptr) {
      var stackHigh = HEAPU32[(((pthread_ptr)+(52))>>2)];
      var stackSize = HEAPU32[(((pthread_ptr)+(56))>>2)];
      var stackLow = stackHigh - stackSize;
      // Set stack limits used by `emscripten/stack.h` function.  These limits are
      // cached in wasm-side globals to make checks as fast as possible.
      _emscripten_stack_set_limits(stackHigh, stackLow);
  
      // Call inside wasm module to set up the stack frame for this pthread in wasm module scope
      stackRestore(stackHigh);
  
    }

  var UTF8Decoder = new TextDecoder();
  
    /**
     * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
     * array that contains uint8 values, returns a copy of that string as a
     * Javascript String object.
     * heapOrArray is either a regular array, or a JavaScript typed array view.
     * @param {number=} idx
     * @param {number=} maxBytesToRead
     * @return {string}
     */
  var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead = NaN) => {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      // TextDecoder needs to know the byte length in advance, it doesn't stop on
      // null terminator by itself.  Also, use the length info to avoid running tiny
      // strings through TextDecoder, since .subarray() allocates garbage.
      // (As a tiny code save trick, compare endPtr against endIdx using a negation,
      // so that undefined/NaN means Infinity)
      while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
  
      return UTF8Decoder.decode(heapOrArray.buffer ? heapOrArray.buffer instanceof ArrayBuffer ? heapOrArray.subarray(idx, endPtr) : heapOrArray.slice(idx, endPtr) : new Uint8Array(heapOrArray.slice(idx, endPtr)));
    };
  var getDylinkMetadata = (binary) => {
      var offset = 0;
      var end = 0;
  
      function getU8() {
        return binary[offset++];
      }
  
      function getLEB() {
        var ret = 0;
        var mul = 1;
        while (1) {
          var byte = binary[offset++];
          ret += ((byte & 0x7f) * mul);
          mul *= 0x80;
          if (!(byte & 0x80)) break;
        }
        return ret;
      }
  
      function getString() {
        var len = getLEB();
        offset += len;
        return UTF8ArrayToString(binary, offset - len, len);
      }
  
      function getStringList() {
        var count = getLEB();
        var rtn = []
        while (count--) rtn.push(getString());
        return rtn;
      }
  
      /** @param {string=} message */
      function failIf(condition, message) {
        if (condition) throw new Error(message);
      }
  
      if (binary instanceof WebAssembly.Module) {
        var dylinkSection = WebAssembly.Module.customSections(binary, 'dylink.0');
        failIf(dylinkSection.length === 0, 'need dylink section');
        binary = new Uint8Array(dylinkSection[0]);
        end = binary.length
      } else {
        var int32View = new Uint32Array(new Uint8Array(binary.subarray(0, 24)).buffer);
        var magicNumberFound = int32View[0] == 0x6d736100;
        failIf(!magicNumberFound, 'need to see wasm magic number'); // \0asm
        // we should see the dylink custom section right after the magic number and wasm version
        failIf(binary[8] !== 0, 'need the dylink section to be first')
        offset = 9;
        var section_size = getLEB(); //section size
        end = offset + section_size;
        var name = getString();
        failIf(name !== 'dylink.0');
      }
  
      var customSection = { neededDynlibs: [], tlsExports: new Set(), weakImports: new Set(), runtimePaths: [] };
      var WASM_DYLINK_MEM_INFO = 0x1;
      var WASM_DYLINK_NEEDED = 0x2;
      var WASM_DYLINK_EXPORT_INFO = 0x3;
      var WASM_DYLINK_IMPORT_INFO = 0x4;
      var WASM_DYLINK_RUNTIME_PATH = 0x5;
      var WASM_SYMBOL_TLS = 0x100;
      var WASM_SYMBOL_BINDING_MASK = 0x3;
      var WASM_SYMBOL_BINDING_WEAK = 0x1;
      while (offset < end) {
        var subsectionType = getU8();
        var subsectionSize = getLEB();
        if (subsectionType === WASM_DYLINK_MEM_INFO) {
          customSection.memorySize = getLEB();
          customSection.memoryAlign = getLEB();
          customSection.tableSize = getLEB();
          customSection.tableAlign = getLEB();
        } else if (subsectionType === WASM_DYLINK_NEEDED) {
          customSection.neededDynlibs = getStringList();
        } else if (subsectionType === WASM_DYLINK_EXPORT_INFO) {
          var count = getLEB();
          while (count--) {
            var symname = getString();
            var flags = getLEB();
            if (flags & WASM_SYMBOL_TLS) {
              customSection.tlsExports.add(symname);
            }
          }
        } else if (subsectionType === WASM_DYLINK_IMPORT_INFO) {
          var count = getLEB();
          while (count--) {
            var modname = getString();
            var symname = getString();
            var flags = getLEB();
            if ((flags & WASM_SYMBOL_BINDING_MASK) == WASM_SYMBOL_BINDING_WEAK) {
              customSection.weakImports.add(symname);
            }
          }
        } else if (subsectionType === WASM_DYLINK_RUNTIME_PATH) {
          customSection.runtimePaths = getStringList();
        } else {
          // unknown subsection
          offset += subsectionSize;
        }
      }
  
      return customSection;
    };

  
    /**
     * @param {number} ptr
     * @param {string} type
     */
  function getValue(ptr, type = 'i8') {
    if (type.endsWith('*')) type = '*';
    switch (type) {
      case 'i1': return HEAP8[ptr];
      case 'i8': return HEAP8[ptr];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP64[((ptr)>>3)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      case '*': return HEAPU32[((ptr)>>2)];
      default: abort(`invalid type for getValue: ${type}`);
    }
  }

  
  
  
  
  var wasmTableMirror = [];
  
  /** @type {WebAssembly.Table} */
  var wasmTable = new WebAssembly.Table({
    'initial': 5946,
    'element': 'anyfunc'
  });
  ;
  var getWasmTableEntry = (funcPtr) => {
      var func = wasmTableMirror[funcPtr];
      if (!func) {
        /** @suppress {checkTypes} */
        wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
      }
      return func;
    };
  var invokeEntryPoint = (ptr, arg) => {
      // An old thread on this worker may have been canceled without returning the
      // `runtimeKeepaliveCounter` to zero. Reset it now so the new thread won't
      // be affected.
      runtimeKeepaliveCounter = 0;
  
      // Same for noExitRuntime.  The default for pthreads should always be false
      // otherwise pthreads would never complete and attempts to pthread_join to
      // them would block forever.
      // pthreads can still choose to set `noExitRuntime` explicitly, or
      // call emscripten_unwind_to_js_event_loop to extend their lifetime beyond
      // their main function.  See comment in src/runtime_pthread.js for more.
      noExitRuntime = 0;
  
      // Before we call the thread entry point, make sure any shared libraries
      // have been loaded on this there.  Otherwise our table might be not be
      // in sync and might not contain the function pointer `ptr` at all.
      __emscripten_dlsync_self();
      // pthread entry points are always of signature 'void *ThreadMain(void *arg)'
      // Native codebases sometimes spawn threads with other thread entry point
      // signatures, such as void ThreadMain(void *arg), void *ThreadMain(), or
      // void ThreadMain().  That is not acceptable per C/C++ specification, but
      // x86 compiler ABI extensions enable that to work. If you find the
      // following line to crash, either change the signature to "proper" void
      // *ThreadMain(void *arg) form, or try linking with the Emscripten linker
      // flag -sEMULATE_FUNCTION_POINTER_CASTS to add in emulation for this x86
      // ABI extension.
  
      var result = getWasmTableEntry(ptr)(arg);
  
      function finish(result) {
        if (keepRuntimeAlive()) {
          EXITSTATUS = result;
        } else {
          __emscripten_thread_exit(result);
        }
      }
      finish(result);
    };

  var newDSO = (name, handle, syms) => {
      var dso = {
        refcount: Infinity,
        name,
        exports: syms,
        global: true,
      };
      LDSO.loadedLibsByName[name] = dso;
      if (handle != undefined) {
        LDSO.loadedLibsByHandle[handle] = dso;
      }
      return dso;
    };
  var LDSO = {
  loadedLibsByName:{
  },
  loadedLibsByHandle:{
  },
  init() {
        newDSO('__main__', 0, wasmImports);
      },
  };
  
  
  
  var ___heap_base = 3678672;
  
  var alignMemory = (size, alignment) => {
      return Math.ceil(size / alignment) * alignment;
    };
  
  var getMemory = (size) => {
      // After the runtime is initialized, we must only use sbrk() normally.
      if (runtimeInitialized) {
        // Currently we don't support freeing of static data when modules are
        // unloaded via dlclose.  This function is tagged as `noleakcheck` to
        // avoid having this reported as leak.
        return _calloc(size, 1);
      }
      var ret = ___heap_base;
      // Keep __heap_base stack aligned.
      var end = ret + alignMemory(size, 16);
      ___heap_base = end;
      GOT['__heap_base'].value = end;
      return ret;
    };
  
  
  var isInternalSym = (symName) => {
      // TODO: find a way to mark these in the binary or avoid exporting them.
      return [
        '__cpp_exception',
        '__c_longjmp',
        '__wasm_apply_data_relocs',
        '__dso_handle',
        '__tls_size',
        '__tls_align',
        '__set_stack_limits',
        '_emscripten_tls_init',
        '__wasm_init_tls',
        '__wasm_call_ctors',
        '__start_em_asm',
        '__stop_em_asm',
        '__start_em_js',
        '__stop_em_js',
      ].includes(symName) || symName.startsWith('__em_js__')
      ;
    };
  
  var uleb128Encode = (n, target) => {
      if (n < 128) {
        target.push(n);
      } else {
        target.push((n % 128) | 128, n >> 7);
      }
    };
  
  var sigToWasmTypes = (sig) => {
      var typeNames = {
        'i': 'i32',
        'j': 'i64',
        'f': 'f32',
        'd': 'f64',
        'e': 'externref',
        'p': 'i32',
      };
      var type = {
        parameters: [],
        results: sig[0] == 'v' ? [] : [typeNames[sig[0]]]
      };
      for (var i = 1; i < sig.length; ++i) {
        type.parameters.push(typeNames[sig[i]]);
      }
      return type;
    };
  
  var generateFuncType = (sig, target) => {
      var sigRet = sig.slice(0, 1);
      var sigParam = sig.slice(1);
      var typeCodes = {
        'i': 0x7f, // i32
        'p': 0x7f, // i32
        'j': 0x7e, // i64
        'f': 0x7d, // f32
        'd': 0x7c, // f64
        'e': 0x6f, // externref
      };
  
      // Parameters, length + signatures
      target.push(0x60 /* form: func */);
      uleb128Encode(sigParam.length, target);
      for (var paramType of sigParam) {
        target.push(typeCodes[paramType]);
      }
  
      // Return values, length + signatures
      // With no multi-return in MVP, either 0 (void) or 1 (anything else)
      if (sigRet == 'v') {
        target.push(0x00);
      } else {
        target.push(0x01, typeCodes[sigRet]);
      }
    };
  var convertJsFunctionToWasm = (func, sig) => {
  
      // If the type reflection proposal is available, use the new
      // "WebAssembly.Function" constructor.
      // Otherwise, construct a minimal wasm module importing the JS function and
      // re-exporting it.
      if (typeof WebAssembly.Function == "function") {
        return new WebAssembly.Function(sigToWasmTypes(sig), func);
      }
  
      // The module is static, with the exception of the type section, which is
      // generated based on the signature passed in.
      var typeSectionBody = [
        0x01, // count: 1
      ];
      generateFuncType(sig, typeSectionBody);
  
      // Rest of the module is static
      var bytes = [
        0x00, 0x61, 0x73, 0x6d, // magic ("\0asm")
        0x01, 0x00, 0x00, 0x00, // version: 1
        0x01, // Type section code
      ];
      // Write the overall length of the type section followed by the body
      uleb128Encode(typeSectionBody.length, bytes);
      bytes.push(...typeSectionBody);
  
      // The rest of the module is static
      bytes.push(
        0x02, 0x07, // import section
          // (import "e" "f" (func 0 (type 0)))
          0x01, 0x01, 0x65, 0x01, 0x66, 0x00, 0x00,
        0x07, 0x05, // export section
          // (export "f" (func 0 (type 0)))
          0x01, 0x01, 0x66, 0x00, 0x00,
      );
  
      // We can compile this wasm module synchronously because it is very small.
      // This accepts an import (at "e.f"), that it reroutes to an export (at "f")
      var module = new WebAssembly.Module(new Uint8Array(bytes));
      var instance = new WebAssembly.Instance(module, { 'e': { 'f': func } });
      var wrappedFunc = instance.exports['f'];
      return wrappedFunc;
    };
  
  
  var updateTableMap = (offset, count) => {
      if (functionsInTableMap) {
        for (var i = offset; i < offset + count; i++) {
          var item = getWasmTableEntry(i);
          // Ignore null values.
          if (item) {
            functionsInTableMap.set(item, i);
          }
        }
      }
    };
  
  var functionsInTableMap;
  
  var getFunctionAddress = (func) => {
      // First, create the map if this is the first use.
      if (!functionsInTableMap) {
        functionsInTableMap = new WeakMap();
        updateTableMap(0, wasmTable.length);
      }
      return functionsInTableMap.get(func) || 0;
    };
  
  
  var freeTableIndexes = [];
  
  var getEmptyTableSlot = () => {
      // Reuse a free index if there is one, otherwise grow.
      if (freeTableIndexes.length) {
        return freeTableIndexes.pop();
      }
      // Grow the table
      try {
        /** @suppress {checkTypes} */
        wasmTable.grow(1);
      } catch (err) {
        if (!(err instanceof RangeError)) {
          throw err;
        }
        throw 'Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.';
      }
      return wasmTable.length - 1;
    };
  
  
  var setWasmTableEntry = (idx, func) => {
      /** @suppress {checkTypes} */
      wasmTable.set(idx, func);
      // With ABORT_ON_WASM_EXCEPTIONS wasmTable.get is overridden to return wrapped
      // functions so we need to call it here to retrieve the potential wrapper correctly
      // instead of just storing 'func' directly into wasmTableMirror
      /** @suppress {checkTypes} */
      wasmTableMirror[idx] = wasmTable.get(idx);
    };
  /** @param {string=} sig */
  var addFunction = (func, sig) => {
      // Check if the function is already in the table, to ensure each function
      // gets a unique index.
      var rtn = getFunctionAddress(func);
      if (rtn) {
        return rtn;
      }
  
      // It's not in the table, add it now.
  
      var ret = getEmptyTableSlot();
  
      // Set the new value.
      try {
        // Attempting to call this with JS function will cause of table.set() to fail
        setWasmTableEntry(ret, func);
      } catch (err) {
        if (!(err instanceof TypeError)) {
          throw err;
        }
        var wrapped = convertJsFunctionToWasm(func, sig);
        setWasmTableEntry(ret, wrapped);
      }
  
      functionsInTableMap.set(func, ret);
  
      return ret;
    };
  var updateGOT = (exports, replace) => {
      for (var symName in exports) {
        if (isInternalSym(symName)) {
          continue;
        }
  
        var value = exports[symName];
  
        GOT[symName] ||= new WebAssembly.Global({'value': 'i32', 'mutable': true});
        if (replace || GOT[symName].value == 0) {
          if (typeof value == 'function') {
            GOT[symName].value = addFunction(value);
          } else if (typeof value == 'number') {
            GOT[symName].value = value;
          } else {
            err(`unhandled export type for '${symName}': ${typeof value}`);
          }
        }
      }
    };
  /** @param {boolean=} replace */
  var relocateExports = (exports, memoryBase, replace) => {
      var relocated = {};
  
      for (var e in exports) {
        var value = exports[e];
        if (typeof value == 'object') {
          // a breaking change in the wasm spec, globals are now objects
          // https://github.com/WebAssembly/mutable-global/issues/1
          value = value.value;
        }
        if (typeof value == 'number') {
          value += memoryBase;
        }
        relocated[e] = value;
      }
      updateGOT(relocated, replace);
      return relocated;
    };
  
  var isSymbolDefined = (symName) => {
      // Ignore 'stub' symbols that are auto-generated as part of the original
      // `wasmImports` used to instantiate the main module.
      var existing = wasmImports[symName];
      if (!existing || existing.stub) {
        return false;
      }
      return true;
    };
  
  var dynCall = (sig, ptr, args = [], promising = false) => {
      var func = getWasmTableEntry(ptr);
      var rtn = func(...args);
  
      function convert(rtn) {
        return rtn;
      }
  
      return convert(rtn);
    };
  
  
  
  var createInvokeFunction = (sig) => (ptr, ...args) => {
      var sp = stackSave();
      try {
        return dynCall(sig, ptr, args);
      } catch(e) {
        stackRestore(sp);
        // Create a try-catch guard that rethrows the Emscripten EH exception.
        // Exceptions thrown from C++ and longjmps will be an instance of
        // EmscriptenEH.
        if (!(e instanceof EmscriptenEH)) throw e;
        _setThrew(1, 0);
        // In theory this if statement could be done on
        // creating the function, but I just added this to
        // save wasting code space as it only happens on exception.
        if (sig[0] == "j") return 0n;
      }
    };
  var resolveGlobalSymbol = (symName, direct = false) => {
      var sym;
      if (isSymbolDefined(symName)) {
        sym = wasmImports[symName];
      }
      // Asm.js-style exception handling: invoke wrapper generation
      else if (symName.startsWith('invoke_')) {
        // Create (and cache) new invoke_ functions on demand.
        sym = wasmImports[symName] = createInvokeFunction(symName.split('_')[1]);
      }
      else if (symName.startsWith('__cxa_find_matching_catch_')) {
        // When the main module is linked we create whichever variants of
        // `__cxa_find_matching_catch_` (see jsifier.js) that we know are needed,
        // but a side module loaded at runtime might need different/additional
        // variants so we create those dynamically.
        sym = wasmImports[symName] = (...args) => {
          var rtn = findMatchingCatch(args);
          return rtn;
        }
      }
      return {sym, name: symName};
    };
  
  
  
  
  
  
  
  var onPostCtors = [];
  var addOnPostCtor = (cb) => onPostCtors.push(cb);
  
  
    /**
     * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
     * emscripten HEAP, returns a copy of that string as a Javascript String object.
     *
     * @param {number} ptr
     * @param {number=} maxBytesToRead - An optional length that specifies the
     *   maximum number of bytes to read. You can omit this parameter to scan the
     *   string until the first 0 byte. If maxBytesToRead is passed, and the string
     *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
     *   string will cut short at that byte index (i.e. maxBytesToRead will not
     *   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
     *   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
     *   JS JIT optimizations off, so it is worth to consider consistently using one
     * @return {string}
     */
  var UTF8ToString = (ptr, maxBytesToRead) => {
      if (!ptr) return '';
      var maxPtr = ptr + maxBytesToRead;
      for (var end = ptr; !(end >= maxPtr) && HEAPU8[end];) ++end;
      return UTF8Decoder.decode(HEAPU8.slice(ptr, end));
    };
  
     /**
      * @param {string=} libName
      * @param {Object=} localScope
      * @param {number=} handle
      */
  var loadWebAssemblyModule = (binary, flags, libName, localScope, handle) => {
      var metadata = getDylinkMetadata(binary);
      currentModuleWeakSymbols = metadata.weakImports;
  
      // loadModule loads the wasm module after all its dependencies have been loaded.
      // can be called both sync/async.
      function loadModule() {
        // The first thread to load a given module needs to allocate the static
        // table and memory regions.  Later threads re-use the same table region
        // and can ignore the memory region (since memory is shared between
        // threads already).
        // If `handle` is specified than it is assumed that the calling thread has
        // exclusive access to it for the duration of this function.  See the
        // locking in `dynlink.c`.
        var firstLoad = !handle || !HEAP8[(handle)+(8)];
        if (firstLoad) {
          // alignments are powers of 2
          var memAlign = Math.pow(2, metadata.memoryAlign);
          // prepare memory
          var memoryBase = metadata.memorySize ? alignMemory(getMemory(metadata.memorySize + memAlign), memAlign) : 0; // TODO: add to cleanups
          var tableBase = metadata.tableSize ? wasmTable.length : 0;
          if (handle) {
            HEAP8[(handle)+(8)] = 1;
            HEAPU32[(((handle)+(12))>>2)] = memoryBase;
            HEAP32[(((handle)+(16))>>2)] = metadata.memorySize;
            HEAPU32[(((handle)+(20))>>2)] = tableBase;
            HEAP32[(((handle)+(24))>>2)] = metadata.tableSize;
          }
        } else {
          // Read the values for tableBase and memoryBase from shared memory. The
          // thread that first loaded the DLL already set these values.
          memoryBase = HEAPU32[(((handle)+(12))>>2)];
          tableBase = HEAPU32[(((handle)+(20))>>2)];
        }
  
        if (metadata.tableSize) {
          wasmTable.grow(metadata.tableSize);
        }
  
        // This is the export map that we ultimately return.  We declare it here
        // so it can be used within resolveSymbol.  We resolve symbols against
        // this local symbol map in the case there they are not present on the
        // global Module object.  We need this fallback because Modules sometime
        // need to import their own symbols
        var moduleExports;
  
        function resolveSymbol(sym) {
          var resolved = resolveGlobalSymbol(sym).sym;
          if (!resolved && localScope) {
            resolved = localScope[sym];
          }
          if (!resolved) {
            resolved = moduleExports[sym];
          }
          return resolved;
        }
  
        // TODO kill ↓↓↓ (except "symbols local to this module", it will likely be
        // not needed if we require that if A wants symbols from B it has to link
        // to B explicitly: similarly to -Wl,--no-undefined)
        //
        // wasm dynamic libraries are pure wasm, so they cannot assist in
        // their own loading. When side module A wants to import something
        // provided by a side module B that is loaded later, we need to
        // add a layer of indirection, but worse, we can't even tell what
        // to add the indirection for, without inspecting what A's imports
        // are. To do that here, we use a JS proxy (another option would
        // be to inspect the binary directly).
        var proxyHandler = {
          get(stubs, prop) {
            // symbols that should be local to this module
            switch (prop) {
              case '__memory_base':
                return memoryBase;
              case '__table_base':
                return tableBase;
            }
            if (prop in wasmImports && !wasmImports[prop].stub) {
              // No stub needed, symbol already exists in symbol table
              var res = wasmImports[prop];
              return res;
            }
            // Return a stub function that will resolve the symbol
            // when first called.
            if (!(prop in stubs)) {
              var resolved;
              stubs[prop] = (...args) => {
                resolved ||= resolveSymbol(prop);
                return resolved(...args);
              };
            }
            return stubs[prop];
          }
        };
        var proxy = new Proxy({}, proxyHandler);
        var info = {
          'GOT.mem': new Proxy({}, GOTHandler),
          'GOT.func': new Proxy({}, GOTHandler),
          'env': proxy,
          'wasi_snapshot_preview1': proxy,
        };
  
        function postInstantiation(module, instance) {
          if (!ENVIRONMENT_IS_PTHREAD && libName) {
            // cache all loaded modules in `sharedModules`, which gets passed
            // to new workers when they are created.
            sharedModules[libName] = module;
          }
          // add new entries to functionsInTableMap
          updateTableMap(tableBase, metadata.tableSize);
          moduleExports = relocateExports(instance.exports, memoryBase);
          if (!flags.allowUndefined) {
            reportUndefinedSymbols();
          }
  
          function addEmAsm(addr, body) {
            var args = [];
            var arity = 0;
            for (; arity < 16; arity++) {
              if (body.indexOf('$' + arity) != -1) {
                args.push('$' + arity);
              } else {
                break;
              }
            }
            args = args.join(',');
            var func = `(${args}) => { ${body} };`;
            ASM_CONSTS[start] = eval(func);
          }
  
          // Add any EM_ASM function that exist in the side module
          if ('__start_em_asm' in moduleExports) {
            var start = moduleExports['__start_em_asm'];
            var stop = moduleExports['__stop_em_asm'];
            
            
            while (start < stop) {
              var jsString = UTF8ToString(start);
              addEmAsm(start, jsString);
              start = HEAPU8.indexOf(0, start) + 1;
            }
          }
  
          function addEmJs(name, cSig, body) {
            // The signature here is a C signature (e.g. "(int foo, char* bar)").
            // See `create_em_js` in emcc.py` for the build-time version of this
            // code.
            var jsArgs = [];
            cSig = cSig.slice(1, -1)
            if (cSig != 'void') {
              cSig = cSig.split(',');
              for (var i in cSig) {
                var jsArg = cSig[i].split(' ').pop();
                jsArgs.push(jsArg.replace('*', ''));
              }
            }
            var func = `(${jsArgs}) => ${body};`;
            moduleExports[name] = eval(func);
          }
  
          for (var name in moduleExports) {
            if (name.startsWith('__em_js__')) {
              var start = moduleExports[name]
              var jsString = UTF8ToString(start);
              // EM_JS strings are stored in the data section in the form
              // SIG<::>BODY.
              var parts = jsString.split('<::>');
              addEmJs(name.replace('__em_js__', ''), parts[0], parts[1]);
              delete moduleExports[name];
            }
          }
  
          // initialize the module
          // Only one thread should call __wasm_call_ctors, but all threads need
          // to call _emscripten_tls_init
          registerTLSInit(moduleExports['_emscripten_tls_init'], instance.exports, metadata)
          if (firstLoad) {
            var applyRelocs = moduleExports['__wasm_apply_data_relocs'];
            if (applyRelocs) {
              if (runtimeInitialized) {
                applyRelocs();
              } else {
                __RELOC_FUNCS__.push(applyRelocs);
              }
            }
            var init = moduleExports['__wasm_call_ctors'];
            if (init) {
              if (runtimeInitialized) {
                init();
              } else {
                // we aren't ready to run compiled code yet
                addOnPostCtor(init);
              }
            }
          }
          return moduleExports;
        }
  
        if (flags.loadAsync) {
          return (async () => {
            var instance;
            if (binary instanceof WebAssembly.Module) {
              instance = new WebAssembly.Instance(binary, info);
            } else {
              // Destructuring assignment without declaration has to be wrapped
              // with parens or parser will treat the l-value as an object
              // literal instead.
              ({ module: binary, instance } = await WebAssembly.instantiate(binary, info));
            }
            return postInstantiation(binary, instance);
          })();
        }
  
        var module = binary instanceof WebAssembly.Module ? binary : new WebAssembly.Module(binary);
        var instance = new WebAssembly.Instance(module, info);
        return postInstantiation(module, instance);
      }
  
      // We need to set rpath in flags based on the current library's rpath.
      // We can't mutate flags or else if a depends on b and c and b depends on d,
      // then c will be loaded with b's rpath instead of a's.
      flags = {...flags, rpath: { parentLibPath: libName, paths: metadata.runtimePaths }}
      // now load needed libraries and the module itself.
      if (flags.loadAsync) {
        return metadata.neededDynlibs
          .reduce((chain, dynNeeded) => chain.then(() =>
            loadDynamicLibrary(dynNeeded, flags, localScope)
          ), Promise.resolve())
          .then(loadModule);
      }
  
      metadata.neededDynlibs.forEach((needed) => loadDynamicLibrary(needed, flags, localScope));
      return loadModule();
    };
  
  var mergeLibSymbols = (exports, libName) => {
      // add symbols into global namespace TODO: weak linking etc.
      for (var [sym, exp] of Object.entries(exports)) {
  
        // When RTLD_GLOBAL is enabled, the symbols defined by this shared object
        // will be made available for symbol resolution of subsequently loaded
        // shared objects.
        //
        // We should copy the symbols (which include methods and variables) from
        // SIDE_MODULE to MAIN_MODULE.
        const setImport = (target) => {
          if (!isSymbolDefined(target)) {
            wasmImports[target] = exp;
          }
        }
        setImport(sym);
  
      }
    };
  
  
  var asyncLoad = async (url) => {
      var arrayBuffer = await readAsync(url);
      return new Uint8Array(arrayBuffer);
    };
  
  
  var PATH = {
  isAbs:(path) => path.charAt(0) === '/',
  splitPath:(filename) => {
        var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
        return splitPathRe.exec(filename).slice(1);
      },
  normalizeArray:(parts, allowAboveRoot) => {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }
        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up; up--) {
            parts.unshift('..');
          }
        }
        return parts;
      },
  normalize:(path) => {
        var isAbsolute = PATH.isAbs(path),
            trailingSlash = path.slice(-1) === '/';
        // Normalize the path
        path = PATH.normalizeArray(path.split('/').filter((p) => !!p), !isAbsolute).join('/');
        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }
        return (isAbsolute ? '/' : '') + path;
      },
  dirname:(path) => {
        var result = PATH.splitPath(path),
            root = result[0],
            dir = result[1];
        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }
        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.slice(0, -1);
        }
        return root + dir;
      },
  basename:(path) => path && path.match(/([^\/]+|\/)\/*$/)[1],
  join:(...paths) => PATH.normalize(paths.join('/')),
  join2:(l, r) => PATH.normalize(l + '/' + r),
  };
  var replaceORIGIN = (parentLibName, rpath) => {
      if (rpath.startsWith('$ORIGIN')) {
        // TODO: what to do if we only know the relative path of the file? It will return "." here.
        var origin = PATH.dirname(parentLibName);
        return rpath.replace('$ORIGIN', origin);
      }
  
      return rpath;
    };
  
  
  
  var withStackSave = (f) => {
      var stack = stackSave();
      var ret = f();
      stackRestore(stack);
      return ret;
    };
  
  
  var lengthBytesUTF8 = (str) => {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
        // unit, not a Unicode code point of the character! So decode
        // UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var c = str.charCodeAt(i); // possibly a lead surrogate
        if (c <= 0x7F) {
          len++;
        } else if (c <= 0x7FF) {
          len += 2;
        } else if (c >= 0xD800 && c <= 0xDFFF) {
          len += 4; ++i;
        } else {
          len += 3;
        }
      }
      return len;
    };
  
  
  var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
      // Parameter maxBytesToWrite is not optional. Negative values, 0, null,
      // undefined and false each don't write out any bytes.
      if (!(maxBytesToWrite > 0))
        return 0;
  
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
      for (var i = 0; i < str.length; ++i) {
        // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
        // and https://www.ietf.org/rfc/rfc2279.txt
        // and https://tools.ietf.org/html/rfc3629
        var u = str.codePointAt(i);
        if (u <= 0x7F) {
          if (outIdx >= endIdx) break;
          heap[outIdx++] = u;
        } else if (u <= 0x7FF) {
          if (outIdx + 1 >= endIdx) break;
          heap[outIdx++] = 0xC0 | (u >> 6);
          heap[outIdx++] = 0x80 | (u & 63);
        } else if (u <= 0xFFFF) {
          if (outIdx + 2 >= endIdx) break;
          heap[outIdx++] = 0xE0 | (u >> 12);
          heap[outIdx++] = 0x80 | ((u >> 6) & 63);
          heap[outIdx++] = 0x80 | (u & 63);
        } else {
          if (outIdx + 3 >= endIdx) break;
          heap[outIdx++] = 0xF0 | (u >> 18);
          heap[outIdx++] = 0x80 | ((u >> 12) & 63);
          heap[outIdx++] = 0x80 | ((u >> 6) & 63);
          heap[outIdx++] = 0x80 | (u & 63);
          // Gotcha: if codePoint is over 0xFFFF, it is represented as a surrogate pair in UTF-16.
          // We need to manually skip over the second code unit for correct iteration.
          i++;
        }
      }
      // Null-terminate the pointer to the buffer.
      heap[outIdx] = 0;
      return outIdx - startIdx;
    };
  var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    };
  
  var stringToUTF8OnStack = (str) => {
      var size = lengthBytesUTF8(str) + 1;
      var ret = stackAlloc(size);
      stringToUTF8(str, ret, size);
      return ret;
    };
  
  
  var initRandomFill = () => {
  
      // like with most Web APIs, we can't use Web Crypto API directly on shared memory,
      // so we need to create an intermediate buffer and copy it to the destination
      return (view) => view.set(crypto.getRandomValues(new Uint8Array(view.byteLength)));
    };
  var randomFill = (view) => {
      // Lazily init on the first invocation.
      (randomFill = initRandomFill())(view);
    };
  
  
  
  var PATH_FS = {
  resolve:(...args) => {
        var resolvedPath = '',
          resolvedAbsolute = false;
        for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? args[i] : FS.cwd();
          // Skip empty and invalid entries
          if (typeof path != 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            return ''; // an invalid portion invalidates the whole thing
          }
          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = PATH.isAbs(path);
        }
        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)
        resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter((p) => !!p), !resolvedAbsolute).join('/');
        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      },
  relative:(from, to) => {
        from = PATH_FS.resolve(from).slice(1);
        to = PATH_FS.resolve(to).slice(1);
        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }
          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }
          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }
        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));
        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }
        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }
        outputParts = outputParts.concat(toParts.slice(samePartsLength));
        return outputParts.join('/');
      },
  };
  
  
  
  var FS_stdin_getChar_buffer = [];
  
  
  /** @type {function(string, boolean=, number=)} */
  var intArrayFromString = (stringy, dontAddNull, length) => {
      var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
      var u8array = new Array(len);
      var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
      if (dontAddNull) u8array.length = numBytesWritten;
      return u8array;
    };
  var FS_stdin_getChar = () => {
      if (!FS_stdin_getChar_buffer.length) {
        var result = null;
        if (typeof window != 'undefined' &&
          typeof window.prompt == 'function') {
          // Browser.
          result = window.prompt('Input: ');  // returns null on cancel
          if (result !== null) {
            result += '\n';
          }
        } else
        {}
        if (!result) {
          return null;
        }
        FS_stdin_getChar_buffer = intArrayFromString(result, true);
      }
      return FS_stdin_getChar_buffer.shift();
    };
  var TTY = {
  ttys:[],
  init() {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // currently, FS.init does not distinguish if process.stdin is a file or TTY
        //   // device, it always assumes it's a TTY device. because of this, we're forcing
        //   // process.stdin to UTF8 encoding to at least make stdin reading compatible
        //   // with text files until FS.init can be refactored.
        //   process.stdin.setEncoding('utf8');
        // }
      },
  shutdown() {
        // https://github.com/emscripten-core/emscripten/pull/1555
        // if (ENVIRONMENT_IS_NODE) {
        //   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
        //   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
        //   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
        //   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
        //   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
        //   process.stdin.pause();
        // }
      },
  register(dev, ops) {
        TTY.ttys[dev] = { input: [], output: [], ops: ops };
        FS.registerDevice(dev, TTY.stream_ops);
      },
  stream_ops:{
  open(stream) {
          var tty = TTY.ttys[stream.node.rdev];
          if (!tty) {
            throw new FS.ErrnoError(43);
          }
          stream.tty = tty;
          stream.seekable = false;
        },
  close(stream) {
          // flush any pending line data
          stream.tty.ops.fsync(stream.tty);
        },
  fsync(stream) {
          stream.tty.ops.fsync(stream.tty);
        },
  read(stream, buffer, offset, length, pos /* ignored */) {
          if (!stream.tty || !stream.tty.ops.get_char) {
            throw new FS.ErrnoError(60);
          }
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = stream.tty.ops.get_char(stream.tty);
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(6);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset+i] = result;
          }
          if (bytesRead) {
            stream.node.atime = Date.now();
          }
          return bytesRead;
        },
  write(stream, buffer, offset, length, pos) {
          if (!stream.tty || !stream.tty.ops.put_char) {
            throw new FS.ErrnoError(60);
          }
          try {
            for (var i = 0; i < length; i++) {
              stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
            }
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (length) {
            stream.node.mtime = stream.node.ctime = Date.now();
          }
          return i;
        },
  },
  default_tty_ops:{
  get_char(tty) {
          return FS_stdin_getChar();
        },
  put_char(tty, val) {
          if (val === null || val === 10) {
            out(UTF8ArrayToString(tty.output));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val); // val == 0 would cut text output off in the middle.
          }
        },
  fsync(tty) {
          if (tty.output?.length > 0) {
            out(UTF8ArrayToString(tty.output));
            tty.output = [];
          }
        },
  ioctl_tcgets(tty) {
          // typical setting
          return {
            c_iflag: 25856,
            c_oflag: 5,
            c_cflag: 191,
            c_lflag: 35387,
            c_cc: [
              0x03, 0x1c, 0x7f, 0x15, 0x04, 0x00, 0x01, 0x00, 0x11, 0x13, 0x1a, 0x00,
              0x12, 0x0f, 0x17, 0x16, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
              0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            ]
          };
        },
  ioctl_tcsets(tty, optional_actions, data) {
          // currently just ignore
          return 0;
        },
  ioctl_tiocgwinsz(tty) {
          return [24, 80];
        },
  },
  default_tty1_ops:{
  put_char(tty, val) {
          if (val === null || val === 10) {
            err(UTF8ArrayToString(tty.output));
            tty.output = [];
          } else {
            if (val != 0) tty.output.push(val);
          }
        },
  fsync(tty) {
          if (tty.output?.length > 0) {
            err(UTF8ArrayToString(tty.output));
            tty.output = [];
          }
        },
  },
  };
  
  
  var zeroMemory = (ptr, size) => HEAPU8.fill(0, ptr, ptr + size);
  
  var mmapAlloc = (size) => {
      size = alignMemory(size, 65536);
      var ptr = _emscripten_builtin_memalign(65536, size);
      if (ptr) zeroMemory(ptr, size);
      return ptr;
    };
  var MEMFS = {
  ops_table:null,
  mount(mount) {
        return MEMFS.createNode(null, '/', 16895, 0);
      },
  createNode(parent, name, mode, dev) {
        if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
          // no supported
          throw new FS.ErrnoError(63);
        }
        MEMFS.ops_table ||= {
          dir: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr,
              lookup: MEMFS.node_ops.lookup,
              mknod: MEMFS.node_ops.mknod,
              rename: MEMFS.node_ops.rename,
              unlink: MEMFS.node_ops.unlink,
              rmdir: MEMFS.node_ops.rmdir,
              readdir: MEMFS.node_ops.readdir,
              symlink: MEMFS.node_ops.symlink
            },
            stream: {
              llseek: MEMFS.stream_ops.llseek
            }
          },
          file: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr
            },
            stream: {
              llseek: MEMFS.stream_ops.llseek,
              read: MEMFS.stream_ops.read,
              write: MEMFS.stream_ops.write,
              mmap: MEMFS.stream_ops.mmap,
              msync: MEMFS.stream_ops.msync
            }
          },
          link: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr,
              readlink: MEMFS.node_ops.readlink
            },
            stream: {}
          },
          chrdev: {
            node: {
              getattr: MEMFS.node_ops.getattr,
              setattr: MEMFS.node_ops.setattr
            },
            stream: FS.chrdev_stream_ops
          }
        };
        var node = FS.createNode(parent, name, mode, dev);
        if (FS.isDir(node.mode)) {
          node.node_ops = MEMFS.ops_table.dir.node;
          node.stream_ops = MEMFS.ops_table.dir.stream;
          node.contents = {};
        } else if (FS.isFile(node.mode)) {
          node.node_ops = MEMFS.ops_table.file.node;
          node.stream_ops = MEMFS.ops_table.file.stream;
          node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.length which gives the whole capacity.
          // When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
          // for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
          // penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
          node.contents = null; 
        } else if (FS.isLink(node.mode)) {
          node.node_ops = MEMFS.ops_table.link.node;
          node.stream_ops = MEMFS.ops_table.link.stream;
        } else if (FS.isChrdev(node.mode)) {
          node.node_ops = MEMFS.ops_table.chrdev.node;
          node.stream_ops = MEMFS.ops_table.chrdev.stream;
        }
        node.atime = node.mtime = node.ctime = Date.now();
        // add the new node to the parent
        if (parent) {
          parent.contents[name] = node;
          parent.atime = parent.mtime = parent.ctime = node.atime;
        }
        return node;
      },
  getFileDataAsTypedArray(node) {
        if (!node.contents) return new Uint8Array(0);
        if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
        return new Uint8Array(node.contents);
      },
  expandFileStorage(node, newCapacity) {
        var prevCapacity = node.contents ? node.contents.length : 0;
        if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
        // Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
        // For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
        // avoid overshooting the allocation cap by a very large margin.
        var CAPACITY_DOUBLING_MAX = 1024 * 1024;
        newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) >>> 0);
        if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
        var oldContents = node.contents;
        node.contents = new Uint8Array(newCapacity); // Allocate new storage.
        if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
      },
  resizeFileStorage(node, newSize) {
        if (node.usedBytes == newSize) return;
        if (newSize == 0) {
          node.contents = null; // Fully decommit when requesting a resize to zero.
          node.usedBytes = 0;
        } else {
          var oldContents = node.contents;
          node.contents = new Uint8Array(newSize); // Allocate new storage.
          if (oldContents) {
            node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
          }
          node.usedBytes = newSize;
        }
      },
  node_ops:{
  getattr(node) {
          var attr = {};
          // device numbers reuse inode numbers.
          attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
          attr.ino = node.id;
          attr.mode = node.mode;
          attr.nlink = 1;
          attr.uid = 0;
          attr.gid = 0;
          attr.rdev = node.rdev;
          if (FS.isDir(node.mode)) {
            attr.size = 4096;
          } else if (FS.isFile(node.mode)) {
            attr.size = node.usedBytes;
          } else if (FS.isLink(node.mode)) {
            attr.size = node.link.length;
          } else {
            attr.size = 0;
          }
          attr.atime = new Date(node.atime);
          attr.mtime = new Date(node.mtime);
          attr.ctime = new Date(node.ctime);
          // NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
          //       but this is not required by the standard.
          attr.blksize = 4096;
          attr.blocks = Math.ceil(attr.size / attr.blksize);
          return attr;
        },
  setattr(node, attr) {
          for (const key of ["mode", "atime", "mtime", "ctime"]) {
            if (attr[key] != null) {
              node[key] = attr[key];
            }
          }
          if (attr.size !== undefined) {
            MEMFS.resizeFileStorage(node, attr.size);
          }
        },
  lookup(parent, name) {
          throw MEMFS.doesNotExistError;
        },
  mknod(parent, name, mode, dev) {
          return MEMFS.createNode(parent, name, mode, dev);
        },
  rename(old_node, new_dir, new_name) {
          var new_node;
          try {
            new_node = FS.lookupNode(new_dir, new_name);
          } catch (e) {}
          if (new_node) {
            if (FS.isDir(old_node.mode)) {
              // if we're overwriting a directory at new_name, make sure it's empty.
              for (var i in new_node.contents) {
                throw new FS.ErrnoError(55);
              }
            }
            FS.hashRemoveNode(new_node);
          }
          // do the internal rewiring
          delete old_node.parent.contents[old_node.name];
          new_dir.contents[new_name] = old_node;
          old_node.name = new_name;
          new_dir.ctime = new_dir.mtime = old_node.parent.ctime = old_node.parent.mtime = Date.now();
        },
  unlink(parent, name) {
          delete parent.contents[name];
          parent.ctime = parent.mtime = Date.now();
        },
  rmdir(parent, name) {
          var node = FS.lookupNode(parent, name);
          for (var i in node.contents) {
            throw new FS.ErrnoError(55);
          }
          delete parent.contents[name];
          parent.ctime = parent.mtime = Date.now();
        },
  readdir(node) {
          return ['.', '..', ...Object.keys(node.contents)];
        },
  symlink(parent, newname, oldpath) {
          var node = MEMFS.createNode(parent, newname, 0o777 | 40960, 0);
          node.link = oldpath;
          return node;
        },
  readlink(node) {
          if (!FS.isLink(node.mode)) {
            throw new FS.ErrnoError(28);
          }
          return node.link;
        },
  },
  stream_ops:{
  read(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= stream.node.usedBytes) return 0;
          var size = Math.min(stream.node.usedBytes - position, length);
          if (size > 8 && contents.subarray) { // non-trivial, and typed array
            buffer.set(contents.subarray(position, position + size), offset);
          } else {
            for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
          }
          return size;
        },
  write(stream, buffer, offset, length, position, canOwn) {
  
          if (!length) return 0;
          var node = stream.node;
          node.mtime = node.ctime = Date.now();
  
          if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
            if (canOwn) {
              node.contents = buffer.subarray(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
              node.contents = buffer.slice(offset, offset + length);
              node.usedBytes = length;
              return length;
            } else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
              node.contents.set(buffer.subarray(offset, offset + length), position);
              return length;
            }
          }
  
          // Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
          MEMFS.expandFileStorage(node, position+length);
          if (node.contents.subarray && buffer.subarray) {
            // Use typed array write which is available.
            node.contents.set(buffer.subarray(offset, offset + length), position);
          } else {
            for (var i = 0; i < length; i++) {
             node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
            }
          }
          node.usedBytes = Math.max(node.usedBytes, position + length);
          return length;
        },
  llseek(stream, offset, whence) {
          var position = offset;
          if (whence === 1) {
            position += stream.position;
          } else if (whence === 2) {
            if (FS.isFile(stream.node.mode)) {
              position += stream.node.usedBytes;
            }
          }
          if (position < 0) {
            throw new FS.ErrnoError(28);
          }
          return position;
        },
  mmap(stream, length, position, prot, flags) {
          if (!FS.isFile(stream.node.mode)) {
            throw new FS.ErrnoError(43);
          }
          var ptr;
          var allocated;
          var contents = stream.node.contents;
          // Only make a new copy when MAP_PRIVATE is specified.
          if (!(flags & 2) && contents && contents.buffer === HEAP8.buffer) {
            // We can't emulate MAP_SHARED when the file is not backed by the
            // buffer we're mapping to (e.g. the HEAP buffer).
            allocated = false;
            ptr = contents.byteOffset;
          } else {
            allocated = true;
            ptr = mmapAlloc(length);
            if (!ptr) {
              throw new FS.ErrnoError(48);
            }
            if (contents) {
              // Try to avoid unnecessary slices.
              if (position > 0 || position + length < contents.length) {
                if (contents.subarray) {
                  contents = contents.subarray(position, position + length);
                } else {
                  contents = Array.prototype.slice.call(contents, position, position + length);
                }
              }
              HEAP8.set(contents, ptr);
            }
          }
          return { ptr, allocated };
        },
  msync(stream, buffer, offset, length, mmapFlags) {
          MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
          // should we check if bytesWritten and length are the same?
          return 0;
        },
  },
  };
  
  
  
  var FS_createDataFile = (...args) => FS.createDataFile(...args);
  
  var getUniqueRunDependency = (id) => {
      return id;
    };
  
  var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
      // Ensure plugins are ready.
      if (typeof Browser != 'undefined') Browser.init();
  
      var handled = false;
      preloadPlugins.forEach((plugin) => {
        if (handled) return;
        if (plugin['canHandle'](fullname)) {
          plugin['handle'](byteArray, fullname, finish, onerror);
          handled = true;
        }
      });
      return handled;
    };
  var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
      // TODO we should allow people to just pass in a complete filename instead
      // of parent and name being that we just join them anyways
      var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
      var dep = getUniqueRunDependency(`cp ${fullname}`); // might have several active requests for the same fullname
      function processData(byteArray) {
        function finish(byteArray) {
          preFinish?.();
          if (!dontCreateFile) {
            FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
          }
          onload?.();
          removeRunDependency(dep);
        }
        if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
          onerror?.();
          removeRunDependency(dep);
        })) {
          return;
        }
        finish(byteArray);
      }
      addRunDependency(dep);
      if (typeof url == 'string') {
        asyncLoad(url).then(processData, onerror);
      } else {
        processData(url);
      }
    };
  
  var FS_modeStringToFlags = (str) => {
      var flagModes = {
        'r': 0,
        'r+': 2,
        'w': 512 | 64 | 1,
        'w+': 512 | 64 | 2,
        'a': 1024 | 64 | 1,
        'a+': 1024 | 64 | 2,
      };
      var flags = flagModes[str];
      if (typeof flags == 'undefined') {
        throw new Error(`Unknown file open mode: ${str}`);
      }
      return flags;
    };
  
  var FS_getMode = (canRead, canWrite) => {
      var mode = 0;
      if (canRead) mode |= 292 | 73;
      if (canWrite) mode |= 146;
      return mode;
    };
  
  var FS = {
  root:null,
  mounts:[],
  devices:{
  },
  streams:[],
  nextInode:1,
  nameTable:null,
  currentPath:"/",
  initialized:false,
  ignorePermissions:true,
  filesystems:null,
  syncFSRequests:0,
  readFiles:{
  },
  ErrnoError:class {
        name = 'ErrnoError';
        // We set the `name` property to be able to identify `FS.ErrnoError`
        // - the `name` is a standard ECMA-262 property of error objects. Kind of good to have it anyway.
        // - when using PROXYFS, an error can come from an underlying FS
        // as different FS objects have their own FS.ErrnoError each,
        // the test `err instanceof FS.ErrnoError` won't detect an error coming from another filesystem, causing bugs.
        // we'll use the reliable test `err.name == "ErrnoError"` instead
        constructor(errno) {
          this.errno = errno;
        }
      },
  FSStream:class {
        shared = {};
        get object() {
          return this.node;
        }
        set object(val) {
          this.node = val;
        }
        get isRead() {
          return (this.flags & 2097155) !== 1;
        }
        get isWrite() {
          return (this.flags & 2097155) !== 0;
        }
        get isAppend() {
          return (this.flags & 1024);
        }
        get flags() {
          return this.shared.flags;
        }
        set flags(val) {
          this.shared.flags = val;
        }
        get position() {
          return this.shared.position;
        }
        set position(val) {
          this.shared.position = val;
        }
      },
  FSNode:class {
        node_ops = {};
        stream_ops = {};
        readMode = 292 | 73;
        writeMode = 146;
        mounted = null;
        constructor(parent, name, mode, rdev) {
          if (!parent) {
            parent = this;  // root node sets parent to itself
          }
          this.parent = parent;
          this.mount = parent.mount;
          this.id = FS.nextInode++;
          this.name = name;
          this.mode = mode;
          this.rdev = rdev;
          this.atime = this.mtime = this.ctime = Date.now();
        }
        get read() {
          return (this.mode & this.readMode) === this.readMode;
        }
        set read(val) {
          val ? this.mode |= this.readMode : this.mode &= ~this.readMode;
        }
        get write() {
          return (this.mode & this.writeMode) === this.writeMode;
        }
        set write(val) {
          val ? this.mode |= this.writeMode : this.mode &= ~this.writeMode;
        }
        get isFolder() {
          return FS.isDir(this.mode);
        }
        get isDevice() {
          return FS.isChrdev(this.mode);
        }
      },
  lookupPath(path, opts = {}) {
        if (!path) {
          throw new FS.ErrnoError(44);
        }
        opts.follow_mount ??= true
  
        if (!PATH.isAbs(path)) {
          path = FS.cwd() + '/' + path;
        }
  
        // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
        linkloop: for (var nlinks = 0; nlinks < 40; nlinks++) {
          // split the absolute path
          var parts = path.split('/').filter((p) => !!p);
  
          // start at the root
          var current = FS.root;
          var current_path = '/';
  
          for (var i = 0; i < parts.length; i++) {
            var islast = (i === parts.length-1);
            if (islast && opts.parent) {
              // stop resolving
              break;
            }
  
            if (parts[i] === '.') {
              continue;
            }
  
            if (parts[i] === '..') {
              current_path = PATH.dirname(current_path);
              if (FS.isRoot(current)) {
                path = current_path + '/' + parts.slice(i + 1).join('/');
                continue linkloop;
              } else {
                current = current.parent;
              }
              continue;
            }
  
            current_path = PATH.join2(current_path, parts[i]);
            try {
              current = FS.lookupNode(current, parts[i]);
            } catch (e) {
              // if noent_okay is true, suppress a ENOENT in the last component
              // and return an object with an undefined node. This is needed for
              // resolving symlinks in the path when creating a file.
              if ((e?.errno === 44) && islast && opts.noent_okay) {
                return { path: current_path };
              }
              throw e;
            }
  
            // jump to the mount's root node if this is a mountpoint
            if (FS.isMountpoint(current) && (!islast || opts.follow_mount)) {
              current = current.mounted.root;
            }
  
            // by default, lookupPath will not follow a symlink if it is the final path component.
            // setting opts.follow = true will override this behavior.
            if (FS.isLink(current.mode) && (!islast || opts.follow)) {
              if (!current.node_ops.readlink) {
                throw new FS.ErrnoError(52);
              }
              var link = current.node_ops.readlink(current);
              if (!PATH.isAbs(link)) {
                link = PATH.dirname(current_path) + '/' + link;
              }
              path = link + '/' + parts.slice(i + 1).join('/');
              continue linkloop;
            }
          }
          return { path: current_path, node: current };
        }
        throw new FS.ErrnoError(32);
      },
  getPath(node) {
        var path;
        while (true) {
          if (FS.isRoot(node)) {
            var mount = node.mount.mountpoint;
            if (!path) return mount;
            return mount[mount.length-1] !== '/' ? `${mount}/${path}` : mount + path;
          }
          path = path ? `${node.name}/${path}` : node.name;
          node = node.parent;
        }
      },
  hashName(parentid, name) {
        var hash = 0;
  
        for (var i = 0; i < name.length; i++) {
          hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
        }
        return ((parentid + hash) >>> 0) % FS.nameTable.length;
      },
  hashAddNode(node) {
        var hash = FS.hashName(node.parent.id, node.name);
        node.name_next = FS.nameTable[hash];
        FS.nameTable[hash] = node;
      },
  hashRemoveNode(node) {
        var hash = FS.hashName(node.parent.id, node.name);
        if (FS.nameTable[hash] === node) {
          FS.nameTable[hash] = node.name_next;
        } else {
          var current = FS.nameTable[hash];
          while (current) {
            if (current.name_next === node) {
              current.name_next = node.name_next;
              break;
            }
            current = current.name_next;
          }
        }
      },
  lookupNode(parent, name) {
        var errCode = FS.mayLookup(parent);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        var hash = FS.hashName(parent.id, name);
        for (var node = FS.nameTable[hash]; node; node = node.name_next) {
          var nodeName = node.name;
          if (node.parent.id === parent.id && nodeName === name) {
            return node;
          }
        }
        // if we failed to find it in the cache, call into the VFS
        return FS.lookup(parent, name);
      },
  createNode(parent, name, mode, rdev) {
        var node = new FS.FSNode(parent, name, mode, rdev);
  
        FS.hashAddNode(node);
  
        return node;
      },
  destroyNode(node) {
        FS.hashRemoveNode(node);
      },
  isRoot(node) {
        return node === node.parent;
      },
  isMountpoint(node) {
        return !!node.mounted;
      },
  isFile(mode) {
        return (mode & 61440) === 32768;
      },
  isDir(mode) {
        return (mode & 61440) === 16384;
      },
  isLink(mode) {
        return (mode & 61440) === 40960;
      },
  isChrdev(mode) {
        return (mode & 61440) === 8192;
      },
  isBlkdev(mode) {
        return (mode & 61440) === 24576;
      },
  isFIFO(mode) {
        return (mode & 61440) === 4096;
      },
  isSocket(mode) {
        return (mode & 49152) === 49152;
      },
  flagsToPermissionString(flag) {
        var perms = ['r', 'w', 'rw'][flag & 3];
        if ((flag & 512)) {
          perms += 'w';
        }
        return perms;
      },
  nodePermissions(node, perms) {
        if (FS.ignorePermissions) {
          return 0;
        }
        // return 0 if any user, group or owner bits are set.
        if (perms.includes('r') && !(node.mode & 292)) {
          return 2;
        } else if (perms.includes('w') && !(node.mode & 146)) {
          return 2;
        } else if (perms.includes('x') && !(node.mode & 73)) {
          return 2;
        }
        return 0;
      },
  mayLookup(dir) {
        if (!FS.isDir(dir.mode)) return 54;
        var errCode = FS.nodePermissions(dir, 'x');
        if (errCode) return errCode;
        if (!dir.node_ops.lookup) return 2;
        return 0;
      },
  mayCreate(dir, name) {
        if (!FS.isDir(dir.mode)) {
          return 54;
        }
        try {
          var node = FS.lookupNode(dir, name);
          return 20;
        } catch (e) {
        }
        return FS.nodePermissions(dir, 'wx');
      },
  mayDelete(dir, name, isdir) {
        var node;
        try {
          node = FS.lookupNode(dir, name);
        } catch (e) {
          return e.errno;
        }
        var errCode = FS.nodePermissions(dir, 'wx');
        if (errCode) {
          return errCode;
        }
        if (isdir) {
          if (!FS.isDir(node.mode)) {
            return 54;
          }
          if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
            return 10;
          }
        } else {
          if (FS.isDir(node.mode)) {
            return 31;
          }
        }
        return 0;
      },
  mayOpen(node, flags) {
        if (!node) {
          return 44;
        }
        if (FS.isLink(node.mode)) {
          return 32;
        } else if (FS.isDir(node.mode)) {
          if (FS.flagsToPermissionString(flags) !== 'r' // opening for write
              || (flags & (512 | 64))) { // TODO: check for O_SEARCH? (== search for dir only)
            return 31;
          }
        }
        return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
      },
  checkOpExists(op, err) {
        if (!op) {
          throw new FS.ErrnoError(err);
        }
        return op;
      },
  MAX_OPEN_FDS:4096,
  nextfd() {
        for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
          if (!FS.streams[fd]) {
            return fd;
          }
        }
        throw new FS.ErrnoError(33);
      },
  getStreamChecked(fd) {
        var stream = FS.getStream(fd);
        if (!stream) {
          throw new FS.ErrnoError(8);
        }
        return stream;
      },
  getStream:(fd) => FS.streams[fd],
  createStream(stream, fd = -1) {
  
        // clone it, so we can return an instance of FSStream
        stream = Object.assign(new FS.FSStream(), stream);
        if (fd == -1) {
          fd = FS.nextfd();
        }
        stream.fd = fd;
        FS.streams[fd] = stream;
        return stream;
      },
  closeStream(fd) {
        FS.streams[fd] = null;
      },
  dupStream(origStream, fd = -1) {
        var stream = FS.createStream(origStream, fd);
        stream.stream_ops?.dup?.(stream);
        return stream;
      },
  doSetAttr(stream, node, attr) {
        var setattr = stream?.stream_ops.setattr;
        var arg = setattr ? stream : node;
        setattr ??= node.node_ops.setattr;
        FS.checkOpExists(setattr, 63)
        setattr(arg, attr);
      },
  chrdev_stream_ops:{
  open(stream) {
          var device = FS.getDevice(stream.node.rdev);
          // override node's stream ops with the device's
          stream.stream_ops = device.stream_ops;
          // forward the open call
          stream.stream_ops.open?.(stream);
        },
  llseek() {
          throw new FS.ErrnoError(70);
        },
  },
  major:(dev) => ((dev) >> 8),
  minor:(dev) => ((dev) & 0xff),
  makedev:(ma, mi) => ((ma) << 8 | (mi)),
  registerDevice(dev, ops) {
        FS.devices[dev] = { stream_ops: ops };
      },
  getDevice:(dev) => FS.devices[dev],
  getMounts(mount) {
        var mounts = [];
        var check = [mount];
  
        while (check.length) {
          var m = check.pop();
  
          mounts.push(m);
  
          check.push(...m.mounts);
        }
  
        return mounts;
      },
  syncfs(populate, callback) {
        if (typeof populate == 'function') {
          callback = populate;
          populate = false;
        }
  
        FS.syncFSRequests++;
  
        if (FS.syncFSRequests > 1) {
          err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
        }
  
        var mounts = FS.getMounts(FS.root.mount);
        var completed = 0;
  
        function doCallback(errCode) {
          FS.syncFSRequests--;
          return callback(errCode);
        }
  
        function done(errCode) {
          if (errCode) {
            if (!done.errored) {
              done.errored = true;
              return doCallback(errCode);
            }
            return;
          }
          if (++completed >= mounts.length) {
            doCallback(null);
          }
        };
  
        // sync all mounts
        mounts.forEach((mount) => {
          if (!mount.type.syncfs) {
            return done(null);
          }
          mount.type.syncfs(mount, populate, done);
        });
      },
  mount(type, opts, mountpoint) {
        var root = mountpoint === '/';
        var pseudo = !mountpoint;
        var node;
  
        if (root && FS.root) {
          throw new FS.ErrnoError(10);
        } else if (!root && !pseudo) {
          var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
          mountpoint = lookup.path;  // use the absolute path
          node = lookup.node;
  
          if (FS.isMountpoint(node)) {
            throw new FS.ErrnoError(10);
          }
  
          if (!FS.isDir(node.mode)) {
            throw new FS.ErrnoError(54);
          }
        }
  
        var mount = {
          type,
          opts,
          mountpoint,
          mounts: []
        };
  
        // create a root node for the fs
        var mountRoot = type.mount(mount);
        mountRoot.mount = mount;
        mount.root = mountRoot;
  
        if (root) {
          FS.root = mountRoot;
        } else if (node) {
          // set as a mountpoint
          node.mounted = mount;
  
          // add the new mount to the current mount's children
          if (node.mount) {
            node.mount.mounts.push(mount);
          }
        }
  
        return mountRoot;
      },
  unmount(mountpoint) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
  
        if (!FS.isMountpoint(lookup.node)) {
          throw new FS.ErrnoError(28);
        }
  
        // destroy the nodes for this mount, and all its child mounts
        var node = lookup.node;
        var mount = node.mounted;
        var mounts = FS.getMounts(mount);
  
        Object.keys(FS.nameTable).forEach((hash) => {
          var current = FS.nameTable[hash];
  
          while (current) {
            var next = current.name_next;
  
            if (mounts.includes(current.mount)) {
              FS.destroyNode(current);
            }
  
            current = next;
          }
        });
  
        // no longer a mountpoint
        node.mounted = null;
  
        // remove this mount from the child mounts
        var idx = node.mount.mounts.indexOf(mount);
        node.mount.mounts.splice(idx, 1);
      },
  lookup(parent, name) {
        return parent.node_ops.lookup(parent, name);
      },
  mknod(path, mode, dev) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        if (!name) {
          throw new FS.ErrnoError(28);
        }
        if (name === '.' || name === '..') {
          throw new FS.ErrnoError(20);
        }
        var errCode = FS.mayCreate(parent, name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.mknod) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.mknod(parent, name, mode, dev);
      },
  statfs(path) {
        return FS.statfsNode(FS.lookupPath(path, {follow: true}).node);
      },
  statfsStream(stream) {
        // We keep a separate statfsStream function because noderawfs overrides
        // it. In noderawfs, stream.node is sometimes null. Instead, we need to
        // look at stream.path.
        return FS.statfsNode(stream.node);
      },
  statfsNode(node) {
        // NOTE: None of the defaults here are true. We're just returning safe and
        //       sane values. Currently nodefs and rawfs replace these defaults,
        //       other file systems leave them alone.
        var rtn = {
          bsize: 4096,
          frsize: 4096,
          blocks: 1e6,
          bfree: 5e5,
          bavail: 5e5,
          files: FS.nextInode,
          ffree: FS.nextInode - 1,
          fsid: 42,
          flags: 2,
          namelen: 255,
        };
  
        if (node.node_ops.statfs) {
          Object.assign(rtn, node.node_ops.statfs(node.mount.opts.root));
        }
        return rtn;
      },
  create(path, mode = 0o666) {
        mode &= 4095;
        mode |= 32768;
        return FS.mknod(path, mode, 0);
      },
  mkdir(path, mode = 0o777) {
        mode &= 511 | 512;
        mode |= 16384;
        return FS.mknod(path, mode, 0);
      },
  mkdirTree(path, mode) {
        var dirs = path.split('/');
        var d = '';
        for (var dir of dirs) {
          if (!dir) continue;
          if (d || PATH.isAbs(path)) d += '/';
          d += dir;
          try {
            FS.mkdir(d, mode);
          } catch(e) {
            if (e.errno != 20) throw e;
          }
        }
      },
  mkdev(path, mode, dev) {
        if (typeof dev == 'undefined') {
          dev = mode;
          mode = 0o666;
        }
        mode |= 8192;
        return FS.mknod(path, mode, dev);
      },
  symlink(oldpath, newpath) {
        if (!PATH_FS.resolve(oldpath)) {
          throw new FS.ErrnoError(44);
        }
        var lookup = FS.lookupPath(newpath, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var newname = PATH.basename(newpath);
        var errCode = FS.mayCreate(parent, newname);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.symlink) {
          throw new FS.ErrnoError(63);
        }
        return parent.node_ops.symlink(parent, newname, oldpath);
      },
  rename(old_path, new_path) {
        var old_dirname = PATH.dirname(old_path);
        var new_dirname = PATH.dirname(new_path);
        var old_name = PATH.basename(old_path);
        var new_name = PATH.basename(new_path);
        // parents must exist
        var lookup, old_dir, new_dir;
  
        // let the errors from non existent directories percolate up
        lookup = FS.lookupPath(old_path, { parent: true });
        old_dir = lookup.node;
        lookup = FS.lookupPath(new_path, { parent: true });
        new_dir = lookup.node;
  
        if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
        // need to be part of the same mount
        if (old_dir.mount !== new_dir.mount) {
          throw new FS.ErrnoError(75);
        }
        // source must exist
        var old_node = FS.lookupNode(old_dir, old_name);
        // old path should not be an ancestor of the new path
        var relative = PATH_FS.relative(old_path, new_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(28);
        }
        // new path should not be an ancestor of the old path
        relative = PATH_FS.relative(new_path, old_dirname);
        if (relative.charAt(0) !== '.') {
          throw new FS.ErrnoError(55);
        }
        // see if the new path already exists
        var new_node;
        try {
          new_node = FS.lookupNode(new_dir, new_name);
        } catch (e) {
          // not fatal
        }
        // early out if nothing needs to change
        if (old_node === new_node) {
          return;
        }
        // we'll need to delete the old entry
        var isdir = FS.isDir(old_node.mode);
        var errCode = FS.mayDelete(old_dir, old_name, isdir);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        // need delete permissions if we'll be overwriting.
        // need create permissions if new doesn't already exist.
        errCode = new_node ?
          FS.mayDelete(new_dir, new_name, isdir) :
          FS.mayCreate(new_dir, new_name);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!old_dir.node_ops.rename) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
          throw new FS.ErrnoError(10);
        }
        // if we are going to change the parent, check write permissions
        if (new_dir !== old_dir) {
          errCode = FS.nodePermissions(old_dir, 'w');
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        // remove the node from the lookup hash
        FS.hashRemoveNode(old_node);
        // do the underlying fs rename
        try {
          old_dir.node_ops.rename(old_node, new_dir, new_name);
          // update old node (we do this here to avoid each backend
          // needing to)
          old_node.parent = new_dir;
        } catch (e) {
          throw e;
        } finally {
          // add the node back to the hash (in case node_ops.rename
          // changed its name)
          FS.hashAddNode(old_node);
        }
      },
  rmdir(path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, true);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.rmdir) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.rmdir(parent, name);
        FS.destroyNode(node);
      },
  readdir(path) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        var readdir = FS.checkOpExists(node.node_ops.readdir, 54);
        return readdir(node);
      },
  unlink(path) {
        var lookup = FS.lookupPath(path, { parent: true });
        var parent = lookup.node;
        if (!parent) {
          throw new FS.ErrnoError(44);
        }
        var name = PATH.basename(path);
        var node = FS.lookupNode(parent, name);
        var errCode = FS.mayDelete(parent, name, false);
        if (errCode) {
          // According to POSIX, we should map EISDIR to EPERM, but
          // we instead do what Linux does (and we must, as we use
          // the musl linux libc).
          throw new FS.ErrnoError(errCode);
        }
        if (!parent.node_ops.unlink) {
          throw new FS.ErrnoError(63);
        }
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        parent.node_ops.unlink(parent, name);
        FS.destroyNode(node);
      },
  readlink(path) {
        var lookup = FS.lookupPath(path);
        var link = lookup.node;
        if (!link) {
          throw new FS.ErrnoError(44);
        }
        if (!link.node_ops.readlink) {
          throw new FS.ErrnoError(28);
        }
        return link.node_ops.readlink(link);
      },
  stat(path, dontFollow) {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        var node = lookup.node;
        var getattr = FS.checkOpExists(node.node_ops.getattr, 63);
        return getattr(node);
      },
  fstat(fd) {
        var stream = FS.getStreamChecked(fd);
        var node = stream.node;
        var getattr = stream.stream_ops.getattr;
        var arg = getattr ? stream : node;
        getattr ??= node.node_ops.getattr;
        FS.checkOpExists(getattr, 63)
        return getattr(arg);
      },
  lstat(path) {
        return FS.stat(path, true);
      },
  doChmod(stream, node, mode, dontFollow) {
        FS.doSetAttr(stream, node, {
          mode: (mode & 4095) | (node.mode & ~4095),
          ctime: Date.now(),
          dontFollow
        });
      },
  chmod(path, mode, dontFollow) {
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        FS.doChmod(null, node, mode, dontFollow);
      },
  lchmod(path, mode) {
        FS.chmod(path, mode, true);
      },
  fchmod(fd, mode) {
        var stream = FS.getStreamChecked(fd);
        FS.doChmod(stream, stream.node, mode, false);
      },
  doChown(stream, node, dontFollow) {
        FS.doSetAttr(stream, node, {
          timestamp: Date.now(),
          dontFollow
          // we ignore the uid / gid for now
        });
      },
  chown(path, uid, gid, dontFollow) {
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: !dontFollow });
          node = lookup.node;
        } else {
          node = path;
        }
        FS.doChown(null, node, dontFollow);
      },
  lchown(path, uid, gid) {
        FS.chown(path, uid, gid, true);
      },
  fchown(fd, uid, gid) {
        var stream = FS.getStreamChecked(fd);
        FS.doChown(stream, stream.node, false);
      },
  doTruncate(stream, node, len) {
        if (FS.isDir(node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!FS.isFile(node.mode)) {
          throw new FS.ErrnoError(28);
        }
        var errCode = FS.nodePermissions(node, 'w');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        FS.doSetAttr(stream, node, {
          size: len,
          timestamp: Date.now()
        });
      },
  truncate(path, len) {
        if (len < 0) {
          throw new FS.ErrnoError(28);
        }
        var node;
        if (typeof path == 'string') {
          var lookup = FS.lookupPath(path, { follow: true });
          node = lookup.node;
        } else {
          node = path;
        }
        FS.doTruncate(null, node, len);
      },
  ftruncate(fd, len) {
        var stream = FS.getStreamChecked(fd);
        if (len < 0 || (stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(28);
        }
        FS.doTruncate(stream, stream.node, len);
      },
  utime(path, atime, mtime) {
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        var setattr = FS.checkOpExists(node.node_ops.setattr, 63);
        setattr(node, {
          atime: atime,
          mtime: mtime
        });
      },
  open(path, flags, mode = 0o666) {
        if (path === "") {
          throw new FS.ErrnoError(44);
        }
        flags = typeof flags == 'string' ? FS_modeStringToFlags(flags) : flags;
        if ((flags & 64)) {
          mode = (mode & 4095) | 32768;
        } else {
          mode = 0;
        }
        var node;
        var isDirPath;
        if (typeof path == 'object') {
          node = path;
        } else {
          isDirPath = path.endsWith("/");
          // noent_okay makes it so that if the final component of the path
          // doesn't exist, lookupPath returns `node: undefined`. `path` will be
          // updated to point to the target of all symlinks.
          var lookup = FS.lookupPath(path, {
            follow: !(flags & 131072),
            noent_okay: true
          });
          node = lookup.node;
          path = lookup.path;
        }
        // perhaps we need to create the node
        var created = false;
        if ((flags & 64)) {
          if (node) {
            // if O_CREAT and O_EXCL are set, error out if the node already exists
            if ((flags & 128)) {
              throw new FS.ErrnoError(20);
            }
          } else if (isDirPath) {
            throw new FS.ErrnoError(31);
          } else {
            // node doesn't exist, try to create it
            // Ignore the permission bits here to ensure we can `open` this new
            // file below. We use chmod below the apply the permissions once the
            // file is open.
            node = FS.mknod(path, mode | 0o777, 0);
            created = true;
          }
        }
        if (!node) {
          throw new FS.ErrnoError(44);
        }
        // can't truncate a device
        if (FS.isChrdev(node.mode)) {
          flags &= ~512;
        }
        // if asked only for a directory, then this must be one
        if ((flags & 65536) && !FS.isDir(node.mode)) {
          throw new FS.ErrnoError(54);
        }
        // check permissions, if this is not a file we just created now (it is ok to
        // create and write to a file with read-only permissions; it is read-only
        // for later use)
        if (!created) {
          var errCode = FS.mayOpen(node, flags);
          if (errCode) {
            throw new FS.ErrnoError(errCode);
          }
        }
        // do truncation if necessary
        if ((flags & 512) && !created) {
          FS.truncate(node, 0);
        }
        // we've already handled these, don't pass down to the underlying vfs
        flags &= ~(128 | 512 | 131072);
  
        // register the stream with the filesystem
        var stream = FS.createStream({
          node,
          path: FS.getPath(node),  // we want the absolute path to the node
          flags,
          seekable: true,
          position: 0,
          stream_ops: node.stream_ops,
          // used by the file family libc calls (fopen, fwrite, ferror, etc.)
          ungotten: [],
          error: false
        });
        // call the new stream's open function
        if (stream.stream_ops.open) {
          stream.stream_ops.open(stream);
        }
        if (created) {
          FS.chmod(node, mode & 0o777);
        }
        if (Module['logReadFiles'] && !(flags & 1)) {
          if (!(path in FS.readFiles)) {
            FS.readFiles[path] = 1;
          }
        }
        return stream;
      },
  close(stream) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (stream.getdents) stream.getdents = null; // free readdir state
        try {
          if (stream.stream_ops.close) {
            stream.stream_ops.close(stream);
          }
        } catch (e) {
          throw e;
        } finally {
          FS.closeStream(stream.fd);
        }
        stream.fd = null;
      },
  isClosed(stream) {
        return stream.fd === null;
      },
  llseek(stream, offset, whence) {
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if (!stream.seekable || !stream.stream_ops.llseek) {
          throw new FS.ErrnoError(70);
        }
        if (whence != 0 && whence != 1 && whence != 2) {
          throw new FS.ErrnoError(28);
        }
        stream.position = stream.stream_ops.llseek(stream, offset, whence);
        stream.ungotten = [];
        return stream.position;
      },
  read(stream, buffer, offset, length, position) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.read) {
          throw new FS.ErrnoError(28);
        }
        var seeking = typeof position != 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
        if (!seeking) stream.position += bytesRead;
        return bytesRead;
      },
  write(stream, buffer, offset, length, position, canOwn) {
        if (length < 0 || position < 0) {
          throw new FS.ErrnoError(28);
        }
        if (FS.isClosed(stream)) {
          throw new FS.ErrnoError(8);
        }
        if ((stream.flags & 2097155) === 0) {
          throw new FS.ErrnoError(8);
        }
        if (FS.isDir(stream.node.mode)) {
          throw new FS.ErrnoError(31);
        }
        if (!stream.stream_ops.write) {
          throw new FS.ErrnoError(28);
        }
        if (stream.seekable && stream.flags & 1024) {
          // seek to the end before writing in append mode
          FS.llseek(stream, 0, 2);
        }
        var seeking = typeof position != 'undefined';
        if (!seeking) {
          position = stream.position;
        } else if (!stream.seekable) {
          throw new FS.ErrnoError(70);
        }
        var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
        if (!seeking) stream.position += bytesWritten;
        return bytesWritten;
      },
  mmap(stream, length, position, prot, flags) {
        // User requests writing to file (prot & PROT_WRITE != 0).
        // Checking if we have permissions to write to the file unless
        // MAP_PRIVATE flag is set. According to POSIX spec it is possible
        // to write to file opened in read-only mode with MAP_PRIVATE flag,
        // as all modifications will be visible only in the memory of
        // the current process.
        if ((prot & 2) !== 0
            && (flags & 2) === 0
            && (stream.flags & 2097155) !== 2) {
          throw new FS.ErrnoError(2);
        }
        if ((stream.flags & 2097155) === 1) {
          throw new FS.ErrnoError(2);
        }
        if (!stream.stream_ops.mmap) {
          throw new FS.ErrnoError(43);
        }
        if (!length) {
          throw new FS.ErrnoError(28);
        }
        return stream.stream_ops.mmap(stream, length, position, prot, flags);
      },
  msync(stream, buffer, offset, length, mmapFlags) {
        if (!stream.stream_ops.msync) {
          return 0;
        }
        return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
      },
  ioctl(stream, cmd, arg) {
        if (!stream.stream_ops.ioctl) {
          throw new FS.ErrnoError(59);
        }
        return stream.stream_ops.ioctl(stream, cmd, arg);
      },
  readFile(path, opts = {}) {
        opts.flags = opts.flags || 0;
        opts.encoding = opts.encoding || 'binary';
        if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
          throw new Error(`Invalid encoding type "${opts.encoding}"`);
        }
        var stream = FS.open(path, opts.flags);
        var stat = FS.stat(path);
        var length = stat.size;
        var buf = new Uint8Array(length);
        FS.read(stream, buf, 0, length, 0);
        if (opts.encoding === 'utf8') {
          buf = UTF8ArrayToString(buf);
        }
        FS.close(stream);
        return buf;
      },
  writeFile(path, data, opts = {}) {
        opts.flags = opts.flags || 577;
        var stream = FS.open(path, opts.flags, opts.mode);
        if (typeof data == 'string') {
          data = new Uint8Array(intArrayFromString(data, true));
        }
        if (ArrayBuffer.isView(data)) {
          FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
        } else {
          throw new Error('Unsupported data type');
        }
        FS.close(stream);
      },
  cwd:() => FS.currentPath,
  chdir(path) {
        var lookup = FS.lookupPath(path, { follow: true });
        if (lookup.node === null) {
          throw new FS.ErrnoError(44);
        }
        if (!FS.isDir(lookup.node.mode)) {
          throw new FS.ErrnoError(54);
        }
        var errCode = FS.nodePermissions(lookup.node, 'x');
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
        FS.currentPath = lookup.path;
      },
  createDefaultDirectories() {
        FS.mkdir('/tmp');
        FS.mkdir('/home');
        FS.mkdir('/home/web_user');
      },
  createDefaultDevices() {
        // create /dev
        FS.mkdir('/dev');
        // setup /dev/null
        FS.registerDevice(FS.makedev(1, 3), {
          read: () => 0,
          write: (stream, buffer, offset, length, pos) => length,
          llseek: () => 0,
        });
        FS.mkdev('/dev/null', FS.makedev(1, 3));
        // setup /dev/tty and /dev/tty1
        // stderr needs to print output using err() rather than out()
        // so we register a second tty just for it.
        TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
        TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
        FS.mkdev('/dev/tty', FS.makedev(5, 0));
        FS.mkdev('/dev/tty1', FS.makedev(6, 0));
        // setup /dev/[u]random
        // use a buffer to avoid overhead of individual crypto calls per byte
        var randomBuffer = new Uint8Array(1024), randomLeft = 0;
        var randomByte = () => {
          if (randomLeft === 0) {
            randomFill(randomBuffer);
            randomLeft = randomBuffer.byteLength;
          }
          return randomBuffer[--randomLeft];
        };
        FS.createDevice('/dev', 'random', randomByte);
        FS.createDevice('/dev', 'urandom', randomByte);
        // we're not going to emulate the actual shm device,
        // just create the tmp dirs that reside in it commonly
        FS.mkdir('/dev/shm');
        FS.mkdir('/dev/shm/tmp');
      },
  createSpecialDirectories() {
        // create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the
        // name of the stream for fd 6 (see test_unistd_ttyname)
        FS.mkdir('/proc');
        var proc_self = FS.mkdir('/proc/self');
        FS.mkdir('/proc/self/fd');
        FS.mount({
          mount() {
            var node = FS.createNode(proc_self, 'fd', 16895, 73);
            node.stream_ops = {
              llseek: MEMFS.stream_ops.llseek,
            };
            node.node_ops = {
              lookup(parent, name) {
                var fd = +name;
                var stream = FS.getStreamChecked(fd);
                var ret = {
                  parent: null,
                  mount: { mountpoint: 'fake' },
                  node_ops: { readlink: () => stream.path },
                  id: fd + 1,
                };
                ret.parent = ret; // make it look like a simple root node
                return ret;
              },
              readdir() {
                return Array.from(FS.streams.entries())
                  .filter(([k, v]) => v)
                  .map(([k, v]) => k.toString());
              }
            };
            return node;
          }
        }, {}, '/proc/self/fd');
      },
  createStandardStreams(input, output, error) {
        // TODO deprecate the old functionality of a single
        // input / output callback and that utilizes FS.createDevice
        // and instead require a unique set of stream ops
  
        // by default, we symlink the standard streams to the
        // default tty devices. however, if the standard streams
        // have been overwritten we create a unique device for
        // them instead.
        if (input) {
          FS.createDevice('/dev', 'stdin', input);
        } else {
          FS.symlink('/dev/tty', '/dev/stdin');
        }
        if (output) {
          FS.createDevice('/dev', 'stdout', null, output);
        } else {
          FS.symlink('/dev/tty', '/dev/stdout');
        }
        if (error) {
          FS.createDevice('/dev', 'stderr', null, error);
        } else {
          FS.symlink('/dev/tty1', '/dev/stderr');
        }
  
        // open default streams for the stdin, stdout and stderr devices
        var stdin = FS.open('/dev/stdin', 0);
        var stdout = FS.open('/dev/stdout', 1);
        var stderr = FS.open('/dev/stderr', 1);
      },
  staticInit() {
        FS.nameTable = new Array(4096);
  
        FS.mount(MEMFS, {}, '/');
  
        FS.createDefaultDirectories();
        FS.createDefaultDevices();
        FS.createSpecialDirectories();
  
        FS.filesystems = {
          'MEMFS': MEMFS,
        };
      },
  init(input, output, error) {
        FS.initialized = true;
  
        // Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
        input ??= Module['stdin'];
        output ??= Module['stdout'];
        error ??= Module['stderr'];
  
        FS.createStandardStreams(input, output, error);
      },
  quit() {
        FS.initialized = false;
        // force-flush all streams, so we get musl std streams printed out
        _fflush(0);
        // close all of our streams
        for (var stream of FS.streams) {
          if (stream) {
            FS.close(stream);
          }
        }
      },
  findObject(path, dontResolveLastLink) {
        var ret = FS.analyzePath(path, dontResolveLastLink);
        if (!ret.exists) {
          return null;
        }
        return ret.object;
      },
  analyzePath(path, dontResolveLastLink) {
        // operate from within the context of the symlink's target
        try {
          var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          path = lookup.path;
        } catch (e) {
        }
        var ret = {
          isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
          parentExists: false, parentPath: null, parentObject: null
        };
        try {
          var lookup = FS.lookupPath(path, { parent: true });
          ret.parentExists = true;
          ret.parentPath = lookup.path;
          ret.parentObject = lookup.node;
          ret.name = PATH.basename(path);
          lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
          ret.exists = true;
          ret.path = lookup.path;
          ret.object = lookup.node;
          ret.name = lookup.node.name;
          ret.isRoot = lookup.path === '/';
        } catch (e) {
          ret.error = e.errno;
        };
        return ret;
      },
  createPath(parent, path, canRead, canWrite) {
        parent = typeof parent == 'string' ? parent : FS.getPath(parent);
        var parts = path.split('/').reverse();
        while (parts.length) {
          var part = parts.pop();
          if (!part) continue;
          var current = PATH.join2(parent, part);
          try {
            FS.mkdir(current);
          } catch (e) {
            if (e.errno != 20) throw e;
          }
          parent = current;
        }
        return current;
      },
  createFile(parent, name, properties, canRead, canWrite) {
        var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
        var mode = FS_getMode(canRead, canWrite);
        return FS.create(path, mode);
      },
  createDataFile(parent, name, data, canRead, canWrite, canOwn) {
        var path = name;
        if (parent) {
          parent = typeof parent == 'string' ? parent : FS.getPath(parent);
          path = name ? PATH.join2(parent, name) : parent;
        }
        var mode = FS_getMode(canRead, canWrite);
        var node = FS.create(path, mode);
        if (data) {
          if (typeof data == 'string') {
            var arr = new Array(data.length);
            for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
            data = arr;
          }
          // make sure we can write to the file
          FS.chmod(node, mode | 146);
          var stream = FS.open(node, 577);
          FS.write(stream, data, 0, data.length, 0, canOwn);
          FS.close(stream);
          FS.chmod(node, mode);
        }
      },
  createDevice(parent, name, input, output) {
        var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
        var mode = FS_getMode(!!input, !!output);
        FS.createDevice.major ??= 64;
        var dev = FS.makedev(FS.createDevice.major++, 0);
        // Create a fake device that a set of stream ops to emulate
        // the old behavior.
        FS.registerDevice(dev, {
          open(stream) {
            stream.seekable = false;
          },
          close(stream) {
            // flush any pending line data
            if (output?.buffer?.length) {
              output(10);
            }
          },
          read(stream, buffer, offset, length, pos /* ignored */) {
            var bytesRead = 0;
            for (var i = 0; i < length; i++) {
              var result;
              try {
                result = input();
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
              if (result === undefined && bytesRead === 0) {
                throw new FS.ErrnoError(6);
              }
              if (result === null || result === undefined) break;
              bytesRead++;
              buffer[offset+i] = result;
            }
            if (bytesRead) {
              stream.node.atime = Date.now();
            }
            return bytesRead;
          },
          write(stream, buffer, offset, length, pos) {
            for (var i = 0; i < length; i++) {
              try {
                output(buffer[offset+i]);
              } catch (e) {
                throw new FS.ErrnoError(29);
              }
            }
            if (length) {
              stream.node.mtime = stream.node.ctime = Date.now();
            }
            return i;
          }
        });
        return FS.mkdev(path, mode, dev);
      },
  forceLoadFile(obj) {
        if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
        if (typeof XMLHttpRequest != 'undefined') {
          throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
        } else { // Command-line.
          try {
            obj.contents = readBinary(obj.url);
            obj.usedBytes = obj.contents.length;
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        }
      },
  createLazyFile(parent, name, url, canRead, canWrite) {
        // Lazy chunked Uint8Array (implements get and length from Uint8Array).
        // Actual getting is abstracted away for eventual reuse.
        class LazyUint8Array {
          lengthKnown = false;
          chunks = []; // Loaded chunks. Index is the chunk number
          get(idx) {
            if (idx > this.length-1 || idx < 0) {
              return undefined;
            }
            var chunkOffset = idx % this.chunkSize;
            var chunkNum = (idx / this.chunkSize)|0;
            return this.getter(chunkNum)[chunkOffset];
          }
          setDataGetter(getter) {
            this.getter = getter;
          }
          cacheLength() {
            // Find length
            var xhr = new XMLHttpRequest();
            xhr.open('HEAD', url, false);
            xhr.send(null);
            if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
            var datalength = Number(xhr.getResponseHeader("Content-length"));
            var header;
            var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
            var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
  
            var chunkSize = 1024*1024; // Chunk size in bytes
  
            if (!hasByteServing) chunkSize = datalength;
  
            // Function to get a range from the remote URL.
            var doXHR = (from, to) => {
              if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
              if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");
  
              // TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
              var xhr = new XMLHttpRequest();
              xhr.open('GET', url, false);
              if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
  
              // Some hints to the browser that we want binary data.
              xhr.responseType = 'arraybuffer';
              if (xhr.overrideMimeType) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
              }
  
              xhr.send(null);
              if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
              if (xhr.response !== undefined) {
                return new Uint8Array(/** @type{Array<number>} */(xhr.response || []));
              }
              return intArrayFromString(xhr.responseText || '', true);
            };
            var lazyArray = this;
            lazyArray.setDataGetter((chunkNum) => {
              var start = chunkNum * chunkSize;
              var end = (chunkNum+1) * chunkSize - 1; // including this byte
              end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
              if (typeof lazyArray.chunks[chunkNum] == 'undefined') {
                lazyArray.chunks[chunkNum] = doXHR(start, end);
              }
              if (typeof lazyArray.chunks[chunkNum] == 'undefined') throw new Error('doXHR failed!');
              return lazyArray.chunks[chunkNum];
            });
  
            if (usesGzip || !datalength) {
              // if the server uses gzip or doesn't supply the length, we have to download the whole file to get the (uncompressed) length
              chunkSize = datalength = 1; // this will force getter(0)/doXHR do download the whole file
              datalength = this.getter(0).length;
              chunkSize = datalength;
              out("LazyFiles on gzip forces download of the whole file when length is accessed");
            }
  
            this._length = datalength;
            this._chunkSize = chunkSize;
            this.lengthKnown = true;
          }
          get length() {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._length;
          }
          get chunkSize() {
            if (!this.lengthKnown) {
              this.cacheLength();
            }
            return this._chunkSize;
          }
        }
  
        if (typeof XMLHttpRequest != 'undefined') {
          if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
          var lazyArray = new LazyUint8Array();
          var properties = { isDevice: false, contents: lazyArray };
        } else {
          var properties = { isDevice: false, url: url };
        }
  
        var node = FS.createFile(parent, name, properties, canRead, canWrite);
        // This is a total hack, but I want to get this lazy file code out of the
        // core of MEMFS. If we want to keep this lazy file concept I feel it should
        // be its own thin LAZYFS proxying calls to MEMFS.
        if (properties.contents) {
          node.contents = properties.contents;
        } else if (properties.url) {
          node.contents = null;
          node.url = properties.url;
        }
        // Add a function that defers querying the file size until it is asked the first time.
        Object.defineProperties(node, {
          usedBytes: {
            get: function() { return this.contents.length; }
          }
        });
        // override each stream op with one that tries to force load the lazy file first
        var stream_ops = {};
        var keys = Object.keys(node.stream_ops);
        keys.forEach((key) => {
          var fn = node.stream_ops[key];
          stream_ops[key] = (...args) => {
            FS.forceLoadFile(node);
            return fn(...args);
          };
        });
        function writeChunks(stream, buffer, offset, length, position) {
          var contents = stream.node.contents;
          if (position >= contents.length)
            return 0;
          var size = Math.min(contents.length - position, length);
          if (contents.slice) { // normal array
            for (var i = 0; i < size; i++) {
              buffer[offset + i] = contents[position + i];
            }
          } else {
            for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
              buffer[offset + i] = contents.get(position + i);
            }
          }
          return size;
        }
        // use a custom read function
        stream_ops.read = (stream, buffer, offset, length, position) => {
          FS.forceLoadFile(node);
          return writeChunks(stream, buffer, offset, length, position)
        };
        // use a custom mmap function
        stream_ops.mmap = (stream, length, position, prot, flags) => {
          FS.forceLoadFile(node);
          var ptr = mmapAlloc(length);
          if (!ptr) {
            throw new FS.ErrnoError(48);
          }
          writeChunks(stream, HEAP8, ptr, length, position);
          return { ptr, allocated: true };
        };
        node.stream_ops = stream_ops;
        return node;
      },
  };
  
  
  var findLibraryFS = (libName, rpath) => {
      // If we're preloading a dynamic library, the runtime is not ready to call
      // __wasmfs_identify or __emscripten_find_dylib. So just quit out.
      //
      // This means that DT_NEEDED for the main module and transitive dependencies
      // of it won't work with this code path. Similarly, it means that calling
      // loadDynamicLibrary in a preRun hook can't use this code path.
      if (!runtimeInitialized) {
        return undefined;
      }
      if (PATH.isAbs(libName)) {
        try {
          FS.lookupPath(libName);
          return libName;
        } catch (e) {
          return undefined;
        }
      }
      var rpathResolved = (rpath?.paths || []).map((p) => replaceORIGIN(rpath?.parentLibPath, p));
      return withStackSave(() => {
        // In dylink.c we use: `char buf[2*NAME_MAX+2];` and NAME_MAX is 255.
        // So we use the same size here.
        var bufSize = 2*255 + 2;
        var buf = stackAlloc(bufSize);
        var rpathC = stringToUTF8OnStack(rpathResolved.join(':'));
        var libNameC = stringToUTF8OnStack(libName);
        var resLibNameC = __emscripten_find_dylib(buf, rpathC, libNameC, bufSize);
        return resLibNameC ? UTF8ToString(resLibNameC) : undefined;
      });
    };
  
      /**
       * @param {number=} handle
       * @param {Object=} localScope
       */
  function loadDynamicLibrary(libName, flags = {global: true, nodelete: true}, localScope, handle) {
      // when loadDynamicLibrary did not have flags, libraries were loaded
      // globally & permanently
  
      var dso = LDSO.loadedLibsByName[libName];
      if (dso) {
        // the library is being loaded or has been loaded already.
        if (!flags.global) {
          if (localScope) {
            Object.assign(localScope, dso.exports);
          }
        } else if (!dso.global) {
          // The library was previously loaded only locally but not
          // we have a request with global=true.
          dso.global = true;
          mergeLibSymbols(dso.exports, libName)
        }
        // same for "nodelete"
        if (flags.nodelete && dso.refcount !== Infinity) {
          dso.refcount = Infinity;
        }
        dso.refcount++
        if (handle) {
          LDSO.loadedLibsByHandle[handle] = dso;
        }
        return flags.loadAsync ? Promise.resolve(true) : true;
      }
  
      // allocate new DSO
      dso = newDSO(libName, handle, 'loading');
      dso.refcount = flags.nodelete ? Infinity : 1;
      dso.global = flags.global;
  
      // libName -> libData
      function loadLibData() {
        var sharedMod = sharedModules[libName];
        if (sharedMod) {
          return flags.loadAsync ? Promise.resolve(sharedMod) : sharedMod;
        }
  
        // for wasm, we can use fetch for async, but for fs mode we can only imitate it
        if (handle) {
          var data = HEAPU32[(((handle)+(28))>>2)];
          var dataSize = HEAPU32[(((handle)+(32))>>2)];
          if (data && dataSize) {
            var libData = HEAP8.slice(data, data + dataSize);
            return flags.loadAsync ? Promise.resolve(libData) : libData;
          }
        }
  
        var f = findLibraryFS(libName, flags.rpath);
        if (f) {
          var libData = FS.readFile(f, {encoding: 'binary'});
          return flags.loadAsync ? Promise.resolve(libData) : libData;
        }
  
        var libFile = locateFile(libName);
        if (flags.loadAsync) {
          return asyncLoad(libFile);
        }
  
        // load the binary synchronously
        if (!readBinary) {
          throw new Error(`${libFile}: file not found, and synchronous loading of external files is not available`);
        }
        return readBinary(libFile);
      }
  
      // libName -> exports
      function getExports() {
        // lookup preloaded cache first
        var preloaded = preloadedWasm[libName];
        if (preloaded) {
          return flags.loadAsync ? Promise.resolve(preloaded) : preloaded;
        }
  
        // module not preloaded - load lib data and create new module from it
        if (flags.loadAsync) {
          return loadLibData().then((libData) => loadWebAssemblyModule(libData, flags, libName, localScope, handle));
        }
  
        return loadWebAssemblyModule(loadLibData(), flags, libName, localScope, handle);
      }
  
      // module for lib is loaded - update the dso & global namespace
      function moduleLoaded(exports) {
        if (dso.global) {
          mergeLibSymbols(exports, libName);
        } else if (localScope) {
          Object.assign(localScope, exports);
        }
        dso.exports = exports;
      }
  
      if (flags.loadAsync) {
        return getExports().then((exports) => {
          moduleLoaded(exports);
          return true;
        });
      }
  
      moduleLoaded(getExports());
      return true;
    }
  
  
  var reportUndefinedSymbols = () => {
      for (var [symName, entry] of Object.entries(GOT)) {
        if (entry.value == 0) {
          var value = resolveGlobalSymbol(symName, true).sym;
          if (!value && !entry.required) {
            // Ignore undefined symbols that are imported as weak.
            continue;
          }
          if (typeof value == 'function') {
            /** @suppress {checkTypes} */
            entry.value = addFunction(value, value.sig);
          } else if (typeof value == 'number') {
            entry.value = value;
          } else {
            throw new Error(`bad export type for '${symName}': ${typeof value}`);
          }
        }
      }
    };
  var loadDylibs = () => {
      if (!dynamicLibraries.length) {
        reportUndefinedSymbols();
        return;
      }
  
      // Load binaries asynchronously
      addRunDependency('loadDylibs');
      dynamicLibraries
        .reduce((chain, lib) => chain.then(() =>
          loadDynamicLibrary(lib, {loadAsync: true, global: true, nodelete: true, allowUndefined: true})
        ), Promise.resolve())
        .then(() => {
          // we got them all, wonderful
          reportUndefinedSymbols();
          removeRunDependency('loadDylibs');
        });
    };


  var noExitRuntime = false;

  var registerTLSInit = (tlsInitFunc, moduleExports, metadata) => {
      // In relocatable builds, we use the result of calling tlsInitFunc
      // (`_emscripten_tls_init`) to relocate the TLS exports of the module
      // according to this new __tls_base.
      function tlsInitWrapper() {
        var __tls_base = tlsInitFunc();
        if (!__tls_base) {
          return;
        }
        var tlsExports = {};
        metadata.tlsExports.forEach((s) => tlsExports[s] = moduleExports[s]);
        relocateExports(tlsExports, __tls_base, /*replace=*/true);
      }
  
      // Register this function so that its gets called for each thread on
      // startup.
      PThread.tlsInitFunctions.push(tlsInitWrapper);
  
      // If the main thread is already running we also need to call this function
      // now.  If the main thread is not yet running this will happen when it
      // is initialized and processes `PThread.tlsInitFunctions`.
      if (runtimeInitialized) {
        tlsInitWrapper();
      }
    };



  
    /**
     * @param {number} ptr
     * @param {number} value
     * @param {string} type
     */
  function setValue(ptr, value, type = 'i8') {
    if (type.endsWith('*')) type = '*';
    switch (type) {
      case 'i1': HEAP8[ptr] = value; break;
      case 'i8': HEAP8[ptr] = value; break;
      case 'i16': HEAP16[((ptr)>>1)] = value; break;
      case 'i32': HEAP32[((ptr)>>2)] = value; break;
      case 'i64': HEAP64[((ptr)>>3)] = BigInt(value); break;
      case 'float': HEAPF32[((ptr)>>2)] = value; break;
      case 'double': HEAPF64[((ptr)>>3)] = value; break;
      case '*': HEAPU32[((ptr)>>2)] = value; break;
      default: abort(`invalid type for setValue: ${type}`);
    }
  }



  var ___assert_fail = (condition, filename, line, func) =>
      abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function']);
  ___assert_fail.sig = 'vppip';

  var ___call_sighandler = (fp, sig) => getWasmTableEntry(fp)(sig);
  ___call_sighandler.sig = 'vpi';

  var exceptionCaught =  [];
  
  
  
  var uncaughtExceptionCount = 0;
  var ___cxa_begin_catch = (ptr) => {
      var info = new ExceptionInfo(ptr);
      if (!info.get_caught()) {
        info.set_caught(true);
        uncaughtExceptionCount--;
      }
      info.set_rethrown(false);
      exceptionCaught.push(info);
      ___cxa_increment_exception_refcount(ptr);
      return ___cxa_get_exception_ptr(ptr);
    };
  ___cxa_begin_catch.sig = 'pp';

  
  var exceptionLast = 0;
  
  
  var ___cxa_end_catch = () => {
      // Clear state flag.
      _setThrew(0, 0);
      // Call destructor if one is registered then clear it.
      var info = exceptionCaught.pop();
  
      ___cxa_decrement_exception_refcount(info.excPtr);
      exceptionLast = 0; // XXX in decRef?
    };
  ___cxa_end_catch.sig = 'v';

  
  class ExceptionInfo {
      // excPtr - Thrown object pointer to wrap. Metadata pointer is calculated from it.
      constructor(excPtr) {
        this.excPtr = excPtr;
        this.ptr = excPtr - 24;
      }
  
      set_type(type) {
        HEAPU32[(((this.ptr)+(4))>>2)] = type;
      }
  
      get_type() {
        return HEAPU32[(((this.ptr)+(4))>>2)];
      }
  
      set_destructor(destructor) {
        HEAPU32[(((this.ptr)+(8))>>2)] = destructor;
      }
  
      get_destructor() {
        return HEAPU32[(((this.ptr)+(8))>>2)];
      }
  
      set_caught(caught) {
        caught = caught ? 1 : 0;
        HEAP8[(this.ptr)+(12)] = caught;
      }
  
      get_caught() {
        return HEAP8[(this.ptr)+(12)] != 0;
      }
  
      set_rethrown(rethrown) {
        rethrown = rethrown ? 1 : 0;
        HEAP8[(this.ptr)+(13)] = rethrown;
      }
  
      get_rethrown() {
        return HEAP8[(this.ptr)+(13)] != 0;
      }
  
      // Initialize native structure fields. Should be called once after allocated.
      init(type, destructor) {
        this.set_adjusted_ptr(0);
        this.set_type(type);
        this.set_destructor(destructor);
      }
  
      set_adjusted_ptr(adjustedPtr) {
        HEAPU32[(((this.ptr)+(16))>>2)] = adjustedPtr;
      }
  
      get_adjusted_ptr() {
        return HEAPU32[(((this.ptr)+(16))>>2)];
      }
    }
  
  
  var setTempRet0 = (val) => __emscripten_tempret_set(val);
  var findMatchingCatch = (args) => {
      var thrown =
        exceptionLast?.excPtr;
      if (!thrown) {
        // just pass through the null ptr
        setTempRet0(0);
        return 0;
      }
      var info = new ExceptionInfo(thrown);
      info.set_adjusted_ptr(thrown);
      var thrownType = info.get_type();
      if (!thrownType) {
        // just pass through the thrown ptr
        setTempRet0(0);
        return thrown;
      }
  
      // can_catch receives a **, add indirection
      // The different catch blocks are denoted by different types.
      // Due to inheritance, those types may not precisely match the
      // type of the thrown object. Find one which matches, and
      // return the type of the catch block which should be called.
      for (var caughtType of args) {
        if (caughtType === 0 || caughtType === thrownType) {
          // Catch all clause matched or exactly the same type is caught
          break;
        }
        var adjusted_ptr_addr = info.ptr + 16;
        if (___cxa_can_catch(caughtType, thrownType, adjusted_ptr_addr)) {
          setTempRet0(caughtType);
          return thrown;
        }
      }
      setTempRet0(thrownType);
      return thrown;
    };
  var ___cxa_find_matching_catch_2 = () => findMatchingCatch([]);
  ___cxa_find_matching_catch_2.sig = 'p';

  var ___cxa_find_matching_catch_3 = (arg0) => findMatchingCatch([arg0]);
  ___cxa_find_matching_catch_3.sig = 'pp';

  
  
  var ___cxa_rethrow = () => {
      var info = exceptionCaught.pop();
      if (!info) {
        abort('no exception to throw');
      }
      var ptr = info.excPtr;
      if (!info.get_rethrown()) {
        // Only pop if the corresponding push was through rethrow_primary_exception
        exceptionCaught.push(info);
        info.set_rethrown(true);
        info.set_caught(false);
        uncaughtExceptionCount++;
      }
      exceptionLast = new CppException(ptr);
      throw exceptionLast;
    };
  ___cxa_rethrow.sig = 'v';

  
  
  var ___cxa_throw = (ptr, type, destructor) => {
      var info = new ExceptionInfo(ptr);
      // Initialize ExceptionInfo content after it was allocated in __cxa_allocate_exception.
      info.init(type, destructor);
      exceptionLast = new CppException(ptr);
      uncaughtExceptionCount++;
      throw exceptionLast;
    };
  ___cxa_throw.sig = 'vppp';

  var ___cxa_uncaught_exceptions = () => uncaughtExceptionCount;
  ___cxa_uncaught_exceptions.sig = 'i';


  function ___lsan_ignore_object(...args
  ) {
  return wasmImports['__lsan_ignore_object'](...args);
  }
  ___lsan_ignore_object.stub = true;

  var ___memory_base = new WebAssembly.Global({'value': 'i32', 'mutable': false}, 1024);

  
  
  
  
  function pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(2, 0, 1, pthread_ptr, attr, startRoutine, arg);
  return ___pthread_create_js(pthread_ptr, attr, startRoutine, arg)
  }
  
  
  var _emscripten_has_threading_support = () => typeof SharedArrayBuffer != 'undefined';
  _emscripten_has_threading_support.sig = 'i';
  
  var ___pthread_create_js = (pthread_ptr, attr, startRoutine, arg) => {
      if (!_emscripten_has_threading_support()) {
        return 6;
      }
  
      // List of JS objects that will transfer ownership to the Worker hosting the thread
      var transferList = [];
      var error = 0;
  
      // Synchronously proxy the thread creation to main thread if possible. If we
      // need to transfer ownership of objects, then proxy asynchronously via
      // postMessage.
      if (ENVIRONMENT_IS_PTHREAD && (transferList.length === 0 || error)) {
        return pthreadCreateProxied(pthread_ptr, attr, startRoutine, arg);
      }
  
      // If on the main thread, and accessing Canvas/OffscreenCanvas failed, abort
      // with the detected error.
      if (error) return error;
  
      var threadParams = {
        startRoutine,
        pthread_ptr,
        arg,
        transferList,
      };
  
      if (ENVIRONMENT_IS_PTHREAD) {
        // The prepopulated pool of web workers that can host pthreads is stored
        // in the main JS thread. Therefore if a pthread is attempting to spawn a
        // new thread, the thread creation must be deferred to the main JS thread.
        threadParams.cmd = 'spawnThread';
        postMessage(threadParams, transferList);
        // When we defer thread creation this way, we have no way to detect thread
        // creation synchronously today, so we have to assume success and return 0.
        return 0;
      }
  
      // We are the main thread, so we have the pthread warmup pool in this
      // thread and can fire off JS thread creation directly ourselves.
      return spawnThread(threadParams);
    };
  ___pthread_create_js.sig = 'ipppp';

  var ___resumeException = (ptr) => {
      if (!exceptionLast) {
        exceptionLast = new CppException(ptr);
      }
      throw exceptionLast;
    };
  ___resumeException.sig = 'vp';

  var ___stack_high = 3678672;

  var ___stack_low = 3416528;

  var ___stack_pointer = new WebAssembly.Global({'value': 'i32', 'mutable': true}, 3678672);

  
  
  var SYSCALLS = {
  DEFAULT_POLLMASK:5,
  calculateAt(dirfd, path, allowEmpty) {
        if (PATH.isAbs(path)) {
          return path;
        }
        // relative path
        var dir;
        if (dirfd === -100) {
          dir = FS.cwd();
        } else {
          var dirstream = SYSCALLS.getStreamFromFD(dirfd);
          dir = dirstream.path;
        }
        if (path.length == 0) {
          if (!allowEmpty) {
            throw new FS.ErrnoError(44);;
          }
          return dir;
        }
        return dir + '/' + path;
      },
  writeStat(buf, stat) {
        HEAP32[((buf)>>2)] = stat.dev;
        HEAP32[(((buf)+(4))>>2)] = stat.mode;
        HEAPU32[(((buf)+(8))>>2)] = stat.nlink;
        HEAP32[(((buf)+(12))>>2)] = stat.uid;
        HEAP32[(((buf)+(16))>>2)] = stat.gid;
        HEAP32[(((buf)+(20))>>2)] = stat.rdev;
        HEAP64[(((buf)+(24))>>3)] = BigInt(stat.size);
        HEAP32[(((buf)+(32))>>2)] = 4096;
        HEAP32[(((buf)+(36))>>2)] = stat.blocks;
        var atime = stat.atime.getTime();
        var mtime = stat.mtime.getTime();
        var ctime = stat.ctime.getTime();
        HEAP64[(((buf)+(40))>>3)] = BigInt(Math.floor(atime / 1000));
        HEAPU32[(((buf)+(48))>>2)] = (atime % 1000) * 1000 * 1000;
        HEAP64[(((buf)+(56))>>3)] = BigInt(Math.floor(mtime / 1000));
        HEAPU32[(((buf)+(64))>>2)] = (mtime % 1000) * 1000 * 1000;
        HEAP64[(((buf)+(72))>>3)] = BigInt(Math.floor(ctime / 1000));
        HEAPU32[(((buf)+(80))>>2)] = (ctime % 1000) * 1000 * 1000;
        HEAP64[(((buf)+(88))>>3)] = BigInt(stat.ino);
        return 0;
      },
  writeStatFs(buf, stats) {
        HEAP32[(((buf)+(4))>>2)] = stats.bsize;
        HEAP32[(((buf)+(40))>>2)] = stats.bsize;
        HEAP32[(((buf)+(8))>>2)] = stats.blocks;
        HEAP32[(((buf)+(12))>>2)] = stats.bfree;
        HEAP32[(((buf)+(16))>>2)] = stats.bavail;
        HEAP32[(((buf)+(20))>>2)] = stats.files;
        HEAP32[(((buf)+(24))>>2)] = stats.ffree;
        HEAP32[(((buf)+(28))>>2)] = stats.fsid;
        HEAP32[(((buf)+(44))>>2)] = stats.flags;  // ST_NOSUID
        HEAP32[(((buf)+(36))>>2)] = stats.namelen;
      },
  doMsync(addr, stream, len, flags, offset) {
        if (!FS.isFile(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        if (flags & 2) {
          // MAP_PRIVATE calls need not to be synced back to underlying fs
          return 0;
        }
        var buffer = HEAPU8.slice(addr, addr + len);
        FS.msync(stream, buffer, offset, len, flags);
      },
  getStreamFromFD(fd) {
        var stream = FS.getStreamChecked(fd);
        return stream;
      },
  varargs:undefined,
  getStr(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },
  };
  
  
  function ___syscall_dup(fd) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(3, 0, 1, fd);
  
  try {
  
      var old = SYSCALLS.getStreamFromFD(fd);
      return FS.dupStream(old).fd;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  
  ___syscall_dup.sig = 'ii';

  
  
  function ___syscall_faccessat(dirfd, path, amode, flags) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(4, 0, 1, dirfd, path, amode, flags);
  
  try {
  
      path = SYSCALLS.getStr(path);
      path = SYSCALLS.calculateAt(dirfd, path);
      if (amode & ~7) {
        // need a valid mode
        return -28;
      }
      var lookup = FS.lookupPath(path, { follow: true });
      var node = lookup.node;
      if (!node) {
        return -44;
      }
      var perms = '';
      if (amode & 4) perms += 'r';
      if (amode & 2) perms += 'w';
      if (amode & 1) perms += 'x';
      if (perms /* otherwise, they've just passed F_OK */ && FS.nodePermissions(node, perms)) {
        return -2;
      }
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  
  ___syscall_faccessat.sig = 'iipii';

  /** @suppress {duplicate } */
  var syscallGetVarargI = () => {
      // the `+` prepended here is necessary to convince the JSCompiler that varargs is indeed a number.
      var ret = HEAP32[((+SYSCALLS.varargs)>>2)];
      SYSCALLS.varargs += 4;
      return ret;
    };
  var syscallGetVarargP = syscallGetVarargI;
  
  
  
  
  function ___syscall_fcntl64(fd, cmd, varargs) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(5, 0, 1, fd, cmd, varargs);
  
  SYSCALLS.varargs = varargs;
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      switch (cmd) {
        case 0: {
          var arg = syscallGetVarargI();
          if (arg < 0) {
            return -28;
          }
          while (FS.streams[arg]) {
            arg++;
          }
          var newStream;
          newStream = FS.dupStream(stream, arg);
          return newStream.fd;
        }
        case 1:
        case 2:
          return 0;  // FD_CLOEXEC makes no sense for a single process.
        case 3:
          return stream.flags;
        case 4: {
          var arg = syscallGetVarargI();
          stream.flags |= arg;
          return 0;
        }
        case 12: {
          var arg = syscallGetVarargP();
          var offset = 0;
          // We're always unlocked.
          HEAP16[(((arg)+(offset))>>1)] = 2;
          return 0;
        }
        case 13:
        case 14:
          // Pretend that the locking is successful. These are process-level locks,
          // and Emscripten programs are a single process. If we supported linking a
          // filesystem between programs, we'd need to do more here.
          // See https://github.com/emscripten-core/emscripten/issues/23697
          return 0;
      }
      return -28;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  
  ___syscall_fcntl64.sig = 'iiip';

  
  
  function ___syscall_fstat64(fd, buf) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(6, 0, 1, fd, buf);
  
  try {
  
      return SYSCALLS.writeStat(buf, FS.fstat(fd));
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  
  ___syscall_fstat64.sig = 'iip';

  var INT53_MAX = 9007199254740992;
  
  var INT53_MIN = -9007199254740992;
  var bigintToI53Checked = (num) => (num < INT53_MIN || num > INT53_MAX) ? NaN : Number(num);
  
  
  function ___syscall_ftruncate64(fd, length) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(7, 0, 1, fd, length);
  
    length = bigintToI53Checked(length);
  
  
  try {
  
      if (isNaN(length)) return -61;
      FS.ftruncate(fd, length);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  ;
  
  }
  
  ___syscall_ftruncate64.sig = 'iij';

  
  
  
  function ___syscall_getcwd(buf, size) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(8, 0, 1, buf, size);
  
  try {
  
      if (size === 0) return -28;
      var cwd = FS.cwd();
      var cwdLengthInBytes = lengthBytesUTF8(cwd) + 1;
      if (size < cwdLengthInBytes) return -68;
      stringToUTF8(cwd, buf, size);
      return cwdLengthInBytes;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  
  ___syscall_getcwd.sig = 'ipp';

  
  
  
  function ___syscall_ioctl(fd, op, varargs) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(9, 0, 1, fd, op, varargs);
  
  SYSCALLS.varargs = varargs;
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      switch (op) {
        case 21509: {
          if (!stream.tty) return -59;
          return 0;
        }
        case 21505: {
          if (!stream.tty) return -59;
          if (stream.tty.ops.ioctl_tcgets) {
            var termios = stream.tty.ops.ioctl_tcgets(stream);
            var argp = syscallGetVarargP();
            HEAP32[((argp)>>2)] = termios.c_iflag || 0;
            HEAP32[(((argp)+(4))>>2)] = termios.c_oflag || 0;
            HEAP32[(((argp)+(8))>>2)] = termios.c_cflag || 0;
            HEAP32[(((argp)+(12))>>2)] = termios.c_lflag || 0;
            for (var i = 0; i < 32; i++) {
              HEAP8[(argp + i)+(17)] = termios.c_cc[i] || 0;
            }
            return 0;
          }
          return 0;
        }
        case 21510:
        case 21511:
        case 21512: {
          if (!stream.tty) return -59;
          return 0; // no-op, not actually adjusting terminal settings
        }
        case 21506:
        case 21507:
        case 21508: {
          if (!stream.tty) return -59;
          if (stream.tty.ops.ioctl_tcsets) {
            var argp = syscallGetVarargP();
            var c_iflag = HEAP32[((argp)>>2)];
            var c_oflag = HEAP32[(((argp)+(4))>>2)];
            var c_cflag = HEAP32[(((argp)+(8))>>2)];
            var c_lflag = HEAP32[(((argp)+(12))>>2)];
            var c_cc = []
            for (var i = 0; i < 32; i++) {
              c_cc.push(HEAP8[(argp + i)+(17)]);
            }
            return stream.tty.ops.ioctl_tcsets(stream.tty, op, { c_iflag, c_oflag, c_cflag, c_lflag, c_cc });
          }
          return 0; // no-op, not actually adjusting terminal settings
        }
        case 21519: {
          if (!stream.tty) return -59;
          var argp = syscallGetVarargP();
          HEAP32[((argp)>>2)] = 0;
          return 0;
        }
        case 21520: {
          if (!stream.tty) return -59;
          return -28; // not supported
        }
        case 21531: {
          var argp = syscallGetVarargP();
          return FS.ioctl(stream, op, argp);
        }
        case 21523: {
          // TODO: in theory we should write to the winsize struct that gets
          // passed in, but for now musl doesn't read anything on it
          if (!stream.tty) return -59;
          if (stream.tty.ops.ioctl_tiocgwinsz) {
            var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
            var argp = syscallGetVarargP();
            HEAP16[((argp)>>1)] = winsize[0];
            HEAP16[(((argp)+(2))>>1)] = winsize[1];
          }
          return 0;
        }
        case 21524: {
          // TODO: technically, this ioctl call should change the window size.
          // but, since emscripten doesn't have any concept of a terminal window
          // yet, we'll just silently throw it away as we do TIOCGWINSZ
          if (!stream.tty) return -59;
          return 0;
        }
        case 21515: {
          if (!stream.tty) return -59;
          return 0;
        }
        default: return -28; // not supported
      }
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  
  ___syscall_ioctl.sig = 'iiip';

  
  
  function ___syscall_lstat64(path, buf) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(10, 0, 1, path, buf);
  
  try {
  
      path = SYSCALLS.getStr(path);
      return SYSCALLS.writeStat(buf, FS.lstat(path));
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  
  ___syscall_lstat64.sig = 'ipp';

  
  
  function ___syscall_newfstatat(dirfd, path, buf, flags) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(11, 0, 1, dirfd, path, buf, flags);
  
  try {
  
      path = SYSCALLS.getStr(path);
      var nofollow = flags & 256;
      var allowEmpty = flags & 4096;
      flags = flags & (~6400);
      path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
      return SYSCALLS.writeStat(buf, nofollow ? FS.lstat(path) : FS.stat(path));
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  
  ___syscall_newfstatat.sig = 'iippi';

  
  
  
  function ___syscall_openat(dirfd, path, flags, varargs) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(12, 0, 1, dirfd, path, flags, varargs);
  
  SYSCALLS.varargs = varargs;
  try {
  
      path = SYSCALLS.getStr(path);
      path = SYSCALLS.calculateAt(dirfd, path);
      var mode = varargs ? syscallGetVarargI() : 0;
      return FS.open(path, flags, mode).fd;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  
  ___syscall_openat.sig = 'iipip';

  
  
  function ___syscall_poll(fds, nfds, timeout) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(13, 0, 1, fds, nfds, timeout);
  
  try {
  
      var nonzero = 0;
      for (var i = 0; i < nfds; i++) {
        var pollfd = fds + 8 * i;
        var fd = HEAP32[((pollfd)>>2)];
        var events = HEAP16[(((pollfd)+(4))>>1)];
        var mask = 32;
        var stream = FS.getStream(fd);
        if (stream) {
          mask = SYSCALLS.DEFAULT_POLLMASK;
          if (stream.stream_ops.poll) {
            mask = stream.stream_ops.poll(stream, -1);
          }
        }
        mask &= events | 8 | 16;
        if (mask) nonzero++;
        HEAP16[(((pollfd)+(6))>>1)] = mask;
      }
      return nonzero;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  
  ___syscall_poll.sig = 'ipii';

  
  
  function ___syscall_rmdir(path) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(14, 0, 1, path);
  
  try {
  
      path = SYSCALLS.getStr(path);
      FS.rmdir(path);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  
  ___syscall_rmdir.sig = 'ip';

  
  
  function ___syscall_stat64(path, buf) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(15, 0, 1, path, buf);
  
  try {
  
      path = SYSCALLS.getStr(path);
      return SYSCALLS.writeStat(buf, FS.stat(path));
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  
  ___syscall_stat64.sig = 'ipp';

  
  
  function ___syscall_unlinkat(dirfd, path, flags) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(16, 0, 1, dirfd, path, flags);
  
  try {
  
      path = SYSCALLS.getStr(path);
      path = SYSCALLS.calculateAt(dirfd, path);
      if (!flags) {
        FS.unlink(path);
      } else if (flags === 512) {
        FS.rmdir(path);
      } else {
        return -28;
      }
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  
  }
  
  ___syscall_unlinkat.sig = 'iipi';

  var ___table_base = new WebAssembly.Global({'value': 'i32', 'mutable': false}, 1);

  var __abort_js = () =>
      abort('');
  __abort_js.sig = 'v';

  
  
  
  var dlSetError = (msg) => {
      var sp = stackSave();
      var cmsg = stringToUTF8OnStack(msg);
      ___dl_seterr(cmsg, 0);
      stackRestore(sp);
    };
  
  
  var dlopenInternal = (handle, jsflags) => {
      // void *dlopen(const char *file, int mode);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/dlopen.html
      var filename = UTF8ToString(handle + 36);
      var flags = HEAP32[(((handle)+(4))>>2)];
      filename = PATH.normalize(filename);
      var searchpaths = [];
  
      var global = Boolean(flags & 256);
      var localScope = global ? null : {};
  
      // We don't care about RTLD_NOW and RTLD_LAZY.
      var combinedFlags = {
        global,
        nodelete:  Boolean(flags & 4096),
        loadAsync: jsflags.loadAsync,
      }
  
      if (jsflags.loadAsync) {
        return loadDynamicLibrary(filename, combinedFlags, localScope, handle);
      }
  
      try {
        return loadDynamicLibrary(filename, combinedFlags, localScope, handle)
      } catch (e) {
        dlSetError(`Could not load dynamic lib: ${filename}\n${e}`);
        return 0;
      }
    };
  var __dlopen_js = (handle) =>
      dlopenInternal(handle, { loadAsync: false });
  __dlopen_js.sig = 'pp';

  var __dlsym_catchup_js = (handle, symbolIndex) => {
      var lib = LDSO.loadedLibsByHandle[handle];
      var symDict = lib.exports;
      var symName = Object.keys(symDict)[symbolIndex];
      var sym = symDict[symName];
      var result = addFunction(sym, sym.sig);
      return result;
    };
  __dlsym_catchup_js.sig = 'ppi';

  
  
  
  var __dlsym_js = (handle, symbol, symbolIndex) => {
      // void *dlsym(void *restrict handle, const char *restrict name);
      // http://pubs.opengroup.org/onlinepubs/009695399/functions/dlsym.html
      symbol = UTF8ToString(symbol);
      var result;
      var newSymIndex;
  
      var lib = LDSO.loadedLibsByHandle[handle];
      if (!lib.exports.hasOwnProperty(symbol) || lib.exports[symbol].stub) {
        dlSetError(`Tried to lookup unknown symbol "${symbol}" in dynamic lib: ${lib.name}`)
        return 0;
      }
      newSymIndex = Object.keys(lib.exports).indexOf(symbol);
      result = lib.exports[symbol];
  
      if (typeof result == 'function') {
  
        var addr = getFunctionAddress(result);
        if (addr) {
          result = addr;
        } else {
          // Insert the function into the wasm table.  If its a direct wasm
          // function the second argument will not be needed.  If its a JS
          // function we rely on the `sig` attribute being set based on the
          // `<func>__sig` specified in library JS file.
          result = addFunction(result, result.sig);
          HEAPU32[((symbolIndex)>>2)] = newSymIndex;
        }
      }
      return result;
    };
  __dlsym_js.sig = 'pppp';

  var structRegistrations = {
  };
  
  var runDestructors = (destructors) => {
      while (destructors.length) {
        var ptr = destructors.pop();
        var del = destructors.pop();
        del(ptr);
      }
    };
  
  /** @suppress {globalThis} */
  function readPointer(pointer) {
      return this['fromWireType'](HEAPU32[((pointer)>>2)]);
    }
  
  var awaitingDependencies = {
  };
  
  var registeredTypes = {
  };
  
  var typeDependencies = {
  };
  
  var InternalError =  class InternalError extends Error { constructor(message) { super(message); this.name = 'InternalError'; }};
  var throwInternalError = (message) => { throw new InternalError(message); };
  var whenDependentTypesAreResolved = (myTypes, dependentTypes, getTypeConverters) => {
      myTypes.forEach((type) => typeDependencies[type] = dependentTypes);
  
      function onComplete(typeConverters) {
        var myTypeConverters = getTypeConverters(typeConverters);
        if (myTypeConverters.length !== myTypes.length) {
          throwInternalError('Mismatched type converter count');
        }
        for (var i = 0; i < myTypes.length; ++i) {
          registerType(myTypes[i], myTypeConverters[i]);
        }
      }
  
      var typeConverters = new Array(dependentTypes.length);
      var unregisteredTypes = [];
      var registered = 0;
      dependentTypes.forEach((dt, i) => {
        if (registeredTypes.hasOwnProperty(dt)) {
          typeConverters[i] = registeredTypes[dt];
        } else {
          unregisteredTypes.push(dt);
          if (!awaitingDependencies.hasOwnProperty(dt)) {
            awaitingDependencies[dt] = [];
          }
          awaitingDependencies[dt].push(() => {
            typeConverters[i] = registeredTypes[dt];
            ++registered;
            if (registered === unregisteredTypes.length) {
              onComplete(typeConverters);
            }
          });
        }
      });
      if (0 === unregisteredTypes.length) {
        onComplete(typeConverters);
      }
    };
  var __embind_finalize_value_object = (structType) => {
      var reg = structRegistrations[structType];
      delete structRegistrations[structType];
  
      var rawConstructor = reg.rawConstructor;
      var rawDestructor = reg.rawDestructor;
      var fieldRecords = reg.fields;
      var fieldTypes = fieldRecords.map((field) => field.getterReturnType).
                concat(fieldRecords.map((field) => field.setterArgumentType));
      whenDependentTypesAreResolved([structType], fieldTypes, (fieldTypes) => {
        var fields = {};
        fieldRecords.forEach((field, i) => {
          var fieldName = field.fieldName;
          var getterReturnType = fieldTypes[i];
          var optional = fieldTypes[i].optional;
          var getter = field.getter;
          var getterContext = field.getterContext;
          var setterArgumentType = fieldTypes[i + fieldRecords.length];
          var setter = field.setter;
          var setterContext = field.setterContext;
          fields[fieldName] = {
            read: (ptr) => getterReturnType['fromWireType'](getter(getterContext, ptr)),
            write: (ptr, o) => {
              var destructors = [];
              setter(setterContext, ptr, setterArgumentType['toWireType'](destructors, o));
              runDestructors(destructors);
            },
            optional,
          };
        });
  
        return [{
          name: reg.name,
          'fromWireType': (ptr) => {
            var rv = {};
            for (var i in fields) {
              rv[i] = fields[i].read(ptr);
            }
            rawDestructor(ptr);
            return rv;
          },
          'toWireType': (destructors, o) => {
            // todo: Here we have an opportunity for -O3 level "unsafe" optimizations:
            // assume all fields are present without checking.
            for (var fieldName in fields) {
              if (!(fieldName in o) && !fields[fieldName].optional) {
                throw new TypeError(`Missing field: "${fieldName}"`);
              }
            }
            var ptr = rawConstructor();
            for (fieldName in fields) {
              fields[fieldName].write(ptr, o[fieldName]);
            }
            if (destructors !== null) {
              destructors.push(rawDestructor, ptr);
            }
            return ptr;
          },
          argPackAdvance: GenericWireTypeSize,
          'readValueFromPointer': readPointer,
          destructorFunction: rawDestructor,
        }];
      });
    };
  __embind_finalize_value_object.sig = 'vp';

  var AsciiToString = (ptr) => {
      var str = '';
      while (1) {
        var ch = HEAPU8[ptr++];
        if (!ch) return str;
        str += String.fromCharCode(ch);
      }
    };
  
  
  
  
  var BindingError =  class BindingError extends Error { constructor(message) { super(message); this.name = 'BindingError'; }};
  var throwBindingError = (message) => { throw new BindingError(message); };
  /** @param {Object=} options */
  function sharedRegisterType(rawType, registeredInstance, options = {}) {
      var name = registeredInstance.name;
      if (!rawType) {
        throwBindingError(`type "${name}" must have a positive integer typeid pointer`);
      }
      if (registeredTypes.hasOwnProperty(rawType)) {
        if (options.ignoreDuplicateRegistrations) {
          return;
        } else {
          throwBindingError(`Cannot register type '${name}' twice`);
        }
      }
  
      registeredTypes[rawType] = registeredInstance;
      delete typeDependencies[rawType];
  
      if (awaitingDependencies.hasOwnProperty(rawType)) {
        var callbacks = awaitingDependencies[rawType];
        delete awaitingDependencies[rawType];
        callbacks.forEach((cb) => cb());
      }
    }
  /** @param {Object=} options */
  function registerType(rawType, registeredInstance, options = {}) {
      return sharedRegisterType(rawType, registeredInstance, options);
    }
  
  var getFloatHeap = (name, width) => {
      switch (width) {
        case 4:
          return HEAPF32;
        case 8:
          return HEAPF64;
        default:
          throw new TypeError(`invalid float width (${width}): ${name}`);
      }
    };
  
  var getIntegerHeap = (name, width, signed) => {
      switch (width) {
        case 1:
          return signed ? HEAP8 : HEAPU8;
        case 2:
          return signed ? HEAP16 : HEAPU16;
        case 4:
          return signed ? HEAP32 : HEAPU32;
        case 8:
          return signed ? HEAP64 : HEAPU64;
        default:
          throw new TypeError(`invalid integer width (${width}): ${name}`);
      }
    };
  
  
  var __embind_register_arithmetic_vector = (rawType, name, elementSize, isfloat, signed) => {
      name = AsciiToString(name);
      var HEAP = isfloat ?
        getFloatHeap(name, elementSize) :
        getIntegerHeap(name, elementSize, signed);
      var shift = Math.log2(elementSize);
  
      registerType(rawType, {
        name: name,
        'fromWireType': (value) => {
          var length = HEAPU32[((value)>>2)];
  
          var ptr = (value + Math.max(4, elementSize)) >> shift;
          var a = Array.from(HEAP.subarray(ptr, ptr + length));
  
          _free(value);
  
          return a;
        },
        'toWireType': (destructors, value) => {
          // We allow singular values as well
          if (typeof value == 'number') {
            value = [value];
          }
  
          if (!Array.isArray(value)) {
            throwBindingError(`Cannot pass non-array to C++ vector type ${name}`);
          }
  
          // flatten 2D arrays
          value = Array.prototype.concat.apply([], value);
  
          var length = value.length;
  
          var offset = Math.max(4, elementSize);
          var base = _malloc(offset + length * elementSize);
          var ptr = (base + offset) >> shift;
          HEAPU32[((base)>>2)] = length;
          HEAP.set(value, ptr);
  
          if (destructors !== null) {
            destructors.push(_free, base);
          }
          return base;
        },
        argPackAdvance: GenericWireTypeSize,
        'readValueFromPointer': readPointer,
        destructorFunction(ptr) {
          _free(ptr);
        }
      });
    };
  __embind_register_arithmetic_vector.sig = 'vpppii';

  
  
  var integerReadValueFromPointer = (name, width, signed) => {
      // integers are quite common, so generate very specialized functions
      switch (width) {
        case 1: return signed ?
          (pointer) => HEAP8[pointer] :
          (pointer) => HEAPU8[pointer];
        case 2: return signed ?
          (pointer) => HEAP16[((pointer)>>1)] :
          (pointer) => HEAPU16[((pointer)>>1)]
        case 4: return signed ?
          (pointer) => HEAP32[((pointer)>>2)] :
          (pointer) => HEAPU32[((pointer)>>2)]
        case 8: return signed ?
          (pointer) => HEAP64[((pointer)>>3)] :
          (pointer) => HEAPU64[((pointer)>>3)]
        default:
          throw new TypeError(`invalid integer width (${width}): ${name}`);
      }
    };
  /** @suppress {globalThis} */
  var __embind_register_bigint = (primitiveType, name, size, minRange, maxRange) => {
      name = AsciiToString(name);
  
      const isUnsignedType = minRange === 0n;
  
      let fromWireType = (value) => value;
      if (isUnsignedType) {
        // uint64 get converted to int64 in ABI, fix them up like we do for 32-bit integers.
        const bitSize = size * 8;
        fromWireType = (value) => {
          return BigInt.asUintN(bitSize, value);
        }
        maxRange = fromWireType(maxRange);
      }
  
      registerType(primitiveType, {
        name,
        'fromWireType': fromWireType,
        'toWireType': (destructors, value) => {
          if (typeof value == "number") {
            value = BigInt(value);
          }
          return value;
        },
        argPackAdvance: GenericWireTypeSize,
        'readValueFromPointer': integerReadValueFromPointer(name, size, !isUnsignedType),
        destructorFunction: null, // This type does not need a destructor
      });
    };
  __embind_register_bigint.sig = 'vpppjj';

  
  
  var GenericWireTypeSize = 8;
  /** @suppress {globalThis} */
  var __embind_register_bool = (rawType, name, trueValue, falseValue) => {
      name = AsciiToString(name);
      registerType(rawType, {
        name,
        'fromWireType': function(wt) {
          // ambiguous emscripten ABI: sometimes return values are
          // true or false, and sometimes integers (0 or 1)
          return !!wt;
        },
        'toWireType': function(destructors, o) {
          return o ? trueValue : falseValue;
        },
        argPackAdvance: GenericWireTypeSize,
        'readValueFromPointer': function(pointer) {
          return this['fromWireType'](HEAPU8[pointer]);
        },
        destructorFunction: null, // This type does not need a destructor
      });
    };
  __embind_register_bool.sig = 'vppii';

  
  
  var shallowCopyInternalPointer = (o) => {
      return {
        count: o.count,
        deleteScheduled: o.deleteScheduled,
        preservePointerOnDelete: o.preservePointerOnDelete,
        ptr: o.ptr,
        ptrType: o.ptrType,
        smartPtr: o.smartPtr,
        smartPtrType: o.smartPtrType,
      };
    };
  
  var throwInstanceAlreadyDeleted = (obj) => {
      function getInstanceTypeName(handle) {
        return handle.$$.ptrType.registeredClass.name;
      }
      throwBindingError(getInstanceTypeName(obj) + ' instance already deleted');
    };
  
  var autoDeleteLater = false;
  
  var finalizationRegistry = false;
  
  var detachFinalizer = (handle) => {};
  
  var runDestructor = ($$) => {
      if ($$.smartPtr) {
        $$.smartPtrType.rawDestructor($$.smartPtr);
      } else {
        $$.ptrType.registeredClass.rawDestructor($$.ptr);
      }
    };
  var releaseClassHandle = ($$) => {
      $$.count.value -= 1;
      var toDelete = 0 === $$.count.value;
      if (toDelete) {
        runDestructor($$);
      }
    };
  var attachFinalizer = (handle) => {
      if (autoDeleteLater) {
        attachFinalizer = (handle) => handle['deleteLater']();
        return attachFinalizer(handle);
      } else if ('undefined' === typeof FinalizationRegistry) {
        attachFinalizer = (handle) => handle;
        return handle;
      }
      // If the running environment has a FinalizationRegistry (see
      // https://github.com/tc39/proposal-weakrefs), then attach finalizers
      // for class handles.  We check for the presence of FinalizationRegistry
      // at run-time, not build-time.
      finalizationRegistry = new FinalizationRegistry((info) => {
        releaseClassHandle(info.$$);
      });
      attachFinalizer = (handle) => {
        var $$ = handle.$$;
        var hasSmartPtr = !!$$.smartPtr;
        if (hasSmartPtr) {
          // We should not call the destructor on raw pointers in case other code expects the pointee to live
          var info = { $$: $$ };
          finalizationRegistry.register(handle, info, handle);
        }
        return handle;
      };
      detachFinalizer = (handle) => finalizationRegistry.unregister(handle);
      return attachFinalizer(handle);
    };
  
  
  
  
  var deletionQueue = [];
  var flushPendingDeletes = () => {
      while (deletionQueue.length) {
        var obj = deletionQueue.pop();
        obj.$$.deleteScheduled = false;
        obj['delete']();
      }
    };
  
  var delayFunction;
  var init_ClassHandle = () => {
      let proto = ClassHandle.prototype;
  
      Object.assign(proto, {
        "isAliasOf"(other) {
          if (!(this instanceof ClassHandle)) {
            return false;
          }
          if (!(other instanceof ClassHandle)) {
            return false;
          }
  
          var leftClass = this.$$.ptrType.registeredClass;
          var left = this.$$.ptr;
          other.$$ = /** @type {Object} */ (other.$$);
          var rightClass = other.$$.ptrType.registeredClass;
          var right = other.$$.ptr;
  
          while (leftClass.baseClass) {
            left = leftClass.upcast(left);
            leftClass = leftClass.baseClass;
          }
  
          while (rightClass.baseClass) {
            right = rightClass.upcast(right);
            rightClass = rightClass.baseClass;
          }
  
          return leftClass === rightClass && left === right;
        },
  
        "clone"() {
          if (!this.$$.ptr) {
            throwInstanceAlreadyDeleted(this);
          }
  
          if (this.$$.preservePointerOnDelete) {
            this.$$.count.value += 1;
            return this;
          } else {
            var clone = attachFinalizer(Object.create(Object.getPrototypeOf(this), {
              $$: {
                value: shallowCopyInternalPointer(this.$$),
              }
            }));
  
            clone.$$.count.value += 1;
            clone.$$.deleteScheduled = false;
            return clone;
          }
        },
  
        "delete"() {
          if (!this.$$.ptr) {
            throwInstanceAlreadyDeleted(this);
          }
  
          if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
            throwBindingError('Object already scheduled for deletion');
          }
  
          detachFinalizer(this);
          releaseClassHandle(this.$$);
  
          if (!this.$$.preservePointerOnDelete) {
            this.$$.smartPtr = undefined;
            this.$$.ptr = undefined;
          }
        },
  
        "isDeleted"() {
          return !this.$$.ptr;
        },
  
        "deleteLater"() {
          if (!this.$$.ptr) {
            throwInstanceAlreadyDeleted(this);
          }
          if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
            throwBindingError('Object already scheduled for deletion');
          }
          deletionQueue.push(this);
          if (deletionQueue.length === 1 && delayFunction) {
            delayFunction(flushPendingDeletes);
          }
          this.$$.deleteScheduled = true;
          return this;
        },
      });
  
      // Support `using ...` from https://github.com/tc39/proposal-explicit-resource-management.
      const symbolDispose = Symbol.dispose;
      if (symbolDispose) {
        proto[symbolDispose] = proto['delete'];
      }
    };
  /** @constructor */
  function ClassHandle() {
    }
  
  var createNamedFunction = (name, func) => Object.defineProperty(func, 'name', { value: name });
  
  var registeredPointers = {
  };
  
  var ensureOverloadTable = (proto, methodName, humanName) => {
      if (undefined === proto[methodName].overloadTable) {
        var prevFunc = proto[methodName];
        // Inject an overload resolver function that routes to the appropriate overload based on the number of arguments.
        proto[methodName] = function(...args) {
          // TODO This check can be removed in -O3 level "unsafe" optimizations.
          if (!proto[methodName].overloadTable.hasOwnProperty(args.length)) {
            throwBindingError(`Function '${humanName}' called with an invalid number of arguments (${args.length}) - expects one of (${proto[methodName].overloadTable})!`);
          }
          return proto[methodName].overloadTable[args.length].apply(this, args);
        };
        // Move the previous function into the overload table.
        proto[methodName].overloadTable = [];
        proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
      }
    };
  
  /** @param {number=} numArguments */
  var exposePublicSymbol = (name, value, numArguments) => {
      if (Module.hasOwnProperty(name)) {
        if (undefined === numArguments || (undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments])) {
          throwBindingError(`Cannot register public name '${name}' twice`);
        }
  
        // We are exposing a function with the same name as an existing function. Create an overload table and a function selector
        // that routes between the two.
        ensureOverloadTable(Module, name, name);
        if (Module[name].overloadTable.hasOwnProperty(numArguments)) {
          throwBindingError(`Cannot register multiple overloads of a function with the same number of arguments (${numArguments})!`);
        }
        // Add the new function into the overload table.
        Module[name].overloadTable[numArguments] = value;
      } else {
        Module[name] = value;
        Module[name].argCount = numArguments;
      }
    };
  
  var char_0 = 48;
  
  var char_9 = 57;
  var makeLegalFunctionName = (name) => {
      name = name.replace(/[^a-zA-Z0-9_]/g, '$');
      var f = name.charCodeAt(0);
      if (f >= char_0 && f <= char_9) {
        return `_${name}`;
      }
      return name;
    };
  
  
  /** @constructor */
  function RegisteredClass(name,
                               constructor,
                               instancePrototype,
                               rawDestructor,
                               baseClass,
                               getActualType,
                               upcast,
                               downcast) {
      this.name = name;
      this.constructor = constructor;
      this.instancePrototype = instancePrototype;
      this.rawDestructor = rawDestructor;
      this.baseClass = baseClass;
      this.getActualType = getActualType;
      this.upcast = upcast;
      this.downcast = downcast;
      this.pureVirtualFunctions = [];
    }
  
  
  var upcastPointer = (ptr, ptrClass, desiredClass) => {
      while (ptrClass !== desiredClass) {
        if (!ptrClass.upcast) {
          throwBindingError(`Expected null or instance of ${desiredClass.name}, got an instance of ${ptrClass.name}`);
        }
        ptr = ptrClass.upcast(ptr);
        ptrClass = ptrClass.baseClass;
      }
      return ptr;
    };
  
  var embindRepr = (v) => {
      if (v === null) {
          return 'null';
      }
      var t = typeof v;
      if (t === 'object' || t === 'array' || t === 'function') {
          return v.toString();
      } else {
          return '' + v;
      }
    };
  /** @suppress {globalThis} */
  function constNoSmartPtrRawPointerToWireType(destructors, handle) {
      if (handle === null) {
        if (this.isReference) {
          throwBindingError(`null is not a valid ${this.name}`);
        }
        return 0;
      }
  
      if (!handle.$$) {
        throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
      }
      if (!handle.$$.ptr) {
        throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
      return ptr;
    }
  
  
  /** @suppress {globalThis} */
  function genericPointerToWireType(destructors, handle) {
      var ptr;
      if (handle === null) {
        if (this.isReference) {
          throwBindingError(`null is not a valid ${this.name}`);
        }
  
        if (this.isSmartPointer) {
          ptr = this.rawConstructor();
          if (destructors !== null) {
            destructors.push(this.rawDestructor, ptr);
          }
          return ptr;
        } else {
          return 0;
        }
      }
  
      if (!handle || !handle.$$) {
        throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
      }
      if (!handle.$$.ptr) {
        throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
      }
      if (!this.isConst && handle.$$.ptrType.isConst) {
        throwBindingError(`Cannot convert argument of type ${(handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name)} to parameter type ${this.name}`);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
  
      if (this.isSmartPointer) {
        // TODO: this is not strictly true
        // We could support BY_EMVAL conversions from raw pointers to smart pointers
        // because the smart pointer can hold a reference to the handle
        if (undefined === handle.$$.smartPtr) {
          throwBindingError('Passing raw pointer to smart pointer is illegal');
        }
  
        switch (this.sharingPolicy) {
          case 0: // NONE
            // no upcasting
            if (handle.$$.smartPtrType === this) {
              ptr = handle.$$.smartPtr;
            } else {
              throwBindingError(`Cannot convert argument of type ${(handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name)} to parameter type ${this.name}`);
            }
            break;
  
          case 1: // INTRUSIVE
            ptr = handle.$$.smartPtr;
            break;
  
          case 2: // BY_EMVAL
            if (handle.$$.smartPtrType === this) {
              ptr = handle.$$.smartPtr;
            } else {
              var clonedHandle = handle['clone']();
              ptr = this.rawShare(
                ptr,
                Emval.toHandle(() => clonedHandle['delete']())
              );
              if (destructors !== null) {
                destructors.push(this.rawDestructor, ptr);
              }
            }
            break;
  
          default:
            throwBindingError('Unsupporting sharing policy');
        }
      }
      return ptr;
    }
  
  
  
  /** @suppress {globalThis} */
  function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
      if (handle === null) {
        if (this.isReference) {
          throwBindingError(`null is not a valid ${this.name}`);
        }
        return 0;
      }
  
      if (!handle.$$) {
        throwBindingError(`Cannot pass "${embindRepr(handle)}" as a ${this.name}`);
      }
      if (!handle.$$.ptr) {
        throwBindingError(`Cannot pass deleted object as a pointer of type ${this.name}`);
      }
      if (handle.$$.ptrType.isConst) {
        throwBindingError(`Cannot convert argument of type ${handle.$$.ptrType.name} to parameter type ${this.name}`);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
      return ptr;
    }
  
  
  
  var downcastPointer = (ptr, ptrClass, desiredClass) => {
      if (ptrClass === desiredClass) {
        return ptr;
      }
      if (undefined === desiredClass.baseClass) {
        return null; // no conversion
      }
  
      var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
      if (rv === null) {
        return null;
      }
      return desiredClass.downcast(rv);
    };
  
  
  var registeredInstances = {
  };
  
  var getBasestPointer = (class_, ptr) => {
      if (ptr === undefined) {
          throwBindingError('ptr should not be undefined');
      }
      while (class_.baseClass) {
          ptr = class_.upcast(ptr);
          class_ = class_.baseClass;
      }
      return ptr;
    };
  var getInheritedInstance = (class_, ptr) => {
      ptr = getBasestPointer(class_, ptr);
      return registeredInstances[ptr];
    };
  
  
  var makeClassHandle = (prototype, record) => {
      if (!record.ptrType || !record.ptr) {
        throwInternalError('makeClassHandle requires ptr and ptrType');
      }
      var hasSmartPtrType = !!record.smartPtrType;
      var hasSmartPtr = !!record.smartPtr;
      if (hasSmartPtrType !== hasSmartPtr) {
        throwInternalError('Both smartPtrType and smartPtr must be specified');
      }
      record.count = { value: 1 };
      return attachFinalizer(Object.create(prototype, {
        $$: {
          value: record,
          writable: true,
        },
      }));
    };
  /** @suppress {globalThis} */
  function RegisteredPointer_fromWireType(ptr) {
      // ptr is a raw pointer (or a raw smartpointer)
  
      // rawPointer is a maybe-null raw pointer
      var rawPointer = this.getPointee(ptr);
      if (!rawPointer) {
        this.destructor(ptr);
        return null;
      }
  
      var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
      if (undefined !== registeredInstance) {
        // JS object has been neutered, time to repopulate it
        if (0 === registeredInstance.$$.count.value) {
          registeredInstance.$$.ptr = rawPointer;
          registeredInstance.$$.smartPtr = ptr;
          return registeredInstance['clone']();
        } else {
          // else, just increment reference count on existing object
          // it already has a reference to the smart pointer
          var rv = registeredInstance['clone']();
          this.destructor(ptr);
          return rv;
        }
      }
  
      function makeDefaultHandle() {
        if (this.isSmartPointer) {
          return makeClassHandle(this.registeredClass.instancePrototype, {
            ptrType: this.pointeeType,
            ptr: rawPointer,
            smartPtrType: this,
            smartPtr: ptr,
          });
        } else {
          return makeClassHandle(this.registeredClass.instancePrototype, {
            ptrType: this,
            ptr,
          });
        }
      }
  
      var actualType = this.registeredClass.getActualType(rawPointer);
      var registeredPointerRecord = registeredPointers[actualType];
      if (!registeredPointerRecord) {
        return makeDefaultHandle.call(this);
      }
  
      var toType;
      if (this.isConst) {
        toType = registeredPointerRecord.constPointerType;
      } else {
        toType = registeredPointerRecord.pointerType;
      }
      var dp = downcastPointer(
          rawPointer,
          this.registeredClass,
          toType.registeredClass);
      if (dp === null) {
        return makeDefaultHandle.call(this);
      }
      if (this.isSmartPointer) {
        return makeClassHandle(toType.registeredClass.instancePrototype, {
          ptrType: toType,
          ptr: dp,
          smartPtrType: this,
          smartPtr: ptr,
        });
      } else {
        return makeClassHandle(toType.registeredClass.instancePrototype, {
          ptrType: toType,
          ptr: dp,
        });
      }
    }
  
  var init_RegisteredPointer = () => {
      Object.assign(RegisteredPointer.prototype, {
        getPointee(ptr) {
          if (this.rawGetPointee) {
            ptr = this.rawGetPointee(ptr);
          }
          return ptr;
        },
        destructor(ptr) {
          this.rawDestructor?.(ptr);
        },
        argPackAdvance: GenericWireTypeSize,
        'readValueFromPointer': readPointer,
        'fromWireType': RegisteredPointer_fromWireType,
      });
    };
  /** @constructor
      @param {*=} pointeeType,
      @param {*=} sharingPolicy,
      @param {*=} rawGetPointee,
      @param {*=} rawConstructor,
      @param {*=} rawShare,
      @param {*=} rawDestructor,
       */
  function RegisteredPointer(
      name,
      registeredClass,
      isReference,
      isConst,
  
      // smart pointer properties
      isSmartPointer,
      pointeeType,
      sharingPolicy,
      rawGetPointee,
      rawConstructor,
      rawShare,
      rawDestructor
    ) {
      this.name = name;
      this.registeredClass = registeredClass;
      this.isReference = isReference;
      this.isConst = isConst;
  
      // smart pointer properties
      this.isSmartPointer = isSmartPointer;
      this.pointeeType = pointeeType;
      this.sharingPolicy = sharingPolicy;
      this.rawGetPointee = rawGetPointee;
      this.rawConstructor = rawConstructor;
      this.rawShare = rawShare;
      this.rawDestructor = rawDestructor;
  
      if (!isSmartPointer && registeredClass.baseClass === undefined) {
        if (isConst) {
          this['toWireType'] = constNoSmartPtrRawPointerToWireType;
          this.destructorFunction = null;
        } else {
          this['toWireType'] = nonConstNoSmartPtrRawPointerToWireType;
          this.destructorFunction = null;
        }
      } else {
        this['toWireType'] = genericPointerToWireType;
        // Here we must leave this.destructorFunction undefined, since whether genericPointerToWireType returns
        // a pointer that needs to be freed up is runtime-dependent, and cannot be evaluated at registration time.
        // TODO: Create an alternative mechanism that allows removing the use of var destructors = []; array in
        //       craftInvokerFunction altogether.
      }
    }
  
  /** @param {number=} numArguments */
  var replacePublicSymbol = (name, value, numArguments) => {
      if (!Module.hasOwnProperty(name)) {
        throwInternalError('Replacing nonexistent public symbol');
      }
      // If there's an overload table for this symbol, replace the symbol in the overload table instead.
      if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
        Module[name].overloadTable[numArguments] = value;
      } else {
        Module[name] = value;
        Module[name].argCount = numArguments;
      }
    };
  
  
  
  var embind__requireFunction = (signature, rawFunction, isAsync = false) => {
  
      signature = AsciiToString(signature);
  
      function makeDynCaller() {
        var rtn = getWasmTableEntry(rawFunction);
        return rtn;
      }
  
      var fp = makeDynCaller();
      if (typeof fp != 'function') {
          throwBindingError(`unknown function pointer with signature ${signature}: ${rawFunction}`);
      }
      return fp;
    };
  
  
  
  class UnboundTypeError extends Error {}
  
  
  
  var getTypeName = (type) => {
      var ptr = ___getTypeName(type);
      var rv = AsciiToString(ptr);
      _free(ptr);
      return rv;
    };
  var throwUnboundTypeError = (message, types) => {
      var unboundTypes = [];
      var seen = {};
      function visit(type) {
        if (seen[type]) {
          return;
        }
        if (registeredTypes[type]) {
          return;
        }
        if (typeDependencies[type]) {
          typeDependencies[type].forEach(visit);
          return;
        }
        unboundTypes.push(type);
        seen[type] = true;
      }
      types.forEach(visit);
  
      throw new UnboundTypeError(`${message}: ` + unboundTypes.map(getTypeName).join([', ']));
    };
  
  var __embind_register_class = (rawType,
                             rawPointerType,
                             rawConstPointerType,
                             baseClassRawType,
                             getActualTypeSignature,
                             getActualType,
                             upcastSignature,
                             upcast,
                             downcastSignature,
                             downcast,
                             name,
                             destructorSignature,
                             rawDestructor) => {
      name = AsciiToString(name);
      getActualType = embind__requireFunction(getActualTypeSignature, getActualType);
      upcast &&= embind__requireFunction(upcastSignature, upcast);
      downcast &&= embind__requireFunction(downcastSignature, downcast);
      rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
      var legalFunctionName = makeLegalFunctionName(name);
  
      exposePublicSymbol(legalFunctionName, function() {
        // this code cannot run if baseClassRawType is zero
        throwUnboundTypeError(`Cannot construct ${name} due to unbound types`, [baseClassRawType]);
      });
  
      whenDependentTypesAreResolved(
        [rawType, rawPointerType, rawConstPointerType],
        baseClassRawType ? [baseClassRawType] : [],
        (base) => {
          base = base[0];
  
          var baseClass;
          var basePrototype;
          if (baseClassRawType) {
            baseClass = base.registeredClass;
            basePrototype = baseClass.instancePrototype;
          } else {
            basePrototype = ClassHandle.prototype;
          }
  
          var constructor = createNamedFunction(name, function(...args) {
            if (Object.getPrototypeOf(this) !== instancePrototype) {
              throw new BindingError(`Use 'new' to construct ${name}`);
            }
            if (undefined === registeredClass.constructor_body) {
              throw new BindingError(`${name} has no accessible constructor`);
            }
            var body = registeredClass.constructor_body[args.length];
            if (undefined === body) {
              throw new BindingError(`Tried to invoke ctor of ${name} with invalid number of parameters (${args.length}) - expected (${Object.keys(registeredClass.constructor_body).toString()}) parameters instead!`);
            }
            return body.apply(this, args);
          });
  
          var instancePrototype = Object.create(basePrototype, {
            constructor: { value: constructor },
          });
  
          constructor.prototype = instancePrototype;
  
          var registeredClass = new RegisteredClass(name,
                                                    constructor,
                                                    instancePrototype,
                                                    rawDestructor,
                                                    baseClass,
                                                    getActualType,
                                                    upcast,
                                                    downcast);
  
          if (registeredClass.baseClass) {
            // Keep track of class hierarchy. Used to allow sub-classes to inherit class functions.
            registeredClass.baseClass.__derivedClasses ??= [];
  
            registeredClass.baseClass.__derivedClasses.push(registeredClass);
          }
  
          var referenceConverter = new RegisteredPointer(name,
                                                         registeredClass,
                                                         true,
                                                         false,
                                                         false);
  
          var pointerConverter = new RegisteredPointer(name + '*',
                                                       registeredClass,
                                                       false,
                                                       false,
                                                       false);
  
          var constPointerConverter = new RegisteredPointer(name + ' const*',
                                                            registeredClass,
                                                            false,
                                                            true,
                                                            false);
  
          registeredPointers[rawType] = {
            pointerType: pointerConverter,
            constPointerType: constPointerConverter
          };
  
          replacePublicSymbol(legalFunctionName, constructor);
  
          return [referenceConverter, pointerConverter, constPointerConverter];
        }
      );
    };
  __embind_register_class.sig = 'vppppppppppppp';

  
  
  
  function usesDestructorStack(argTypes) {
      // Skip return value at index 0 - it's not deleted here.
      for (var i = 1; i < argTypes.length; ++i) {
        // The type does not define a destructor function - must use dynamic stack
        if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
          return true;
        }
      }
      return false;
    }
  
  function createJsInvoker(argTypes, isClassMethodFunc, returns, isAsync) {
      var needsDestructorStack = usesDestructorStack(argTypes);
      var argCount = argTypes.length - 2;
      var argsList = [];
      var argsListWired = ['fn'];
      if (isClassMethodFunc) {
        argsListWired.push('thisWired');
      }
      for (var i = 0; i < argCount; ++i) {
        argsList.push(`arg${i}`)
        argsListWired.push(`arg${i}Wired`)
      }
      argsList = argsList.join(',')
      argsListWired = argsListWired.join(',')
  
      var invokerFnBody = `return function (${argsList}) {\n`;
  
      if (needsDestructorStack) {
        invokerFnBody += "var destructors = [];\n";
      }
  
      var dtorStack = needsDestructorStack ? "destructors" : "null";
      var args1 = ["humanName", "throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"];
  
      if (isClassMethodFunc) {
        invokerFnBody += `var thisWired = classParam['toWireType'](${dtorStack}, this);\n`;
      }
  
      for (var i = 0; i < argCount; ++i) {
        invokerFnBody += `var arg${i}Wired = argType${i}['toWireType'](${dtorStack}, arg${i});\n`;
        args1.push(`argType${i}`);
      }
  
      invokerFnBody += (returns || isAsync ? "var rv = ":"") + `invoker(${argsListWired});\n`;
  
      var returnVal = returns ? "rv" : "";
  
      if (needsDestructorStack) {
        invokerFnBody += "runDestructors(destructors);\n";
      } else {
        for (var i = isClassMethodFunc?1:2; i < argTypes.length; ++i) { // Skip return value at index 0 - it's not deleted here. Also skip class type if not a method.
          var paramName = (i === 1 ? "thisWired" : ("arg"+(i - 2)+"Wired"));
          if (argTypes[i].destructorFunction !== null) {
            invokerFnBody += `${paramName}_dtor(${paramName});\n`;
            args1.push(`${paramName}_dtor`);
          }
        }
      }
  
      if (returns) {
        invokerFnBody += "var ret = retType['fromWireType'](rv);\n" +
                         "return ret;\n";
      } else {
      }
  
      invokerFnBody += "}\n";
  
      return [args1, invokerFnBody];
    }
  function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc, /** boolean= */ isAsync) {
      // humanName: a human-readable string name for the function to be generated.
      // argTypes: An array that contains the embind type objects for all types in the function signature.
      //    argTypes[0] is the type object for the function return value.
      //    argTypes[1] is the type object for function this object/class type, or null if not crafting an invoker for a class method.
      //    argTypes[2...] are the actual function parameters.
      // classType: The embind type object for the class to be bound, or null if this is not a method of a class.
      // cppInvokerFunc: JS Function object to the C++-side function that interops into C++ code.
      // cppTargetFunc: Function pointer (an integer to FUNCTION_TABLE) to the target C++ function the cppInvokerFunc will end up calling.
      // isAsync: Optional. If true, returns an async function. Async bindings are only supported with JSPI.
      var argCount = argTypes.length;
  
      if (argCount < 2) {
        throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
      }
  
      var isClassMethodFunc = (argTypes[1] !== null && classType !== null);
  
      // Free functions with signature "void function()" do not need an invoker that marshalls between wire types.
      // TODO: This omits argument count check - enable only at -O3 or similar.
      //    if (ENABLE_UNSAFE_OPTS && argCount == 2 && argTypes[0].name == "void" && !isClassMethodFunc) {
      //       return FUNCTION_TABLE[fn];
      //    }
  
      // Determine if we need to use a dynamic stack to store the destructors for the function parameters.
      // TODO: Remove this completely once all function invokers are being dynamically generated.
      var needsDestructorStack = usesDestructorStack(argTypes);
  
      var returns = (argTypes[0].name !== 'void');
  
      var expectedArgCount = argCount - 2;
      // Builld the arguments that will be passed into the closure around the invoker
      // function.
      var closureArgs = [humanName, throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
      for (var i = 0; i < argCount - 2; ++i) {
        closureArgs.push(argTypes[i+2]);
      }
      if (!needsDestructorStack) {
        // Skip return value at index 0 - it's not deleted here. Also skip class type if not a method.
        for (var i = isClassMethodFunc?1:2; i < argTypes.length; ++i) {
          if (argTypes[i].destructorFunction !== null) {
            closureArgs.push(argTypes[i].destructorFunction);
          }
        }
      }
  
      let [args, invokerFnBody] = createJsInvoker(argTypes, isClassMethodFunc, returns, isAsync);
      var invokerFn = new Function(...args, invokerFnBody)(...closureArgs);
      return createNamedFunction(humanName, invokerFn);
    }
  
  
  var heap32VectorToArray = (count, firstElement) => {
      var array = [];
      for (var i = 0; i < count; i++) {
        // TODO(https://github.com/emscripten-core/emscripten/issues/17310):
        // Find a way to hoist the `>> 2` or `>> 3` out of this loop.
        array.push(HEAPU32[(((firstElement)+(i * 4))>>2)]);
      }
      return array;
    };
  
  
  
  
  
  var getFunctionName = (signature) => {
      signature = signature.trim();
      const argsIndex = signature.indexOf("(");
      if (argsIndex === -1) return signature;
      return signature.slice(0, argsIndex);
    };
  var __embind_register_class_class_function = (rawClassType,
                                            methodName,
                                            argCount,
                                            rawArgTypesAddr,
                                            invokerSignature,
                                            rawInvoker,
                                            fn,
                                            isAsync,
                                            isNonnullReturn) => {
      var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      methodName = AsciiToString(methodName);
      methodName = getFunctionName(methodName);
      rawInvoker = embind__requireFunction(invokerSignature, rawInvoker, isAsync);
      whenDependentTypesAreResolved([], [rawClassType], (classType) => {
        classType = classType[0];
        var humanName = `${classType.name}.${methodName}`;
  
        function unboundTypesHandler() {
          throwUnboundTypeError(`Cannot call ${humanName} due to unbound types`, rawArgTypes);
        }
  
        if (methodName.startsWith('@@')) {
          methodName = Symbol[methodName.substring(2)];
        }
  
        var proto = classType.registeredClass.constructor;
        if (undefined === proto[methodName]) {
          // This is the first function to be registered with this name.
          unboundTypesHandler.argCount = argCount-1;
          proto[methodName] = unboundTypesHandler;
        } else {
          // There was an existing function with the same name registered. Set up
          // a function overload routing table.
          ensureOverloadTable(proto, methodName, humanName);
          proto[methodName].overloadTable[argCount-1] = unboundTypesHandler;
        }
  
        whenDependentTypesAreResolved([], rawArgTypes, (argTypes) => {
          // Replace the initial unbound-types-handler stub with the proper
          // function. If multiple overloads are registered, the function handlers
          // go into an overload table.
          var invokerArgsArray = [argTypes[0] /* return value */, null /* no class 'this'*/].concat(argTypes.slice(1) /* actual params */);
          var func = craftInvokerFunction(humanName, invokerArgsArray, null /* no class 'this'*/, rawInvoker, fn, isAsync);
          if (undefined === proto[methodName].overloadTable) {
            func.argCount = argCount-1;
            proto[methodName] = func;
          } else {
            proto[methodName].overloadTable[argCount-1] = func;
          }
  
          if (classType.registeredClass.__derivedClasses) {
            for (const derivedClass of classType.registeredClass.__derivedClasses) {
              if (!derivedClass.constructor.hasOwnProperty(methodName)) {
                // TODO: Add support for overloads
                derivedClass.constructor[methodName] = func;
              }
            }
          }
  
          return [];
        });
        return [];
      });
    };
  __embind_register_class_class_function.sig = 'vppippppii';

  
  
  
  var __embind_register_class_constructor = (
      rawClassType,
      argCount,
      rawArgTypesAddr,
      invokerSignature,
      invoker,
      rawConstructor
    ) => {
      var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      invoker = embind__requireFunction(invokerSignature, invoker);
      var args = [rawConstructor];
      var destructors = [];
  
      whenDependentTypesAreResolved([], [rawClassType], (classType) => {
        classType = classType[0];
        var humanName = `constructor ${classType.name}`;
  
        if (undefined === classType.registeredClass.constructor_body) {
          classType.registeredClass.constructor_body = [];
        }
        if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
          throw new BindingError(`Cannot register multiple constructors with identical number of parameters (${argCount-1}) for class '${classType.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        }
        classType.registeredClass.constructor_body[argCount - 1] = () => {
          throwUnboundTypeError(`Cannot construct ${classType.name} due to unbound types`, rawArgTypes);
        };
  
        whenDependentTypesAreResolved([], rawArgTypes, (argTypes) => {
          // Insert empty slot for context type (argTypes[1]).
          argTypes.splice(1, 0, null);
          classType.registeredClass.constructor_body[argCount - 1] = craftInvokerFunction(humanName, argTypes, null, invoker, rawConstructor);
          return [];
        });
        return [];
      });
    };
  __embind_register_class_constructor.sig = 'vpipppp';

  
  
  
  
  
  
  var __embind_register_class_function = (rawClassType,
                                      methodName,
                                      argCount,
                                      rawArgTypesAddr, // [ReturnType, ThisType, Args...]
                                      invokerSignature,
                                      rawInvoker,
                                      context,
                                      isPureVirtual,
                                      isAsync,
                                      isNonnullReturn) => {
      var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      methodName = AsciiToString(methodName);
      methodName = getFunctionName(methodName);
      rawInvoker = embind__requireFunction(invokerSignature, rawInvoker, isAsync);
  
      whenDependentTypesAreResolved([], [rawClassType], (classType) => {
        classType = classType[0];
        var humanName = `${classType.name}.${methodName}`;
  
        if (methodName.startsWith("@@")) {
          methodName = Symbol[methodName.substring(2)];
        }
  
        if (isPureVirtual) {
          classType.registeredClass.pureVirtualFunctions.push(methodName);
        }
  
        function unboundTypesHandler() {
          throwUnboundTypeError(`Cannot call ${humanName} due to unbound types`, rawArgTypes);
        }
  
        var proto = classType.registeredClass.instancePrototype;
        var method = proto[methodName];
        if (undefined === method || (undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2)) {
          // This is the first overload to be registered, OR we are replacing a
          // function in the base class with a function in the derived class.
          unboundTypesHandler.argCount = argCount - 2;
          unboundTypesHandler.className = classType.name;
          proto[methodName] = unboundTypesHandler;
        } else {
          // There was an existing function with the same name registered. Set up
          // a function overload routing table.
          ensureOverloadTable(proto, methodName, humanName);
          proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler;
        }
  
        whenDependentTypesAreResolved([], rawArgTypes, (argTypes) => {
          var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context, isAsync);
  
          // Replace the initial unbound-handler-stub function with the
          // appropriate member function, now that all types are resolved. If
          // multiple overloads are registered for this function, the function
          // goes into an overload table.
          if (undefined === proto[methodName].overloadTable) {
            // Set argCount in case an overload is registered later
            memberFunction.argCount = argCount - 2;
            proto[methodName] = memberFunction;
          } else {
            proto[methodName].overloadTable[argCount - 2] = memberFunction;
          }
  
          return [];
        });
        return [];
      });
    };
  __embind_register_class_function.sig = 'vppippppiii';

  
  
  
  
  
  
  
  var validateThis = (this_, classType, humanName) => {
      if (!(this_ instanceof Object)) {
        throwBindingError(`${humanName} with invalid "this": ${this_}`);
      }
      if (!(this_ instanceof classType.registeredClass.constructor)) {
        throwBindingError(`${humanName} incompatible with "this" of type ${this_.constructor.name}`);
      }
      if (!this_.$$.ptr) {
        throwBindingError(`cannot call emscripten binding method ${humanName} on deleted object`);
      }
  
      // todo: kill this
      return upcastPointer(this_.$$.ptr,
                           this_.$$.ptrType.registeredClass,
                           classType.registeredClass);
    };
  var __embind_register_class_property = (classType,
                                      fieldName,
                                      getterReturnType,
                                      getterSignature,
                                      getter,
                                      getterContext,
                                      setterArgumentType,
                                      setterSignature,
                                      setter,
                                      setterContext) => {
      fieldName = AsciiToString(fieldName);
      getter = embind__requireFunction(getterSignature, getter);
  
      whenDependentTypesAreResolved([], [classType], (classType) => {
        classType = classType[0];
        var humanName = `${classType.name}.${fieldName}`;
        var desc = {
          get() {
            throwUnboundTypeError(`Cannot access ${humanName} due to unbound types`, [getterReturnType, setterArgumentType]);
          },
          enumerable: true,
          configurable: true
        };
        if (setter) {
          desc.set = () => throwUnboundTypeError(`Cannot access ${humanName} due to unbound types`, [getterReturnType, setterArgumentType]);
        } else {
          desc.set = (v) => throwBindingError(humanName + ' is a read-only property');
        }
  
        Object.defineProperty(classType.registeredClass.instancePrototype, fieldName, desc);
  
        whenDependentTypesAreResolved(
          [],
          (setter ? [getterReturnType, setterArgumentType] : [getterReturnType]),
        (types) => {
          var getterReturnType = types[0];
          var desc = {
            get() {
              var ptr = validateThis(this, classType, humanName + ' getter');
              return getterReturnType['fromWireType'](getter(getterContext, ptr));
            },
            enumerable: true
          };
  
          if (setter) {
            setter = embind__requireFunction(setterSignature, setter);
            var setterArgumentType = types[1];
            desc.set = function(v) {
              var ptr = validateThis(this, classType, humanName + ' setter');
              var destructors = [];
              setter(setterContext, ptr, setterArgumentType['toWireType'](destructors, v));
              runDestructors(destructors);
            };
          }
  
          Object.defineProperty(classType.registeredClass.instancePrototype, fieldName, desc);
          return [];
        });
  
        return [];
      });
    };
  __embind_register_class_property.sig = 'vpppppppppp';

  
  var emval_freelist = [];
  
  var emval_handles = [0,1,,1,null,1,true,1,false,1];
  var __emval_decref = (handle) => {
      if (handle > 9 && 0 === --emval_handles[handle + 1]) {
        emval_handles[handle] = undefined;
        emval_freelist.push(handle);
      }
    };
  __emval_decref.sig = 'vp';
  
  
  
  var Emval = {
  toValue:(handle) => {
        if (!handle) {
            throwBindingError(`Cannot use deleted val. handle = ${handle}`);
        }
        return emval_handles[handle];
      },
  toHandle:(value) => {
        switch (value) {
          case undefined: return 2;
          case null: return 4;
          case true: return 6;
          case false: return 8;
          default:{
            const handle = emval_freelist.pop() || emval_handles.length;
            emval_handles[handle] = value;
            emval_handles[handle + 1] = 1;
            return handle;
          }
        }
      },
  };
  
  
  var EmValType = {
      name: 'emscripten::val',
      'fromWireType': (handle) => {
        var rv = Emval.toValue(handle);
        __emval_decref(handle);
        return rv;
      },
      'toWireType': (destructors, value) => Emval.toHandle(value),
      argPackAdvance: GenericWireTypeSize,
      'readValueFromPointer': readPointer,
      destructorFunction: null, // This type does not need a destructor
  
      // TODO: do we need a deleteObject here?  write a test where
      // emval is passed into JS via an interface
    };
  var __embind_register_emval = (rawType) => registerType(rawType, EmValType);
  __embind_register_emval.sig = 'vp';

  
  var enumReadValueFromPointer = (name, width, signed) => {
      switch (width) {
        case 1: return signed ?
          function(pointer) { return this['fromWireType'](HEAP8[pointer]) } :
          function(pointer) { return this['fromWireType'](HEAPU8[pointer]) };
        case 2: return signed ?
          function(pointer) { return this['fromWireType'](HEAP16[((pointer)>>1)]) } :
          function(pointer) { return this['fromWireType'](HEAPU16[((pointer)>>1)]) };
        case 4: return signed ?
          function(pointer) { return this['fromWireType'](HEAP32[((pointer)>>2)]) } :
          function(pointer) { return this['fromWireType'](HEAPU32[((pointer)>>2)]) };
        default:
          throw new TypeError(`invalid integer width (${width}): ${name}`);
      }
    };
  
  
  /** @suppress {globalThis} */
  var __embind_register_enum = (rawType, name, size, isSigned) => {
      name = AsciiToString(name);
  
      function ctor() {}
      ctor.values = {};
  
      registerType(rawType, {
        name,
        constructor: ctor,
        'fromWireType': function(c) {
          return this.constructor.values[c];
        },
        'toWireType': (destructors, c) => c.value,
        argPackAdvance: GenericWireTypeSize,
        'readValueFromPointer': enumReadValueFromPointer(name, size, isSigned),
        destructorFunction: null,
      });
      exposePublicSymbol(name, ctor);
    };
  __embind_register_enum.sig = 'vpppi';

  
  
  
  
  var requireRegisteredType = (rawType, humanName) => {
      var impl = registeredTypes[rawType];
      if (undefined === impl) {
        throwBindingError(`${humanName} has unknown type ${getTypeName(rawType)}`);
      }
      return impl;
    };
  var __embind_register_enum_value = (rawEnumType, name, enumValue) => {
      var enumType = requireRegisteredType(rawEnumType, 'enum');
      name = AsciiToString(name);
  
      var Enum = enumType.constructor;
  
      var Value = Object.create(enumType.constructor.prototype, {
        value: {value: enumValue},
        constructor: {value: createNamedFunction(`${enumType.name}_${name}`, function() {})},
      });
      Enum.values[enumValue] = Value;
      Enum[name] = Value;
    };
  __embind_register_enum_value.sig = 'vppi';

  var floatReadValueFromPointer = (name, width) => {
      switch (width) {
        case 4: return function(pointer) {
          return this['fromWireType'](HEAPF32[((pointer)>>2)]);
        };
        case 8: return function(pointer) {
          return this['fromWireType'](HEAPF64[((pointer)>>3)]);
        };
        default:
          throw new TypeError(`invalid float width (${width}): ${name}`);
      }
    };
  
  
  var __embind_register_float = (rawType, name, size) => {
      name = AsciiToString(name);
      registerType(rawType, {
        name,
        'fromWireType': (value) => value,
        'toWireType': (destructors, value) => {
          // The VM will perform JS to Wasm value conversion, according to the spec:
          // https://www.w3.org/TR/wasm-js-api-1/#towebassemblyvalue
          return value;
        },
        argPackAdvance: GenericWireTypeSize,
        'readValueFromPointer': floatReadValueFromPointer(name, size),
        destructorFunction: null, // This type does not need a destructor
      });
    };
  __embind_register_float.sig = 'vppp';

  
  
  
  
  
  
  
  
  var __embind_register_function = (name, argCount, rawArgTypesAddr, signature, rawInvoker, fn, isAsync, isNonnullReturn) => {
      var argTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      name = AsciiToString(name);
      name = getFunctionName(name);
  
      rawInvoker = embind__requireFunction(signature, rawInvoker, isAsync);
  
      exposePublicSymbol(name, function() {
        throwUnboundTypeError(`Cannot call ${name} due to unbound types`, argTypes);
      }, argCount - 1);
  
      whenDependentTypesAreResolved([], argTypes, (argTypes) => {
        var invokerArgsArray = [argTypes[0] /* return value */, null /* no class 'this'*/].concat(argTypes.slice(1) /* actual params */);
        replacePublicSymbol(name, craftInvokerFunction(name, invokerArgsArray, null /* no class 'this'*/, rawInvoker, fn, isAsync), argCount - 1);
        return [];
      });
    };
  __embind_register_function.sig = 'vpippppii';

  
  
  /** @suppress {globalThis} */
  var __embind_register_integer = (primitiveType, name, size, minRange, maxRange) => {
      name = AsciiToString(name);
  
      const isUnsignedType = minRange === 0;
  
      let fromWireType = (value) => value;
      if (isUnsignedType) {
        var bitshift = 32 - 8*size;
        fromWireType = (value) => (value << bitshift) >>> bitshift;
        maxRange = fromWireType(maxRange);
      }
  
      registerType(primitiveType, {
        name,
        'fromWireType': fromWireType,
        'toWireType': (destructors, value) => {
          // The VM will perform JS to Wasm value conversion, according to the spec:
          // https://www.w3.org/TR/wasm-js-api-1/#towebassemblyvalue
          return value;
        },
        argPackAdvance: GenericWireTypeSize,
        'readValueFromPointer': integerReadValueFromPointer(name, size, minRange !== 0),
        destructorFunction: null, // This type does not need a destructor
      });
    };
  __embind_register_integer.sig = 'vpppii';

  
  var __embind_register_memory_view = (rawType, dataTypeIndex, name) => {
      var typeMapping = [
        Int8Array,
        Uint8Array,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array,
        BigInt64Array,
        BigUint64Array,
      ];
  
      var TA = typeMapping[dataTypeIndex];
  
      function decodeMemoryView(handle) {
        var size = HEAPU32[((handle)>>2)];
        var data = HEAPU32[(((handle)+(4))>>2)];
        return new TA(HEAP8.buffer, data, size);
      }
  
      name = AsciiToString(name);
      registerType(rawType, {
        name,
        'fromWireType': decodeMemoryView,
        argPackAdvance: GenericWireTypeSize,
        'readValueFromPointer': decodeMemoryView,
      }, {
        ignoreDuplicateRegistrations: true,
      });
    };
  __embind_register_memory_view.sig = 'vpip';

  
  
  
  
  
  
  
  
  var __embind_register_std_string = (rawType, name) => {
      name = AsciiToString(name);
      var stdStringIsUTF8
      = true;
  
      registerType(rawType, {
        name,
        // For some method names we use string keys here since they are part of
        // the public/external API and/or used by the runtime-generated code.
        'fromWireType'(value) {
          var length = HEAPU32[((value)>>2)];
          var payload = value + 4;
  
          var str;
          if (stdStringIsUTF8) {
            var decodeStartPtr = payload;
            // Looping here to support possible embedded '0' bytes
            for (var i = 0; i <= length; ++i) {
              var currentBytePtr = payload + i;
              if (i == length || HEAPU8[currentBytePtr] == 0) {
                var maxRead = currentBytePtr - decodeStartPtr;
                var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                if (str === undefined) {
                  str = stringSegment;
                } else {
                  str += String.fromCharCode(0);
                  str += stringSegment;
                }
                decodeStartPtr = currentBytePtr + 1;
              }
            }
          } else {
            var a = new Array(length);
            for (var i = 0; i < length; ++i) {
              a[i] = String.fromCharCode(HEAPU8[payload + i]);
            }
            str = a.join('');
          }
  
          _free(value);
  
          return str;
        },
        'toWireType'(destructors, value) {
          if (value instanceof ArrayBuffer) {
            value = new Uint8Array(value);
          }
  
          var length;
          var valueIsOfTypeString = (typeof value == 'string');
  
          // We accept `string` or array views with single byte elements
          if (!(valueIsOfTypeString || (ArrayBuffer.isView(value) && value.BYTES_PER_ELEMENT == 1))) {
            throwBindingError('Cannot pass non-string to std::string');
          }
          if (stdStringIsUTF8 && valueIsOfTypeString) {
            length = lengthBytesUTF8(value);
          } else {
            length = value.length;
          }
  
          // assumes POINTER_SIZE alignment
          var base = _malloc(4 + length + 1);
          var ptr = base + 4;
          HEAPU32[((base)>>2)] = length;
          if (valueIsOfTypeString) {
            if (stdStringIsUTF8) {
              stringToUTF8(value, ptr, length + 1);
            } else {
              for (var i = 0; i < length; ++i) {
                var charCode = value.charCodeAt(i);
                if (charCode > 255) {
                  _free(base);
                  throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
                }
                HEAPU8[ptr + i] = charCode;
              }
            }
          } else {
            HEAPU8.set(value, ptr);
          }
  
          if (destructors !== null) {
            destructors.push(_free, base);
          }
          return base;
        },
        argPackAdvance: GenericWireTypeSize,
        'readValueFromPointer': readPointer,
        destructorFunction(ptr) {
          _free(ptr);
        },
      });
    };
  __embind_register_std_string.sig = 'vpp';

  
  
  
  var UTF16Decoder = new TextDecoder('utf-16le');;
  var UTF16ToString = (ptr, maxBytesToRead) => {
      var idx = ((ptr)>>1);
      var maxIdx = idx + maxBytesToRead / 2;
      // TextDecoder needs to know the byte length in advance, it doesn't stop on
      // null terminator by itself.
      // Also, use the length info to avoid running tiny strings through
      // TextDecoder, since .subarray() allocates garbage.
      var endIdx = idx;
      // If maxBytesToRead is not passed explicitly, it will be undefined, and this
      // will always evaluate to true. This saves on code size.
      while (!(endIdx >= maxIdx) && HEAPU16[endIdx]) ++endIdx;
  
        return UTF16Decoder.decode(HEAPU16.buffer instanceof ArrayBuffer ? HEAPU16.subarray(idx, endIdx) : HEAPU16.slice(idx, endIdx));
  
    };
  
  var stringToUTF16 = (str, outPtr, maxBytesToWrite) => {
      // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
      maxBytesToWrite ??= 0x7FFFFFFF;
      if (maxBytesToWrite < 2) return 0;
      maxBytesToWrite -= 2; // Null terminator.
      var startPtr = outPtr;
      var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
      for (var i = 0; i < numCharsToWrite; ++i) {
        // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
        var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
        HEAP16[((outPtr)>>1)] = codeUnit;
        outPtr += 2;
      }
      // Null-terminate the pointer to the HEAP.
      HEAP16[((outPtr)>>1)] = 0;
      return outPtr - startPtr;
    };
  
  var lengthBytesUTF16 = (str) => str.length*2;
  
  var UTF32ToString = (ptr, maxBytesToRead) => {
      var str = '';
      // If maxBytesToRead is not passed explicitly, it will be undefined, and this
      // will always evaluate to true. This saves on code size.
      for (var i = 0; !(i >= maxBytesToRead / 4); i++) {
        var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
        if (!utf32) break;
        str += String.fromCodePoint(utf32);
      }
      return str;
    };
  
  var stringToUTF32 = (str, outPtr, maxBytesToWrite) => {
      // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
      maxBytesToWrite ??= 0x7FFFFFFF;
      if (maxBytesToWrite < 4) return 0;
      var startPtr = outPtr;
      var endPtr = startPtr + maxBytesToWrite - 4;
      for (var i = 0; i < str.length; ++i) {
        var codePoint = str.codePointAt(i);
        // Gotcha: if codePoint is over 0xFFFF, it is represented as a surrogate pair in UTF-16.
        // We need to manually skip over the second code unit for correct iteration.
        if (codePoint > 0xFFFF) {
          i++;
        }
        HEAP32[((outPtr)>>2)] = codePoint;
        outPtr += 4;
        if (outPtr + 4 > endPtr) break;
      }
      // Null-terminate the pointer to the HEAP.
      HEAP32[((outPtr)>>2)] = 0;
      return outPtr - startPtr;
    };
  
  var lengthBytesUTF32 = (str) => {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        var codePoint = str.codePointAt(i);
        // Gotcha: if codePoint is over 0xFFFF, it is represented as a surrogate pair in UTF-16.
        // We need to manually skip over the second code unit for correct iteration.
        if (codePoint > 0xFFFF) {
          i++;
        }
        len += 4;
      }
  
      return len;
    };
  var __embind_register_std_wstring = (rawType, charSize, name) => {
      name = AsciiToString(name);
      var decodeString, encodeString, readCharAt, lengthBytesUTF;
      if (charSize === 2) {
        decodeString = UTF16ToString;
        encodeString = stringToUTF16;
        lengthBytesUTF = lengthBytesUTF16;
        readCharAt = (pointer) => HEAPU16[((pointer)>>1)];
      } else if (charSize === 4) {
        decodeString = UTF32ToString;
        encodeString = stringToUTF32;
        lengthBytesUTF = lengthBytesUTF32;
        readCharAt = (pointer) => HEAPU32[((pointer)>>2)];
      }
      registerType(rawType, {
        name,
        'fromWireType': (value) => {
          // Code mostly taken from _embind_register_std_string fromWireType
          var length = HEAPU32[((value)>>2)];
          var str;
  
          var decodeStartPtr = value + 4;
          // Looping here to support possible embedded '0' bytes
          for (var i = 0; i <= length; ++i) {
            var currentBytePtr = value + 4 + i * charSize;
            if (i == length || readCharAt(currentBytePtr) == 0) {
              var maxReadBytes = currentBytePtr - decodeStartPtr;
              var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
              if (str === undefined) {
                str = stringSegment;
              } else {
                str += String.fromCharCode(0);
                str += stringSegment;
              }
              decodeStartPtr = currentBytePtr + charSize;
            }
          }
  
          _free(value);
  
          return str;
        },
        'toWireType': (destructors, value) => {
          if (!(typeof value == 'string')) {
            throwBindingError(`Cannot pass non-string to C++ string type ${name}`);
          }
  
          // assumes POINTER_SIZE alignment
          var length = lengthBytesUTF(value);
          var ptr = _malloc(4 + length + charSize);
          HEAPU32[((ptr)>>2)] = length / charSize;
  
          encodeString(value, ptr + 4, length + charSize);
  
          if (destructors !== null) {
            destructors.push(_free, ptr);
          }
          return ptr;
        },
        argPackAdvance: GenericWireTypeSize,
        'readValueFromPointer': readPointer,
        destructorFunction(ptr) {
          _free(ptr);
        }
      });
    };
  __embind_register_std_wstring.sig = 'vppp';

  
  
  var __embind_register_value_object = (
      rawType,
      name,
      constructorSignature,
      rawConstructor,
      destructorSignature,
      rawDestructor
    ) => {
      structRegistrations[rawType] = {
        name: AsciiToString(name),
        rawConstructor: embind__requireFunction(constructorSignature, rawConstructor),
        rawDestructor: embind__requireFunction(destructorSignature, rawDestructor),
        fields: [],
      };
    };
  __embind_register_value_object.sig = 'vpppppp';

  
  
  var __embind_register_value_object_field = (
      structType,
      fieldName,
      getterReturnType,
      getterSignature,
      getter,
      getterContext,
      setterArgumentType,
      setterSignature,
      setter,
      setterContext
    ) => {
      structRegistrations[structType].fields.push({
        fieldName: AsciiToString(fieldName),
        getterReturnType,
        getter: embind__requireFunction(getterSignature, getter),
        getterContext,
        setterArgumentType,
        setter: embind__requireFunction(setterSignature, setter),
        setterContext,
      });
    };
  __embind_register_value_object_field.sig = 'vpppppppppp';

  
  var __embind_register_void = (rawType, name) => {
      name = AsciiToString(name);
      registerType(rawType, {
        isVoid: true, // void return values can be optimized out sometimes
        name,
        argPackAdvance: 0,
        'fromWireType': () => undefined,
        // TODO: assert if anything else is given?
        'toWireType': (destructors, o) => undefined,
      });
    };
  __embind_register_void.sig = 'vpp';

  
  
  
  
  
  
  var __emscripten_dlopen_js = (handle, onsuccess, onerror, user_data) => {
      /** @param {Object=} e */
      function errorCallback(e) {
        var filename = UTF8ToString(handle + 36);
        dlSetError(`'Could not load dynamic lib: ${filename}\n${e}`);
        runtimeKeepalivePop();
        callUserCallback(() => getWasmTableEntry(onerror)(handle, user_data));
      }
      function successCallback() {
        runtimeKeepalivePop();
        callUserCallback(() => getWasmTableEntry(onsuccess)(handle, user_data));
      }
  
      runtimeKeepalivePush();
      var promise = dlopenInternal(handle, { loadAsync: true });
      if (promise) {
        promise.then(successCallback, errorCallback);
      } else {
        errorCallback();
      }
    };
  __emscripten_dlopen_js.sig = 'vpppp';

  
  var __emscripten_dlsync_threads = () => {
      for (const ptr of Object.keys(PThread.pthreads)) {
        const pthread_ptr = Number(ptr);
        if (!PThread.finishedThreads.has(pthread_ptr)) {
          __emscripten_proxy_dlsync(pthread_ptr);
        }
      }
    };
  __emscripten_dlsync_threads.sig = 'v';

  
  class HandleAllocator {
      allocated = [undefined];
      freelist = [];
      get(id) {
        return this.allocated[id];
      }
      has(id) {
        return this.allocated[id] !== undefined;
      }
      allocate(handle) {
        var id = this.freelist.pop() || this.allocated.length;
        this.allocated[id] = handle;
        return id;
      }
      free(id) {
        // Set the slot to `undefined` rather than using `delete` here since
        // apparently arrays with holes in them can be less efficient.
        this.allocated[id] = undefined;
        this.freelist.push(id);
      }
    }
  var promiseMap = new HandleAllocator();;
  var makePromise = () => {
      var promiseInfo = {};
      promiseInfo.promise = new Promise((resolve, reject) => {
        promiseInfo.reject = reject;
        promiseInfo.resolve = resolve;
      });
      promiseInfo.id = promiseMap.allocate(promiseInfo);
      return promiseInfo;
    };
  
  
  var __emscripten_dlsync_threads_async = (caller, callback, ctx) => {
  
      const promises = [];
      assert(Object.keys(PThread.outstandingPromises).length === 0);
  
      // This first promise resolves once the main thread has loaded all modules.
      var info = makePromise();
      promises.push(info.promise);
      __emscripten_dlsync_self_async(info.id);
  
      // We then create a sequence of promises, one per thread, that resolve once
      // each thread has performed its sync using _emscripten_proxy_dlsync.
      // Any new threads that are created after this call will automatically be
      // in sync because we call `__emscripten_dlsync_self` in
      // invokeEntryPoint before the threads entry point is called.
      for (const ptr of Object.keys(PThread.pthreads)) {
        const pthread_ptr = Number(ptr);
        if (pthread_ptr !== caller && !PThread.finishedThreads.has(pthread_ptr)) {
          info = makePromise();
          __emscripten_proxy_dlsync_async(pthread_ptr, info.id);
          PThread.outstandingPromises[pthread_ptr] = info;
          promises.push(info.promise);
        }
      }
  
      // Once all promises are resolved then we know all threads are in sync and
      // we can call the callback.
      Promise.all(promises).then(() => {
        PThread.outstandingPromises = {};
        getWasmTableEntry(callback)(ctx);
      });
    };
  __emscripten_dlsync_threads_async.sig = 'vppp';

  
  
  
  var stringToNewUTF8 = (str) => {
      var size = lengthBytesUTF8(str) + 1;
      var ret = _malloc(size);
      if (ret) stringToUTF8(str, ret, size);
      return ret;
    };
  var __emscripten_get_dynamic_libraries_js = function() {
      var size = (dynamicLibraries.length + 1) * 4;
      var libs = _malloc(size);
      var libs_ptr = libs;
      dynamicLibraries.forEach((lib) => {
        HEAPU32[((libs_ptr)>>2)] = stringToNewUTF8(lib);
        libs_ptr += 4;
      });
      HEAPU32[((libs_ptr)>>2)] = 0;
      return libs;
    };
  __emscripten_get_dynamic_libraries_js.sig = 'p';

  var __emscripten_init_main_thread_js = (tb) => {
      // Pass the thread address to the native code where they stored in wasm
      // globals which act as a form of TLS. Global constructors trying
      // to access this value will read the wrong value, but that is UB anyway.
      __emscripten_thread_init(
        tb,
        /*is_main=*/!ENVIRONMENT_IS_WORKER,
        /*is_runtime=*/1,
        /*can_block=*/!ENVIRONMENT_IS_WEB,
        /*default_stacksize=*/262144,
        /*start_profiling=*/false,
      );
      PThread.threadInitTLS();
    };
  __emscripten_init_main_thread_js.sig = 'vp';

  
  
  
  
  var __emscripten_thread_mailbox_await = (pthread_ptr) => {
      if (typeof Atomics.waitAsync === 'function') {
        // Wait on the pthread's initial self-pointer field because it is easy and
        // safe to access from sending threads that need to notify the waiting
        // thread.
        // TODO: How to make this work with wasm64?
        var wait = Atomics.waitAsync(HEAP32, ((pthread_ptr)>>2), pthread_ptr);
        wait.value.then(checkMailbox);
        var waitingAsync = pthread_ptr + 128;
        Atomics.store(HEAP32, ((waitingAsync)>>2), 1);
      }
      // If `Atomics.waitAsync` is not implemented, then we will always fall back
      // to postMessage and there is no need to do anything here.
    };
  __emscripten_thread_mailbox_await.sig = 'vp';
  
  var checkMailbox = () => {
      // Only check the mailbox if we have a live pthread runtime. We implement
      // pthread_self to return 0 if there is no live runtime.
      var pthread_ptr = _pthread_self();
      if (pthread_ptr) {
        // If we are using Atomics.waitAsync as our notification mechanism, wait
        // for a notification before processing the mailbox to avoid missing any
        // work that could otherwise arrive after we've finished processing the
        // mailbox and before we're ready for the next notification.
        __emscripten_thread_mailbox_await(pthread_ptr);
        callUserCallback(__emscripten_check_mailbox);
      }
    };
  
  var __emscripten_notify_mailbox_postmessage = (targetThread, currThreadId) => {
      if (targetThread == currThreadId) {
        setTimeout(checkMailbox);
      } else if (ENVIRONMENT_IS_PTHREAD) {
        postMessage({targetThread, cmd: 'checkMailbox'});
      } else {
        var worker = PThread.pthreads[targetThread];
        if (!worker) {
          return;
        }
        worker.postMessage({cmd: 'checkMailbox'});
      }
    };
  __emscripten_notify_mailbox_postmessage.sig = 'vpp';

  
  var proxiedJSCallArgs = [];
  
  var __emscripten_receive_on_main_thread_js = (funcIndex, emAsmAddr, callingThread, numCallArgs, args) => {
      // Sometimes we need to backproxy events to the calling thread (e.g.
      // HTML5 DOM events handlers such as
      // emscripten_set_mousemove_callback()), so keep track in a globally
      // accessible variable about the thread that initiated the proxying.
      numCallArgs /= 2;
      proxiedJSCallArgs.length = numCallArgs;
      var b = ((args)>>3);
      for (var i = 0; i < numCallArgs; i++) {
        if (HEAP64[b + 2*i]) {
          // It's a BigInt.
          proxiedJSCallArgs[i] = HEAP64[b + 2*i + 1];
        } else {
          // It's a Number.
          proxiedJSCallArgs[i] = HEAPF64[b + 2*i + 1];
        }
      }
      // Proxied JS library funcs use funcIndex and EM_ASM functions use emAsmAddr
      var func = emAsmAddr ? ASM_CONSTS[emAsmAddr] : proxiedFunctionTable[funcIndex];
      PThread.currentProxiedOperationCallerThread = callingThread;
      var rtn = func(...proxiedJSCallArgs);
      PThread.currentProxiedOperationCallerThread = 0;
      return rtn;
    };
  __emscripten_receive_on_main_thread_js.sig = 'dippip';

  var __emscripten_runtime_keepalive_clear = () => {
      noExitRuntime = false;
      runtimeKeepaliveCounter = 0;
    };
  __emscripten_runtime_keepalive_clear.sig = 'v';

  var __emscripten_thread_cleanup = (thread) => {
      // Called when a thread needs to be cleaned up so it can be reused.
      // A thread is considered reusable when it either returns from its
      // entry point, calls pthread_exit, or acts upon a cancellation.
      // Detached threads are responsible for calling this themselves,
      // otherwise pthread_join is responsible for calling this.
      if (!ENVIRONMENT_IS_PTHREAD) cleanupThread(thread);
      else postMessage({ cmd: 'cleanupThread', thread });
    };
  __emscripten_thread_cleanup.sig = 'vp';

  var __emscripten_thread_exit_joinable = (thread) => {
      // Called when a thread exits and is joinable.  We mark these threads
      // as finished, which means that are in state where are no longer actually
      // running, but remain around waiting to be joined.  In this state they
      // cannot run any more proxied work.
      if (!ENVIRONMENT_IS_PTHREAD) markAsFinished(thread);
      else postMessage({ cmd: 'markAsFinished', thread });
    };
  __emscripten_thread_exit_joinable.sig = 'vp';


  var __emscripten_thread_set_strongref = (thread) => {
      // Called when a thread needs to be strongly referenced.
      // Currently only used for:
      // - keeping the "main" thread alive in PROXY_TO_PTHREAD mode;
      // - crashed threads that needs to propagate the uncaught exception
      //   back to the main thread.
    };
  __emscripten_thread_set_strongref.sig = 'vp';

  var __emscripten_throw_longjmp = () => {
      throw new EmscriptenSjLj;
    };
  __emscripten_throw_longjmp.sig = 'v';

  
  
  var emval_returnValue = (returnType, destructorsRef, handle) => {
      var destructors = [];
      var result = returnType['toWireType'](destructors, handle);
      if (destructors.length) {
        // void, primitives and any other types w/o destructors don't need to allocate a handle
        HEAPU32[((destructorsRef)>>2)] = Emval.toHandle(destructors);
      }
      return result;
    };
  var __emval_as = (handle, returnType, destructorsRef) => {
      handle = Emval.toValue(handle);
      returnType = requireRegisteredType(returnType, 'emval::as');
      return emval_returnValue(returnType, destructorsRef, handle);
    };
  __emval_as.sig = 'dppp';

  var emval_methodCallers = [];
  
  var __emval_call = (caller, handle, destructorsRef, args) => {
      caller = emval_methodCallers[caller];
      handle = Emval.toValue(handle);
      return caller(null, handle, destructorsRef, args);
    };
  __emval_call.sig = 'dpppp';


  
  var emval_symbols = {
  };
  
  var getStringOrSymbol = (address) => {
      var symbol = emval_symbols[address];
      if (symbol === undefined) {
        return AsciiToString(address);
      }
      return symbol;
    };
  
  var emval_get_global = () => globalThis;
  var __emval_get_global = (name) => {
      if (name===0) {
        return Emval.toHandle(emval_get_global());
      } else {
        name = getStringOrSymbol(name);
        return Emval.toHandle(emval_get_global()[name]);
      }
    };
  __emval_get_global.sig = 'pp';

  var emval_addMethodCaller = (caller) => {
      var id = emval_methodCallers.length;
      emval_methodCallers.push(caller);
      return id;
    };
  
  var emval_lookupTypes = (argCount, argTypes) => {
      var a = new Array(argCount);
      for (var i = 0; i < argCount; ++i) {
        a[i] = requireRegisteredType(HEAPU32[(((argTypes)+(i*4))>>2)],
                                     `parameter ${i}`);
      }
      return a;
    };
  
  
  var __emval_get_method_caller = (argCount, argTypes, kind) => {
      var types = emval_lookupTypes(argCount, argTypes);
      var retType = types.shift();
      argCount--; // remove the shifted off return type
  
      var functionBody =
        `return function (obj, func, destructorsRef, args) {\n`;
  
      var offset = 0;
      var argsList = []; // 'obj?, arg0, arg1, arg2, ... , argN'
      if (kind === /* FUNCTION */ 0) {
        argsList.push('obj');
      }
      var params = ['retType'];
      var args = [retType];
      for (var i = 0; i < argCount; ++i) {
        argsList.push(`arg${i}`);
        params.push(`argType${i}`);
        args.push(types[i]);
        functionBody +=
          `  var arg${i} = argType${i}.readValueFromPointer(args${offset ? '+' + offset : ''});\n`;
        offset += types[i].argPackAdvance;
      }
      var invoker = kind === /* CONSTRUCTOR */ 1 ? 'new func' : 'func.call';
      functionBody +=
        `  var rv = ${invoker}(${argsList.join(', ')});\n`;
      if (!retType.isVoid) {
        params.push('emval_returnValue');
        args.push(emval_returnValue);
        functionBody +=
          '  return emval_returnValue(retType, destructorsRef, rv);\n';
      }
      functionBody +=
        "};\n";
  
      var invokerFunction = new Function(...params, functionBody)(...args);
      var functionName = `methodCaller<(${types.map(t => t.name).join(', ')}) => ${retType.name}>`;
      return emval_addMethodCaller(createNamedFunction(functionName, invokerFunction));
    };
  __emval_get_method_caller.sig = 'pipi';

  
  var __emval_get_module_property = (name) => {
      name = getStringOrSymbol(name);
      return Emval.toHandle(Module[name]);
    };
  __emval_get_module_property.sig = 'pp';

  var __emval_get_property = (handle, key) => {
      handle = Emval.toValue(handle);
      key = Emval.toValue(key);
      return Emval.toHandle(handle[key]);
    };
  __emval_get_property.sig = 'ppp';

  var __emval_incref = (handle) => {
      if (handle > 9) {
        emval_handles[handle + 1] += 1;
      }
    };
  __emval_incref.sig = 'vp';

  var __emval_instanceof = (object, constructor) => {
      object = Emval.toValue(object);
      constructor = Emval.toValue(constructor);
      return object instanceof constructor;
    };
  __emval_instanceof.sig = 'ipp';

  var __emval_is_number = (handle) => {
      handle = Emval.toValue(handle);
      return typeof handle == 'number';
    };
  __emval_is_number.sig = 'ip';

  var __emval_is_string = (handle) => {
      handle = Emval.toValue(handle);
      return typeof handle == 'string';
    };
  __emval_is_string.sig = 'ip';

  
  var __emval_new_cstring = (v) => Emval.toHandle(getStringOrSymbol(v));
  __emval_new_cstring.sig = 'pp';

  
  
  var __emval_run_destructors = (handle) => {
      var destructors = Emval.toValue(handle);
      runDestructors(destructors);
      __emval_decref(handle);
    };
  __emval_run_destructors.sig = 'vp';

  var __emval_set_property = (handle, key, value) => {
      handle = Emval.toValue(handle);
      key = Emval.toValue(key);
      value = Emval.toValue(value);
      handle[key] = value;
    };
  __emval_set_property.sig = 'vppp';

  
  var __emval_take_value = (type, arg) => {
      type = requireRegisteredType(type, '_emval_take_value');
      var v = type['readValueFromPointer'](arg);
      return Emval.toHandle(v);
    };
  __emval_take_value.sig = 'ppp';

  var __emval_typeof = (handle) => {
      handle = Emval.toValue(handle);
      return Emval.toHandle(typeof handle);
    };
  __emval_typeof.sig = 'pp';

  function __gmtime_js(time, tmPtr) {
    time = bigintToI53Checked(time);
  
  
      var date = new Date(time * 1000);
      HEAP32[((tmPtr)>>2)] = date.getUTCSeconds();
      HEAP32[(((tmPtr)+(4))>>2)] = date.getUTCMinutes();
      HEAP32[(((tmPtr)+(8))>>2)] = date.getUTCHours();
      HEAP32[(((tmPtr)+(12))>>2)] = date.getUTCDate();
      HEAP32[(((tmPtr)+(16))>>2)] = date.getUTCMonth();
      HEAP32[(((tmPtr)+(20))>>2)] = date.getUTCFullYear()-1900;
      HEAP32[(((tmPtr)+(24))>>2)] = date.getUTCDay();
      var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
      var yday = ((date.getTime() - start) / (1000 * 60 * 60 * 24))|0;
      HEAP32[(((tmPtr)+(28))>>2)] = yday;
    ;
  }
  __gmtime_js.sig = 'vjp';

  var isLeapYear = (year) => year%4 === 0 && (year%100 !== 0 || year%400 === 0);
  
  var MONTH_DAYS_LEAP_CUMULATIVE = [0,31,60,91,121,152,182,213,244,274,305,335];
  
  var MONTH_DAYS_REGULAR_CUMULATIVE = [0,31,59,90,120,151,181,212,243,273,304,334];
  var ydayFromDate = (date) => {
      var leap = isLeapYear(date.getFullYear());
      var monthDaysCumulative = (leap ? MONTH_DAYS_LEAP_CUMULATIVE : MONTH_DAYS_REGULAR_CUMULATIVE);
      var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1; // -1 since it's days since Jan 1
  
      return yday;
    };
  
  function __localtime_js(time, tmPtr) {
    time = bigintToI53Checked(time);
  
  
      var date = new Date(time*1000);
      HEAP32[((tmPtr)>>2)] = date.getSeconds();
      HEAP32[(((tmPtr)+(4))>>2)] = date.getMinutes();
      HEAP32[(((tmPtr)+(8))>>2)] = date.getHours();
      HEAP32[(((tmPtr)+(12))>>2)] = date.getDate();
      HEAP32[(((tmPtr)+(16))>>2)] = date.getMonth();
      HEAP32[(((tmPtr)+(20))>>2)] = date.getFullYear()-1900;
      HEAP32[(((tmPtr)+(24))>>2)] = date.getDay();
  
      var yday = ydayFromDate(date)|0;
      HEAP32[(((tmPtr)+(28))>>2)] = yday;
      HEAP32[(((tmPtr)+(36))>>2)] = -(date.getTimezoneOffset() * 60);
  
      // Attention: DST is in December in South, and some regions don't have DST at all.
      var start = new Date(date.getFullYear(), 0, 1);
      var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
      var winterOffset = start.getTimezoneOffset();
      var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset))|0;
      HEAP32[(((tmPtr)+(32))>>2)] = dst;
    ;
  }
  __localtime_js.sig = 'vjp';

  
  
  
  
  
  
  
  function __mmap_js(len, prot, flags, fd, offset, allocated, addr) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(17, 0, 1, len, prot, flags, fd, offset, allocated, addr);
  
    offset = bigintToI53Checked(offset);
  
  
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      var res = FS.mmap(stream, len, offset, prot, flags);
      var ptr = res.ptr;
      HEAP32[((allocated)>>2)] = res.allocated;
      HEAPU32[((addr)>>2)] = ptr;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  ;
  
  }
  
  __mmap_js.sig = 'ipiiijpp';

  
  
  
  function __munmap_js(addr, len, prot, flags, fd, offset) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(18, 0, 1, addr, len, prot, flags, fd, offset);
  
    offset = bigintToI53Checked(offset);
  
  
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      if (prot & 2) {
        SYSCALLS.doMsync(addr, stream, len, flags, offset);
      }
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return -e.errno;
  }
  ;
  
  }
  
  __munmap_js.sig = 'ippiiij';

  var __tzset_js = (timezone, daylight, std_name, dst_name) => {
      // TODO: Use (malleable) environment variables instead of system settings.
      var currentYear = new Date().getFullYear();
      var winter = new Date(currentYear, 0, 1);
      var summer = new Date(currentYear, 6, 1);
      var winterOffset = winter.getTimezoneOffset();
      var summerOffset = summer.getTimezoneOffset();
  
      // Local standard timezone offset. Local standard time is not adjusted for
      // daylight savings.  This code uses the fact that getTimezoneOffset returns
      // a greater value during Standard Time versus Daylight Saving Time (DST).
      // Thus it determines the expected output during Standard Time, and it
      // compares whether the output of the given date the same (Standard) or less
      // (DST).
      var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
  
      // timezone is specified as seconds west of UTC ("The external variable
      // `timezone` shall be set to the difference, in seconds, between
      // Coordinated Universal Time (UTC) and local standard time."), the same
      // as returned by stdTimezoneOffset.
      // See http://pubs.opengroup.org/onlinepubs/009695399/functions/tzset.html
      HEAPU32[((timezone)>>2)] = stdTimezoneOffset * 60;
  
      HEAP32[((daylight)>>2)] = Number(winterOffset != summerOffset);
  
      var extractZone = (timezoneOffset) => {
        // Why inverse sign?
        // Read here https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
        var sign = timezoneOffset >= 0 ? "-" : "+";
  
        var absOffset = Math.abs(timezoneOffset)
        var hours = String(Math.floor(absOffset / 60)).padStart(2, "0");
        var minutes = String(absOffset % 60).padStart(2, "0");
  
        return `UTC${sign}${hours}${minutes}`;
      }
  
      var winterName = extractZone(winterOffset);
      var summerName = extractZone(summerOffset);
      if (summerOffset < winterOffset) {
        // Northern hemisphere
        stringToUTF8(winterName, std_name, 17);
        stringToUTF8(summerName, dst_name, 17);
      } else {
        stringToUTF8(winterName, dst_name, 17);
        stringToUTF8(summerName, std_name, 17);
      }
    };
  __tzset_js.sig = 'vpppp';

  var _emscripten_get_now = () => performance.timeOrigin + performance.now();
  _emscripten_get_now.sig = 'd';
  
  var _emscripten_date_now = () => Date.now();
  _emscripten_date_now.sig = 'd';
  
  var nowIsMonotonic = 1;
  
  var checkWasiClock = (clock_id) => clock_id >= 0 && clock_id <= 3;
  
  function _clock_time_get(clk_id, ignored_precision, ptime) {
    ignored_precision = bigintToI53Checked(ignored_precision);
  
  
      if (!checkWasiClock(clk_id)) {
        return 28;
      }
      var now;
      // all wasi clocks but realtime are monotonic
      if (clk_id === 0) {
        now = _emscripten_date_now();
      } else if (nowIsMonotonic) {
        now = _emscripten_get_now();
      } else {
        return 52;
      }
      // "now" is in ms, and wasi times are in ns.
      var nsec = Math.round(now * 1000 * 1000);
      HEAP64[((ptime)>>3)] = BigInt(nsec);
      return 0;
    ;
  }
  _clock_time_get.sig = 'iijp';

  var _emscripten_check_blocking_allowed = () => {
    };
  _emscripten_check_blocking_allowed.sig = 'v';


  var _emscripten_err = (str) => err(UTF8ToString(str));
  _emscripten_err.sig = 'vp';

  var _emscripten_exit_with_live_runtime = () => {
      runtimeKeepalivePush();
      throw 'unwind';
    };
  _emscripten_exit_with_live_runtime.sig = 'v';

  var getHeapMax = () =>
      HEAPU8.length;
  var _emscripten_get_heap_max = () => getHeapMax();
  _emscripten_get_heap_max.sig = 'p';


  var _emscripten_num_logical_cores = () =>
      navigator['hardwareConcurrency'];
  _emscripten_num_logical_cores.sig = 'i';

  var _emscripten_promise_destroy = (id) => {
      promiseMap.free(id);
    };
  _emscripten_promise_destroy.sig = 'vp';

  
  var getPromise = (id) => promiseMap.get(id).promise;
  
  var _emscripten_promise_resolve = (id, result, value) => {
      var info = promiseMap.get(id);
      switch (result) {
        case 0:
          info.resolve(value);
          return;
        case 1:
          info.resolve(getPromise(value));
          return;
        case 2:
          info.resolve(getPromise(value));
          _emscripten_promise_destroy(value);
          return;
        case 3:
          info.reject(value);
          return;
      }
    };
  _emscripten_promise_resolve.sig = 'vpip';

  var _emscripten_resize_heap = (requestedSize) => {
      var oldSize = HEAPU8.length;
      // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
      requestedSize >>>= 0;
      return false; // malloc will report failure
    };
  _emscripten_resize_heap.sig = 'ip';

  var ENV = {
  };
  
  var getExecutableName = () => thisProgram || './this.program';
  var getEnvStrings = () => {
      if (!getEnvStrings.strings) {
        // Default values.
        // Browser language detection #8751
        var lang = ((typeof navigator == 'object' && navigator.language) || 'C').replace('-', '_') + '.UTF-8';
        var env = {
          'USER': 'web_user',
          'LOGNAME': 'web_user',
          'PATH': '/',
          'PWD': '/',
          'HOME': '/home/web_user',
          'LANG': lang,
          '_': getExecutableName()
        };
        // Apply the user-provided values, if any.
        for (var x in ENV) {
          // x is a key in ENV; if ENV[x] is undefined, that means it was
          // explicitly set to be so. We allow user code to do that to
          // force variables with default values to remain unset.
          if (ENV[x] === undefined) delete env[x];
          else env[x] = ENV[x];
        }
        var strings = [];
        for (var x in env) {
          strings.push(`${x}=${env[x]}`);
        }
        getEnvStrings.strings = strings;
      }
      return getEnvStrings.strings;
    };
  
  
  
  function _environ_get(__environ, environ_buf) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(19, 0, 1, __environ, environ_buf);
  
      var bufSize = 0;
      var envp = 0;
      for (var string of getEnvStrings()) {
        var ptr = environ_buf + bufSize;
        HEAPU32[(((__environ)+(envp))>>2)] = ptr;
        bufSize += stringToUTF8(string, ptr, Infinity) + 1;
        envp += 4;
      }
      return 0;
    
  }
  
  _environ_get.sig = 'ipp';

  
  
  
  function _environ_sizes_get(penviron_count, penviron_buf_size) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(20, 0, 1, penviron_count, penviron_buf_size);
  
      var strings = getEnvStrings();
      HEAPU32[((penviron_count)>>2)] = strings.length;
      var bufSize = 0;
      for (var string of strings) {
        bufSize += lengthBytesUTF8(string) + 1;
      }
      HEAPU32[((penviron_buf_size)>>2)] = bufSize;
      return 0;
    
  }
  
  _environ_sizes_get.sig = 'ipp';


  
  
  function _fd_close(fd) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(21, 0, 1, fd);
  
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      FS.close(stream);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  
  }
  
  _fd_close.sig = 'ii';

  
  
  function _fd_fdstat_get(fd, pbuf) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(22, 0, 1, fd, pbuf);
  
  try {
  
      var rightsBase = 0;
      var rightsInheriting = 0;
      var flags = 0;
      {
        var stream = SYSCALLS.getStreamFromFD(fd);
        // All character devices are terminals (other things a Linux system would
        // assume is a character device, like the mouse, we have special APIs for).
        var type = stream.tty ? 2 :
                   FS.isDir(stream.mode) ? 3 :
                   FS.isLink(stream.mode) ? 7 :
                   4;
      }
      HEAP8[pbuf] = type;
      HEAP16[(((pbuf)+(2))>>1)] = flags;
      HEAP64[(((pbuf)+(8))>>3)] = BigInt(rightsBase);
      HEAP64[(((pbuf)+(16))>>3)] = BigInt(rightsInheriting);
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  
  }
  
  _fd_fdstat_get.sig = 'iip';

  /** @param {number=} offset */
  var doReadv = (stream, iov, iovcnt, offset) => {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[((iov)>>2)];
        var len = HEAPU32[(((iov)+(4))>>2)];
        iov += 8;
        var curr = FS.read(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (curr < len) break; // nothing more to read
        if (typeof offset != 'undefined') {
          offset += curr;
        }
      }
      return ret;
    };
  
  
  
  function _fd_read(fd, iov, iovcnt, pnum) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(23, 0, 1, fd, iov, iovcnt, pnum);
  
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = doReadv(stream, iov, iovcnt);
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  
  }
  
  _fd_read.sig = 'iippp';

  
  
  
  function _fd_seek(fd, offset, whence, newOffset) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(24, 0, 1, fd, offset, whence, newOffset);
  
    offset = bigintToI53Checked(offset);
  
  
  try {
  
      if (isNaN(offset)) return 61;
      var stream = SYSCALLS.getStreamFromFD(fd);
      FS.llseek(stream, offset, whence);
      HEAP64[((newOffset)>>3)] = BigInt(stream.position);
      if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  ;
  
  }
  
  _fd_seek.sig = 'iijip';

  /** @param {number=} offset */
  var doWritev = (stream, iov, iovcnt, offset) => {
      var ret = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[((iov)>>2)];
        var len = HEAPU32[(((iov)+(4))>>2)];
        iov += 8;
        var curr = FS.write(stream, HEAP8, ptr, len, offset);
        if (curr < 0) return -1;
        ret += curr;
        if (curr < len) {
          // No more space to write.
          break;
        }
        if (typeof offset != 'undefined') {
          offset += curr;
        }
      }
      return ret;
    };
  
  
  
  function _fd_write(fd, iov, iovcnt, pnum) {
  if (ENVIRONMENT_IS_PTHREAD)
    return proxyToMainThread(25, 0, 1, fd, iov, iovcnt, pnum);
  
  try {
  
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = doWritev(stream, iov, iovcnt);
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  
  }
  
  _fd_write.sig = 'iippp';

  function _heif_color_conversion_options_ext_copy(...args
  ) {
  return wasmImports['heif_color_conversion_options_ext_copy'](...args);
  }
  _heif_color_conversion_options_ext_copy.stub = true;

  function _heif_color_conversion_options_ext_free(...args
  ) {
  return wasmImports['heif_color_conversion_options_ext_free'](...args);
  }
  _heif_color_conversion_options_ext_free.stub = true;

  function _heif_context_add_XMP_metadata(...args
  ) {
  return wasmImports['heif_context_add_XMP_metadata'](...args);
  }
  _heif_context_add_XMP_metadata.stub = true;

  function _heif_context_add_exif_metadata(...args
  ) {
  return wasmImports['heif_context_add_exif_metadata'](...args);
  }
  _heif_context_add_exif_metadata.stub = true;

  function _heif_encoding_options_alloc(...args
  ) {
  return wasmImports['heif_encoding_options_alloc'](...args);
  }
  _heif_encoding_options_alloc.stub = true;

  function _heif_encoding_options_free(...args
  ) {
  return wasmImports['heif_encoding_options_free'](...args);
  }
  _heif_encoding_options_free.stub = true;

  function _heif_error_success(...args
  ) {
  return wasmImports['heif_error_success'](...args);
  }
  _heif_error_success.stub = true;

  function _heif_image_get_bits_per_pixel_range(...args
  ) {
  return wasmImports['heif_image_get_bits_per_pixel_range'](...args);
  }
  _heif_image_get_bits_per_pixel_range.stub = true;

  function _heif_image_get_chroma_format(...args
  ) {
  return wasmImports['heif_image_get_chroma_format'](...args);
  }
  _heif_image_get_chroma_format.stub = true;

  function _heif_image_get_nclx_color_profile(...args
  ) {
  return wasmImports['heif_image_get_nclx_color_profile'](...args);
  }
  _heif_image_get_nclx_color_profile.stub = true;

  function _heif_image_get_plane_readonly2(...args
  ) {
  return wasmImports['heif_image_get_plane_readonly2'](...args);
  }
  _heif_image_get_plane_readonly2.stub = true;

  function _heif_image_release(...args
  ) {
  return wasmImports['heif_image_release'](...args);
  }
  _heif_image_release.stub = true;

  function _heif_nclx_color_profile_free(...args
  ) {
  return wasmImports['heif_nclx_color_profile_free'](...args);
  }
  _heif_nclx_color_profile_free.stub = true;

  function _heif_tai_clock_info_release(...args
  ) {
  return wasmImports['heif_tai_clock_info_release'](...args);
  }
  _heif_tai_clock_info_release.stub = true;

  function _heif_tai_timestamp_packet_alloc(...args
  ) {
  return wasmImports['heif_tai_timestamp_packet_alloc'](...args);
  }
  _heif_tai_timestamp_packet_alloc.stub = true;

  function _heif_tai_timestamp_packet_copy(...args
  ) {
  return wasmImports['heif_tai_timestamp_packet_copy'](...args);
  }
  _heif_tai_timestamp_packet_copy.stub = true;

  function _heif_tai_timestamp_packet_release(...args
  ) {
  return wasmImports['heif_tai_timestamp_packet_release'](...args);
  }
  _heif_tai_timestamp_packet_release.stub = true;


  function _random_get(buffer, size) {
  try {
  
      randomFill(HEAPU8.subarray(buffer, buffer + size));
      return 0;
    } catch (e) {
    if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
    return e.errno;
  }
  }
  _random_get.sig = 'ipp';








  var ptrToString = (ptr) => {
      // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
      ptr >>>= 0;
      return '0x' + ptr.toString(16).padStart(8, '0');
    };


  
  
  
  
  
  var VIPS = {
  init() {
        addOnPreRun(() => {
          // Enforce a fixed thread pool by default on web
          ENV['VIPS_MAX_THREADS'] = navigator.hardwareConcurrency>6?navigator.hardwareConcurrency:6;
  
          // We cannot safely spawn dedicated workers on the web. Therefore, to avoid any potential deadlocks, we reduce
          // the concurrency to 1. For more details, see:
          // https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread
          ENV['VIPS_CONCURRENCY'] = 1;
        });
  
        addOnPostCtor(() => {
          // SourceCustom.onRead marshaller 
          const sourceCustom = Object.getOwnPropertyDescriptor(Module['SourceCustom'].prototype, 'onRead');
          Object.defineProperty(Module['SourceCustom'].prototype, 'onRead', {
            set(cb) {
              return sourceCustom.set.call(this, (length) => Emval.toHandle(cb(length)));
            }
          });
  
          // TargetCustom.onWrite marshaller 
          const targetCustom = Object.getOwnPropertyDescriptor(Module['TargetCustom'].prototype, 'onWrite');
          Object.defineProperty(Module['TargetCustom'].prototype, 'onWrite', {
            set(cb) {
              return targetCustom.set.call(this, (data) => cb(Emval.toValue(data)));
            }
          });
        });
  
        // Add preventAutoDelete method to ClassHandle
        Object.assign(ClassHandle.prototype, {
          'preventAutoDelete'() {
            const index = deletionQueue.indexOf(this);
            if (index > -1) {
              deletionQueue.splice(index, 1);
            }
            this.$$.deleteScheduled = false;
            return this;
          }
        });
      },
  };






  var setAutoDeleteLater = (enable) => {
      autoDeleteLater = enable;
    };

  
  
  var setDelayFunction = (fn) => {
      delayFunction = fn;
      if (deletionQueue.length && delayFunction) {
        delayFunction(flushPendingDeletes);
      }
    };

  var FS_createPath = (...args) => FS.createPath(...args);



  var FS_unlink = (...args) => FS.unlink(...args);

  var FS_createLazyFile = (...args) => FS.createLazyFile(...args);

  var FS_createDevice = (...args) => FS.createDevice(...args);

  var incrementExceptionRefcount = (ptr) => ___cxa_increment_exception_refcount(ptr);

  var decrementExceptionRefcount = (ptr) => ___cxa_decrement_exception_refcount(ptr);

  
  
  
  
  
  var getExceptionMessageCommon = (ptr) => {
      var sp = stackSave();
      var type_addr_addr = stackAlloc(4);
      var message_addr_addr = stackAlloc(4);
      ___get_exception_message(ptr, type_addr_addr, message_addr_addr);
      var type_addr = HEAPU32[((type_addr_addr)>>2)];
      var message_addr = HEAPU32[((message_addr_addr)>>2)];
      var type = UTF8ToString(type_addr);
      _free(type_addr);
      var message;
      if (message_addr) {
        message = UTF8ToString(message_addr);
        _free(message_addr);
      }
      stackRestore(sp);
      return [type, message];
    };
  var getExceptionMessage = (ptr) => getExceptionMessageCommon(ptr);
PThread.init();;

      registerWasmPlugin();
      ;

  FS.createPreloadedFile = FS_createPreloadedFile;
  FS.staticInit();;

      // This error may happen quite a bit. To avoid overhead we reuse it (and
      // suffer a lack of stack info).
      MEMFS.doesNotExistError = new FS.ErrnoError(44);
      /** @suppress {checkTypes} */
      MEMFS.doesNotExistError.stack = '<generic error, no stack>';
      ;
init_ClassHandle();
init_RegisteredPointer();
VIPS.init();;
// End JS library code

// include: postlibrary.js
// This file is included after the automatically-generated JS library code
// but before the wasm module is created.

{
  // With WASM_ESM_INTEGRATION this has to happen at the top level and not
  // delayed until processModuleArgs.
  initMemory();

  // Begin ATMODULES hooks
  if (Module['preloadPlugins']) preloadPlugins = Module['preloadPlugins'];
if (Module['noExitRuntime']) noExitRuntime = Module['noExitRuntime'];
if (Module['print']) out = Module['print'];
if (Module['printErr']) err = Module['printErr'];
if (Module['dynamicLibraries']) dynamicLibraries = Module['dynamicLibraries'];
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
  // End ATMODULES hooks

  if (Module['arguments']) arguments_ = Module['arguments'];
  if (Module['thisProgram']) thisProgram = Module['thisProgram'];

}

// Begin runtime exports
  Module['addRunDependency'] = addRunDependency;
  Module['removeRunDependency'] = removeRunDependency;
  Module['ENV'] = ENV;
  Module['addFunction'] = addFunction;
  Module['FS_createPreloadedFile'] = FS_createPreloadedFile;
  Module['FS_unlink'] = FS_unlink;
  Module['FS_createPath'] = FS_createPath;
  Module['FS_createDevice'] = FS_createDevice;
  Module['FS'] = FS;
  Module['FS_createDataFile'] = FS_createDataFile;
  Module['FS_createLazyFile'] = FS_createLazyFile;
  Module['setAutoDeleteLater'] = setAutoDeleteLater;
  Module['deletionQueue'] = deletionQueue;
  Module['setDelayFunction'] = setDelayFunction;
  // End runtime exports
  // Begin JS library exports
  Module['Browser'] = Browser;
  Module['callUserCallback'] = callUserCallback;
  Module['handleException'] = handleException;
  Module['maybeExit'] = maybeExit;
  Module['_exit'] = _exit;
  Module['exitJS'] = exitJS;
  Module['_proc_exit'] = _proc_exit;
  Module['ExitStatus'] = ExitStatus;
  Module['keepRuntimeAlive'] = keepRuntimeAlive;
  Module['runtimeKeepaliveCounter'] = runtimeKeepaliveCounter;
  Module['proxyToMainThread'] = proxyToMainThread;
  Module['stackSave'] = stackSave;
  Module['stackRestore'] = stackRestore;
  Module['stackAlloc'] = stackAlloc;
  Module['PThread'] = PThread;
  Module['terminateWorker'] = terminateWorker;
  Module['cleanupThread'] = cleanupThread;
  Module['addOnPreRun'] = addOnPreRun;
  Module['onPreRuns'] = onPreRuns;
  Module['callRuntimeCallbacks'] = callRuntimeCallbacks;
  Module['markAsFinished'] = markAsFinished;
  Module['spawnThread'] = spawnThread;
  Module['exitOnMainThread'] = exitOnMainThread;
  Module['safeSetTimeout'] = safeSetTimeout;
  Module['runtimeKeepalivePush'] = runtimeKeepalivePush;
  Module['runtimeKeepalivePop'] = runtimeKeepalivePop;
  Module['warnOnce'] = warnOnce;
  Module['preloadPlugins'] = preloadPlugins;
  Module['preloadedWasm'] = preloadedWasm;
  Module['registerWasmPlugin'] = registerWasmPlugin;
  Module['GOTHandler'] = GOTHandler;
  Module['GOT'] = GOT;
  Module['currentModuleWeakSymbols'] = currentModuleWeakSymbols;
  Module['addOnPostRun'] = addOnPostRun;
  Module['onPostRuns'] = onPostRuns;
  Module['establishStackSpace'] = establishStackSpace;
  Module['getDylinkMetadata'] = getDylinkMetadata;
  Module['UTF8ArrayToString'] = UTF8ArrayToString;
  Module['UTF8Decoder'] = UTF8Decoder;
  Module['getValue'] = getValue;
  Module['invokeEntryPoint'] = invokeEntryPoint;
  Module['getWasmTableEntry'] = getWasmTableEntry;
  Module['wasmTableMirror'] = wasmTableMirror;
  Module['wasmTable'] = wasmTable;
  Module['loadDylibs'] = loadDylibs;
  Module['loadDynamicLibrary'] = loadDynamicLibrary;
  Module['LDSO'] = LDSO;
  Module['newDSO'] = newDSO;
  Module['loadWebAssemblyModule'] = loadWebAssemblyModule;
  Module['getMemory'] = getMemory;
  Module['___heap_base'] = ___heap_base;
  Module['alignMemory'] = alignMemory;
  Module['relocateExports'] = relocateExports;
  Module['updateGOT'] = updateGOT;
  Module['isInternalSym'] = isInternalSym;
  Module['addFunction'] = addFunction;
  Module['convertJsFunctionToWasm'] = convertJsFunctionToWasm;
  Module['uleb128Encode'] = uleb128Encode;
  Module['sigToWasmTypes'] = sigToWasmTypes;
  Module['generateFuncType'] = generateFuncType;
  Module['getFunctionAddress'] = getFunctionAddress;
  Module['updateTableMap'] = updateTableMap;
  Module['functionsInTableMap'] = functionsInTableMap;
  Module['getEmptyTableSlot'] = getEmptyTableSlot;
  Module['freeTableIndexes'] = freeTableIndexes;
  Module['setWasmTableEntry'] = setWasmTableEntry;
  Module['resolveGlobalSymbol'] = resolveGlobalSymbol;
  Module['isSymbolDefined'] = isSymbolDefined;
  Module['createInvokeFunction'] = createInvokeFunction;
  Module['dynCall'] = dynCall;
  Module['addOnPostCtor'] = addOnPostCtor;
  Module['onPostCtors'] = onPostCtors;
  Module['UTF8ToString'] = UTF8ToString;
  Module['mergeLibSymbols'] = mergeLibSymbols;
  Module['asyncLoad'] = asyncLoad;
  Module['findLibraryFS'] = findLibraryFS;
  Module['replaceORIGIN'] = replaceORIGIN;
  Module['PATH'] = PATH;
  Module['withStackSave'] = withStackSave;
  Module['lengthBytesUTF8'] = lengthBytesUTF8;
  Module['stringToUTF8OnStack'] = stringToUTF8OnStack;
  Module['stringToUTF8'] = stringToUTF8;
  Module['stringToUTF8Array'] = stringToUTF8Array;
  Module['FS'] = FS;
  Module['randomFill'] = randomFill;
  Module['initRandomFill'] = initRandomFill;
  Module['PATH_FS'] = PATH_FS;
  Module['TTY'] = TTY;
  Module['FS_stdin_getChar'] = FS_stdin_getChar;
  Module['FS_stdin_getChar_buffer'] = FS_stdin_getChar_buffer;
  Module['intArrayFromString'] = intArrayFromString;
  Module['MEMFS'] = MEMFS;
  Module['mmapAlloc'] = mmapAlloc;
  Module['zeroMemory'] = zeroMemory;
  Module['FS_createPreloadedFile'] = FS_createPreloadedFile;
  Module['FS_createDataFile'] = FS_createDataFile;
  Module['getUniqueRunDependency'] = getUniqueRunDependency;
  Module['FS_handledByPreloadPlugin'] = FS_handledByPreloadPlugin;
  Module['FS_modeStringToFlags'] = FS_modeStringToFlags;
  Module['FS_getMode'] = FS_getMode;
  Module['reportUndefinedSymbols'] = reportUndefinedSymbols;
  Module['noExitRuntime'] = noExitRuntime;
  Module['registerTLSInit'] = registerTLSInit;
  Module['setValue'] = setValue;
  Module['___assert_fail'] = ___assert_fail;
  Module['___call_sighandler'] = ___call_sighandler;
  Module['___cxa_begin_catch'] = ___cxa_begin_catch;
  Module['exceptionCaught'] = exceptionCaught;
  Module['uncaughtExceptionCount'] = uncaughtExceptionCount;
  Module['___cxa_end_catch'] = ___cxa_end_catch;
  Module['exceptionLast'] = exceptionLast;
  Module['___cxa_find_matching_catch_2'] = ___cxa_find_matching_catch_2;
  Module['findMatchingCatch'] = findMatchingCatch;
  Module['ExceptionInfo'] = ExceptionInfo;
  Module['setTempRet0'] = setTempRet0;
  Module['___cxa_find_matching_catch_3'] = ___cxa_find_matching_catch_3;
  Module['___cxa_rethrow'] = ___cxa_rethrow;
  Module['___cxa_throw'] = ___cxa_throw;
  Module['___cxa_uncaught_exceptions'] = ___cxa_uncaught_exceptions;
  Module['___lsan_ignore_object'] = ___lsan_ignore_object;
  Module['___memory_base'] = ___memory_base;
  Module['___pthread_create_js'] = ___pthread_create_js;
  Module['pthreadCreateProxied'] = pthreadCreateProxied;
  Module['_emscripten_has_threading_support'] = _emscripten_has_threading_support;
  Module['___resumeException'] = ___resumeException;
  Module['___stack_high'] = ___stack_high;
  Module['___stack_low'] = ___stack_low;
  Module['___stack_pointer'] = ___stack_pointer;
  Module['___syscall_dup'] = ___syscall_dup;
  Module['SYSCALLS'] = SYSCALLS;
  Module['___syscall_faccessat'] = ___syscall_faccessat;
  Module['___syscall_fcntl64'] = ___syscall_fcntl64;
  Module['syscallGetVarargP'] = syscallGetVarargP;
  Module['syscallGetVarargI'] = syscallGetVarargI;
  Module['___syscall_fstat64'] = ___syscall_fstat64;
  Module['___syscall_ftruncate64'] = ___syscall_ftruncate64;
  Module['bigintToI53Checked'] = bigintToI53Checked;
  Module['INT53_MAX'] = INT53_MAX;
  Module['INT53_MIN'] = INT53_MIN;
  Module['___syscall_getcwd'] = ___syscall_getcwd;
  Module['___syscall_ioctl'] = ___syscall_ioctl;
  Module['___syscall_lstat64'] = ___syscall_lstat64;
  Module['___syscall_newfstatat'] = ___syscall_newfstatat;
  Module['___syscall_openat'] = ___syscall_openat;
  Module['___syscall_poll'] = ___syscall_poll;
  Module['___syscall_rmdir'] = ___syscall_rmdir;
  Module['___syscall_stat64'] = ___syscall_stat64;
  Module['___syscall_unlinkat'] = ___syscall_unlinkat;
  Module['___table_base'] = ___table_base;
  Module['__abort_js'] = __abort_js;
  Module['__dlopen_js'] = __dlopen_js;
  Module['dlopenInternal'] = dlopenInternal;
  Module['dlSetError'] = dlSetError;
  Module['__dlsym_catchup_js'] = __dlsym_catchup_js;
  Module['__dlsym_js'] = __dlsym_js;
  Module['__embind_finalize_value_object'] = __embind_finalize_value_object;
  Module['structRegistrations'] = structRegistrations;
  Module['runDestructors'] = runDestructors;
  Module['readPointer'] = readPointer;
  Module['whenDependentTypesAreResolved'] = whenDependentTypesAreResolved;
  Module['awaitingDependencies'] = awaitingDependencies;
  Module['registeredTypes'] = registeredTypes;
  Module['typeDependencies'] = typeDependencies;
  Module['throwInternalError'] = throwInternalError;
  Module['InternalError'] = InternalError;
  Module['__embind_register_arithmetic_vector'] = __embind_register_arithmetic_vector;
  Module['AsciiToString'] = AsciiToString;
  Module['registerType'] = registerType;
  Module['sharedRegisterType'] = sharedRegisterType;
  Module['throwBindingError'] = throwBindingError;
  Module['BindingError'] = BindingError;
  Module['getFloatHeap'] = getFloatHeap;
  Module['getIntegerHeap'] = getIntegerHeap;
  Module['__embind_register_bigint'] = __embind_register_bigint;
  Module['integerReadValueFromPointer'] = integerReadValueFromPointer;
  Module['__embind_register_bool'] = __embind_register_bool;
  Module['GenericWireTypeSize'] = GenericWireTypeSize;
  Module['__embind_register_class'] = __embind_register_class;
  Module['ClassHandle'] = ClassHandle;
  Module['init_ClassHandle'] = init_ClassHandle;
  Module['shallowCopyInternalPointer'] = shallowCopyInternalPointer;
  Module['throwInstanceAlreadyDeleted'] = throwInstanceAlreadyDeleted;
  Module['attachFinalizer'] = attachFinalizer;
  Module['autoDeleteLater'] = autoDeleteLater;
  Module['finalizationRegistry'] = finalizationRegistry;
  Module['detachFinalizer'] = detachFinalizer;
  Module['releaseClassHandle'] = releaseClassHandle;
  Module['runDestructor'] = runDestructor;
  Module['flushPendingDeletes'] = flushPendingDeletes;
  Module['deletionQueue'] = deletionQueue;
  Module['delayFunction'] = delayFunction;
  Module['createNamedFunction'] = createNamedFunction;
  Module['registeredPointers'] = registeredPointers;
  Module['exposePublicSymbol'] = exposePublicSymbol;
  Module['ensureOverloadTable'] = ensureOverloadTable;
  Module['makeLegalFunctionName'] = makeLegalFunctionName;
  Module['char_0'] = char_0;
  Module['char_9'] = char_9;
  Module['RegisteredClass'] = RegisteredClass;
  Module['RegisteredPointer'] = RegisteredPointer;
  Module['constNoSmartPtrRawPointerToWireType'] = constNoSmartPtrRawPointerToWireType;
  Module['upcastPointer'] = upcastPointer;
  Module['embindRepr'] = embindRepr;
  Module['genericPointerToWireType'] = genericPointerToWireType;
  Module['nonConstNoSmartPtrRawPointerToWireType'] = nonConstNoSmartPtrRawPointerToWireType;
  Module['init_RegisteredPointer'] = init_RegisteredPointer;
  Module['RegisteredPointer_fromWireType'] = RegisteredPointer_fromWireType;
  Module['downcastPointer'] = downcastPointer;
  Module['getInheritedInstance'] = getInheritedInstance;
  Module['registeredInstances'] = registeredInstances;
  Module['getBasestPointer'] = getBasestPointer;
  Module['makeClassHandle'] = makeClassHandle;
  Module['replacePublicSymbol'] = replacePublicSymbol;
  Module['embind__requireFunction'] = embind__requireFunction;
  Module['throwUnboundTypeError'] = throwUnboundTypeError;
  Module['UnboundTypeError'] = UnboundTypeError;
  Module['getTypeName'] = getTypeName;
  Module['__embind_register_class_class_function'] = __embind_register_class_class_function;
  Module['craftInvokerFunction'] = craftInvokerFunction;
  Module['usesDestructorStack'] = usesDestructorStack;
  Module['createJsInvoker'] = createJsInvoker;
  Module['heap32VectorToArray'] = heap32VectorToArray;
  Module['getFunctionName'] = getFunctionName;
  Module['__embind_register_class_constructor'] = __embind_register_class_constructor;
  Module['__embind_register_class_function'] = __embind_register_class_function;
  Module['__embind_register_class_property'] = __embind_register_class_property;
  Module['validateThis'] = validateThis;
  Module['__embind_register_emval'] = __embind_register_emval;
  Module['EmValType'] = EmValType;
  Module['__emval_decref'] = __emval_decref;
  Module['emval_freelist'] = emval_freelist;
  Module['emval_handles'] = emval_handles;
  Module['Emval'] = Emval;
  Module['__embind_register_enum'] = __embind_register_enum;
  Module['enumReadValueFromPointer'] = enumReadValueFromPointer;
  Module['__embind_register_enum_value'] = __embind_register_enum_value;
  Module['requireRegisteredType'] = requireRegisteredType;
  Module['__embind_register_float'] = __embind_register_float;
  Module['floatReadValueFromPointer'] = floatReadValueFromPointer;
  Module['__embind_register_function'] = __embind_register_function;
  Module['__embind_register_integer'] = __embind_register_integer;
  Module['__embind_register_memory_view'] = __embind_register_memory_view;
  Module['__embind_register_std_string'] = __embind_register_std_string;
  Module['__embind_register_std_wstring'] = __embind_register_std_wstring;
  Module['UTF16ToString'] = UTF16ToString;
  Module['UTF16Decoder'] = UTF16Decoder;
  Module['stringToUTF16'] = stringToUTF16;
  Module['lengthBytesUTF16'] = lengthBytesUTF16;
  Module['UTF32ToString'] = UTF32ToString;
  Module['stringToUTF32'] = stringToUTF32;
  Module['lengthBytesUTF32'] = lengthBytesUTF32;
  Module['__embind_register_value_object'] = __embind_register_value_object;
  Module['__embind_register_value_object_field'] = __embind_register_value_object_field;
  Module['__embind_register_void'] = __embind_register_void;
  Module['__emscripten_dlopen_js'] = __emscripten_dlopen_js;
  Module['__emscripten_dlsync_threads'] = __emscripten_dlsync_threads;
  Module['__emscripten_dlsync_threads_async'] = __emscripten_dlsync_threads_async;
  Module['makePromise'] = makePromise;
  Module['promiseMap'] = promiseMap;
  Module['HandleAllocator'] = HandleAllocator;
  Module['__emscripten_get_dynamic_libraries_js'] = __emscripten_get_dynamic_libraries_js;
  Module['stringToNewUTF8'] = stringToNewUTF8;
  Module['__emscripten_init_main_thread_js'] = __emscripten_init_main_thread_js;
  Module['__emscripten_notify_mailbox_postmessage'] = __emscripten_notify_mailbox_postmessage;
  Module['checkMailbox'] = checkMailbox;
  Module['__emscripten_thread_mailbox_await'] = __emscripten_thread_mailbox_await;
  Module['__emscripten_receive_on_main_thread_js'] = __emscripten_receive_on_main_thread_js;
  Module['proxiedJSCallArgs'] = proxiedJSCallArgs;
  Module['__emscripten_runtime_keepalive_clear'] = __emscripten_runtime_keepalive_clear;
  Module['__emscripten_thread_cleanup'] = __emscripten_thread_cleanup;
  Module['__emscripten_thread_exit_joinable'] = __emscripten_thread_exit_joinable;
  Module['__emscripten_thread_set_strongref'] = __emscripten_thread_set_strongref;
  Module['__emscripten_throw_longjmp'] = __emscripten_throw_longjmp;
  Module['__emval_as'] = __emval_as;
  Module['emval_returnValue'] = emval_returnValue;
  Module['__emval_call'] = __emval_call;
  Module['emval_methodCallers'] = emval_methodCallers;
  Module['__emval_get_global'] = __emval_get_global;
  Module['getStringOrSymbol'] = getStringOrSymbol;
  Module['emval_symbols'] = emval_symbols;
  Module['emval_get_global'] = emval_get_global;
  Module['__emval_get_method_caller'] = __emval_get_method_caller;
  Module['emval_addMethodCaller'] = emval_addMethodCaller;
  Module['emval_lookupTypes'] = emval_lookupTypes;
  Module['__emval_get_module_property'] = __emval_get_module_property;
  Module['__emval_get_property'] = __emval_get_property;
  Module['__emval_incref'] = __emval_incref;
  Module['__emval_instanceof'] = __emval_instanceof;
  Module['__emval_is_number'] = __emval_is_number;
  Module['__emval_is_string'] = __emval_is_string;
  Module['__emval_new_cstring'] = __emval_new_cstring;
  Module['__emval_run_destructors'] = __emval_run_destructors;
  Module['__emval_set_property'] = __emval_set_property;
  Module['__emval_take_value'] = __emval_take_value;
  Module['__emval_typeof'] = __emval_typeof;
  Module['__gmtime_js'] = __gmtime_js;
  Module['__localtime_js'] = __localtime_js;
  Module['ydayFromDate'] = ydayFromDate;
  Module['isLeapYear'] = isLeapYear;
  Module['MONTH_DAYS_LEAP_CUMULATIVE'] = MONTH_DAYS_LEAP_CUMULATIVE;
  Module['MONTH_DAYS_REGULAR_CUMULATIVE'] = MONTH_DAYS_REGULAR_CUMULATIVE;
  Module['__mmap_js'] = __mmap_js;
  Module['__munmap_js'] = __munmap_js;
  Module['__tzset_js'] = __tzset_js;
  Module['_clock_time_get'] = _clock_time_get;
  Module['_emscripten_get_now'] = _emscripten_get_now;
  Module['_emscripten_date_now'] = _emscripten_date_now;
  Module['nowIsMonotonic'] = nowIsMonotonic;
  Module['checkWasiClock'] = checkWasiClock;
  Module['_emscripten_check_blocking_allowed'] = _emscripten_check_blocking_allowed;
  Module['_emscripten_err'] = _emscripten_err;
  Module['_emscripten_exit_with_live_runtime'] = _emscripten_exit_with_live_runtime;
  Module['_emscripten_get_heap_max'] = _emscripten_get_heap_max;
  Module['getHeapMax'] = getHeapMax;
  Module['_emscripten_num_logical_cores'] = _emscripten_num_logical_cores;
  Module['_emscripten_promise_destroy'] = _emscripten_promise_destroy;
  Module['_emscripten_promise_resolve'] = _emscripten_promise_resolve;
  Module['getPromise'] = getPromise;
  Module['_emscripten_resize_heap'] = _emscripten_resize_heap;
  Module['_environ_get'] = _environ_get;
  Module['getEnvStrings'] = getEnvStrings;
  Module['ENV'] = ENV;
  Module['getExecutableName'] = getExecutableName;
  Module['_environ_sizes_get'] = _environ_sizes_get;
  Module['_fd_close'] = _fd_close;
  Module['_fd_fdstat_get'] = _fd_fdstat_get;
  Module['_fd_read'] = _fd_read;
  Module['doReadv'] = doReadv;
  Module['_fd_seek'] = _fd_seek;
  Module['_fd_write'] = _fd_write;
  Module['doWritev'] = doWritev;
  Module['_heif_color_conversion_options_ext_copy'] = _heif_color_conversion_options_ext_copy;
  Module['_heif_color_conversion_options_ext_free'] = _heif_color_conversion_options_ext_free;
  Module['_heif_context_add_XMP_metadata'] = _heif_context_add_XMP_metadata;
  Module['_heif_context_add_exif_metadata'] = _heif_context_add_exif_metadata;
  Module['_heif_encoding_options_alloc'] = _heif_encoding_options_alloc;
  Module['_heif_encoding_options_free'] = _heif_encoding_options_free;
  Module['_heif_error_success'] = _heif_error_success;
  Module['_heif_image_get_bits_per_pixel_range'] = _heif_image_get_bits_per_pixel_range;
  Module['_heif_image_get_chroma_format'] = _heif_image_get_chroma_format;
  Module['_heif_image_get_nclx_color_profile'] = _heif_image_get_nclx_color_profile;
  Module['_heif_image_get_plane_readonly2'] = _heif_image_get_plane_readonly2;
  Module['_heif_image_release'] = _heif_image_release;
  Module['_heif_nclx_color_profile_free'] = _heif_nclx_color_profile_free;
  Module['_heif_tai_clock_info_release'] = _heif_tai_clock_info_release;
  Module['_heif_tai_timestamp_packet_alloc'] = _heif_tai_timestamp_packet_alloc;
  Module['_heif_tai_timestamp_packet_copy'] = _heif_tai_timestamp_packet_copy;
  Module['_heif_tai_timestamp_packet_release'] = _heif_tai_timestamp_packet_release;
  Module['_random_get'] = _random_get;
  Module['ptrToString'] = ptrToString;
  Module['VIPS'] = VIPS;
  Module['setAutoDeleteLater'] = setAutoDeleteLater;
  Module['setDelayFunction'] = setDelayFunction;
  Module['FS_createPath'] = FS_createPath;
  Module['FS_unlink'] = FS_unlink;
  Module['FS_createLazyFile'] = FS_createLazyFile;
  Module['FS_createDevice'] = FS_createDevice;
  Module['incrementExceptionRefcount'] = incrementExceptionRefcount;
  Module['decrementExceptionRefcount'] = decrementExceptionRefcount;
  Module['getExceptionMessage'] = getExceptionMessage;
  Module['getExceptionMessageCommon'] = getExceptionMessageCommon;
  // End JS library exports

// end include: postlibrary.js


// proxiedFunctionTable specifies the list of functions that can be called
// either synchronously or asynchronously from other threads in postMessage()d
// or internally queued events. This way a pthread in a Worker can synchronously
// access e.g. the DOM on the main thread.
var proxiedFunctionTable = [
  _proc_exit,
  exitOnMainThread,
  pthreadCreateProxied,
  ___syscall_dup,
  ___syscall_faccessat,
  ___syscall_fcntl64,
  ___syscall_fstat64,
  ___syscall_ftruncate64,
  ___syscall_getcwd,
  ___syscall_ioctl,
  ___syscall_lstat64,
  ___syscall_newfstatat,
  ___syscall_openat,
  ___syscall_poll,
  ___syscall_rmdir,
  ___syscall_stat64,
  ___syscall_unlinkat,
  __mmap_js,
  __munmap_js,
  _environ_get,
  _environ_sizes_get,
  _fd_close,
  _fd_fdstat_get,
  _fd_read,
  _fd_seek,
  _fd_write
];

var ASM_CONSTS = {
  
};
function unbox_small_structs(type_ptr) { var type_id = HEAPU16[(type_ptr + 6 >> 1) + 0]; while (type_id === 13) { if (HEAPU32[(type_ptr >> 2) + 0] > 16) { break; } var elements = HEAPU32[(type_ptr + 8 >> 2) + 0]; var first_element = HEAPU32[(elements >> 2) + 0]; if (first_element === 0) { type_id = 0; break; } else if (HEAPU32[(elements >> 2) + 1] === 0) { type_ptr = first_element; type_id = HEAPU16[(first_element + 6 >> 1) + 0]; } else { break; } } return [type_ptr, type_id]; }
function ffi_call_js(cif,fn,rvalue,avalue) { var abi = HEAPU32[(cif >> 2) + 0]; var nargs = HEAPU32[(cif >> 2) + 1]; var nfixedargs = HEAPU32[(cif >> 2) + 6]; var arg_types_ptr = HEAPU32[(cif >> 2) + 2]; var rtype_unboxed = unbox_small_structs(HEAPU32[(cif >> 2) + 3]); var rtype_ptr = rtype_unboxed[0]; var rtype_id = rtype_unboxed[1]; var orig_stack_ptr = stackSave(); var cur_stack_ptr = orig_stack_ptr; var args = []; var ret_by_arg = (!!0); if (rtype_id === 15) { throw new Error('complex ret marshalling nyi'); } if (rtype_id < 0 || rtype_id > 15) { throw new Error('Unexpected rtype ' + rtype_id); } if (rtype_id === 4 || rtype_id === 13) { args.push(rvalue); ret_by_arg = (!!1); } for (var i = 0; i < nfixedargs; i++) { var arg_ptr = HEAPU32[(avalue >> 2) + i]; var arg_unboxed = unbox_small_structs(HEAPU32[(arg_types_ptr >> 2) + i]); var arg_type_ptr = arg_unboxed[0]; var arg_type_id = arg_unboxed[1]; switch (arg_type_id) { case 1: case 10: case 9: case 14: args.push(HEAPU32[(arg_ptr >> 2) + 0]); break; case 2: args.push(HEAPF32[(arg_ptr >> 2) + 0]); break; case 3: args.push(HEAPF64[(arg_ptr >> 3) + 0]); break; case 5: args.push(HEAPU8[arg_ptr + 0]); break; case 6: args.push(HEAP8[arg_ptr + 0]); break; case 7: args.push(HEAPU16[(arg_ptr >> 1) + 0]); break; case 8: args.push(HEAP16[(arg_ptr >> 1) + 0]); break; case 11: case 12: args.push(HEAPU64[(arg_ptr >> 3) + 0]); break; case 4: args.push(HEAPU64[(arg_ptr >> 3) + 0]); args.push(HEAPU64[(arg_ptr >> 3) + 1]); break; case 13: var size = HEAPU32[(arg_type_ptr >> 2) + 0]; var align = HEAPU16[(arg_type_ptr + 4 >> 1) + 0]; ((cur_stack_ptr -= (size)), (cur_stack_ptr &= (~((align) - 1)))); HEAP8.subarray(cur_stack_ptr, cur_stack_ptr+size).set(HEAP8.subarray(arg_ptr, arg_ptr + size)); args.push(cur_stack_ptr); break; case 15: throw new Error('complex marshalling nyi'); default: throw new Error('Unexpected type ' + arg_type_id); } } if (nfixedargs != nargs) { var struct_arg_info = []; for (var i = nargs - 1; i >= nfixedargs; i--) { var arg_ptr = HEAPU32[(avalue >> 2) + i]; var arg_unboxed = unbox_small_structs(HEAPU32[(arg_types_ptr >> 2) + i]); var arg_type_ptr = arg_unboxed[0]; var arg_type_id = arg_unboxed[1]; switch (arg_type_id) { case 5: case 6: ((cur_stack_ptr -= (1)), (cur_stack_ptr &= (~((1) - 1)))); HEAPU8[cur_stack_ptr + 0] = HEAPU8[arg_ptr + 0]; break; case 7: case 8: ((cur_stack_ptr -= (2)), (cur_stack_ptr &= (~((2) - 1)))); HEAPU16[(cur_stack_ptr >> 1) + 0] = HEAPU16[(arg_ptr >> 1) + 0]; break; case 1: case 9: case 10: case 14: case 2: ((cur_stack_ptr -= (4)), (cur_stack_ptr &= (~((4) - 1)))); HEAPU32[(cur_stack_ptr >> 2) + 0] = HEAPU32[(arg_ptr >> 2) + 0]; break; case 3: case 11: case 12: ((cur_stack_ptr -= (8)), (cur_stack_ptr &= (~((8) - 1)))); HEAPU32[(cur_stack_ptr >> 2) + 0] = HEAPU32[(arg_ptr >> 2) + 0]; HEAPU32[(cur_stack_ptr >> 2) + 1] = HEAPU32[(arg_ptr >> 2) + 1]; break; case 4: ((cur_stack_ptr -= (16)), (cur_stack_ptr &= (~((8) - 1)))); HEAPU32[(cur_stack_ptr >> 2) + 0] = HEAPU32[(arg_ptr >> 2) + 0]; HEAPU32[(cur_stack_ptr >> 2) + 1] = HEAPU32[(arg_ptr >> 2) + 1]; HEAPU32[(cur_stack_ptr >> 2) + 2] = HEAPU32[(arg_ptr >> 2) + 2]; HEAPU32[(cur_stack_ptr >> 2) + 3] = HEAPU32[(arg_ptr >> 2) + 3]; break; case 13: ((cur_stack_ptr -= (4)), (cur_stack_ptr &= (~((4) - 1)))); struct_arg_info.push([cur_stack_ptr, arg_ptr, HEAPU32[(arg_type_ptr >> 2) + 0], HEAPU16[(arg_type_ptr + 4 >> 1) + 0]]); break; case 15: throw new Error('complex arg marshalling nyi'); default: throw new Error('Unexpected argtype ' + arg_type_id); } } args.push(cur_stack_ptr); for (var i = 0; i < struct_arg_info.length; i++) { var struct_info = struct_arg_info[i]; var arg_target = struct_info[0]; var arg_ptr = struct_info[1]; var size = struct_info[2]; var align = struct_info[3]; ((cur_stack_ptr -= (size)), (cur_stack_ptr &= (~((align) - 1)))); HEAP8.subarray(cur_stack_ptr, cur_stack_ptr+size).set(HEAP8.subarray(arg_ptr, arg_ptr + size)); HEAPU32[(arg_target >> 2) + 0] = cur_stack_ptr; } } stackRestore(cur_stack_ptr); stackAlloc(0); 0; var result = getWasmTableEntry(fn).apply(null, args); stackRestore(orig_stack_ptr); if (ret_by_arg) { return; } switch (rtype_id) { case 0: break; case 1: case 9: case 10: case 14: HEAPU32[(rvalue >> 2) + 0] = result; break; case 2: HEAPF32[(rvalue >> 2) + 0] = result; break; case 3: HEAPF64[(rvalue >> 3) + 0] = result; break; case 5: case 6: HEAPU8[rvalue + 0] = result; break; case 7: case 8: HEAPU16[(rvalue >> 1) + 0] = result; break; case 11: case 12: HEAPU64[(rvalue >> 3) + 0] = result; break; case 15: throw new Error('complex ret marshalling nyi'); default: throw new Error('Unexpected rtype ' + rtype_id); } }
ffi_call_js.sig = 'viiii';
function ffi_closure_alloc_js(size,code) { var closure = _malloc(size); var index = getEmptyTableSlot(); HEAPU32[(code >> 2) + 0] = index; HEAPU32[(closure >> 2) + 0] = index; return closure; }
function ffi_closure_free_js(closure) { var index = HEAPU32[(closure >> 2) + 0]; freeTableIndexes.push(index); _free(closure); }
function ffi_prep_closure_loc_js(closure,cif,fun,user_data,codeloc) { var abi = HEAPU32[(cif >> 2) + 0]; var nargs = HEAPU32[(cif >> 2) + 1]; var nfixedargs = HEAPU32[(cif >> 2) + 6]; var arg_types_ptr = HEAPU32[(cif >> 2) + 2]; var rtype_unboxed = unbox_small_structs(HEAPU32[(cif >> 2) + 3]); var rtype_ptr = rtype_unboxed[0]; var rtype_id = rtype_unboxed[1]; var sig; var ret_by_arg = (!!0); switch (rtype_id) { case 0: sig = 'v'; break; case 13: case 4: sig = 'vi'; ret_by_arg = (!!1); break; case 1: case 5: case 6: case 7: case 8: case 9: case 10: case 14: sig = 'i'; break; case 2: sig = 'f'; break; case 3: sig = 'd'; break; case 11: case 12: sig = 'j'; break; case 15: throw new Error('complex ret marshalling nyi'); default: throw new Error('Unexpected rtype ' + rtype_id); } var unboxed_arg_type_id_list = []; var unboxed_arg_type_info_list = []; for (var i = 0; i < nargs; i++) { var arg_unboxed = unbox_small_structs(HEAPU32[(arg_types_ptr >> 2) + i]); var arg_type_ptr = arg_unboxed[0]; var arg_type_id = arg_unboxed[1]; unboxed_arg_type_id_list.push(arg_type_id); unboxed_arg_type_info_list.push([HEAPU32[(arg_type_ptr >> 2) + 0], HEAPU16[(arg_type_ptr + 4 >> 1) + 0]]); } for (var i = 0; i < nfixedargs; i++) { switch (unboxed_arg_type_id_list[i]) { case 1: case 5: case 6: case 7: case 8: case 9: case 10: case 14: case 13: sig += 'i'; break; case 2: sig += 'f'; break; case 3: sig += 'd'; break; case 4: sig += 'jj'; break; case 11: case 12: sig += 'j'; break; case 15: throw new Error('complex marshalling nyi'); default: throw new Error('Unexpected argtype ' + arg_type_id); } } if (nfixedargs < nargs) { sig += 'i'; } 0; function trampoline() { var args = Array.prototype.slice.call(arguments); var size = 0; var orig_stack_ptr = stackSave(); var cur_ptr = orig_stack_ptr; var ret_ptr; var jsarg_idx = 0; if (ret_by_arg) { ret_ptr = args[jsarg_idx++]; } else { ((cur_ptr -= (8)), (cur_ptr &= (~((8) - 1)))); ret_ptr = cur_ptr; } cur_ptr -= 4 * nargs; var args_ptr = cur_ptr; var carg_idx = 0; for (; carg_idx < nfixedargs; carg_idx++) { var cur_arg = args[jsarg_idx++]; var arg_type_info = unboxed_arg_type_info_list[carg_idx]; var arg_size = arg_type_info[0]; var arg_align = arg_type_info[1]; var arg_type_id = unboxed_arg_type_id_list[carg_idx]; switch (arg_type_id) { case 5: case 6: ((cur_ptr -= (1)), (cur_ptr &= (~((4) - 1)))); HEAPU32[(args_ptr >> 2) + carg_idx] = cur_ptr; HEAPU8[cur_ptr + 0] = cur_arg; break; case 7: case 8: ((cur_ptr -= (2)), (cur_ptr &= (~((4) - 1)))); HEAPU32[(args_ptr >> 2) + carg_idx] = cur_ptr; HEAPU16[(cur_ptr >> 1) + 0] = cur_arg; break; case 1: case 9: case 10: case 14: ((cur_ptr -= (4)), (cur_ptr &= (~((4) - 1)))); HEAPU32[(args_ptr >> 2) + carg_idx] = cur_ptr; HEAPU32[(cur_ptr >> 2) + 0] = cur_arg; break; case 13: ((cur_ptr -= (arg_size)), (cur_ptr &= (~((arg_align) - 1)))); HEAP8.subarray(cur_ptr, cur_ptr + arg_size).set(HEAP8.subarray(cur_arg, cur_arg + arg_size)); HEAPU32[(args_ptr >> 2) + carg_idx] = cur_ptr; break; case 2: ((cur_ptr -= (4)), (cur_ptr &= (~((4) - 1)))); HEAPU32[(args_ptr >> 2) + carg_idx] = cur_ptr; HEAPF32[(cur_ptr >> 2) + 0] = cur_arg; break; case 3: ((cur_ptr -= (8)), (cur_ptr &= (~((8) - 1)))); HEAPU32[(args_ptr >> 2) + carg_idx] = cur_ptr; HEAPF64[(cur_ptr >> 3) + 0] = cur_arg; break; case 11: case 12: ((cur_ptr -= (8)), (cur_ptr &= (~((8) - 1)))); HEAPU32[(args_ptr >> 2) + carg_idx] = cur_ptr; HEAPU64[(cur_ptr >> 3) + 0] = cur_arg; break; case 4: ((cur_ptr -= (16)), (cur_ptr &= (~((8) - 1)))); HEAPU32[(args_ptr >> 2) + carg_idx] = cur_ptr; HEAPU64[(cur_ptr >> 3) + 0] = cur_arg; cur_arg = args[jsarg_idx++]; HEAPU64[(cur_ptr >> 3) + 1] = cur_arg; break; } } var varargs = args[args.length - 1]; for (; carg_idx < nargs; carg_idx++) { var arg_type_id = unboxed_arg_type_id_list[carg_idx]; var arg_type_info = unboxed_arg_type_info_list[carg_idx]; var arg_size = arg_type_info[0]; var arg_align = arg_type_info[1]; if (arg_type_id === 13) { var struct_ptr = HEAPU32[(varargs >> 2) + 0]; ((cur_ptr -= (arg_size)), (cur_ptr &= (~((arg_align) - 1)))); HEAP8.subarray(cur_ptr, cur_ptr + arg_size).set(HEAP8.subarray(struct_ptr, struct_ptr + arg_size)); HEAPU32[(args_ptr >> 2) + carg_idx] = cur_ptr; } else { HEAPU32[(args_ptr >> 2) + carg_idx] = varargs; } varargs += 4; } stackRestore(cur_ptr); stackAlloc(0); 0; getWasmTableEntry(HEAPU32[(closure >> 2) + 2])( HEAPU32[(closure >> 2) + 1], ret_ptr, args_ptr, HEAPU32[(closure >> 2) + 3] ); stackRestore(orig_stack_ptr); if (!ret_by_arg) { switch (sig[0]) { case 'i': return HEAPU32[(ret_ptr >> 2) + 0]; case 'j': return HEAPU64[(ret_ptr >> 3) + 0]; case 'd': return HEAPF64[(ret_ptr >> 3) + 0]; case 'f': return HEAPF32[(ret_ptr >> 2) + 0]; } } } try { var wasm_trampoline = convertJsFunctionToWasm(trampoline, sig); } catch(e) { return 1; } setWasmTableEntry(codeloc, wasm_trampoline); HEAPU32[(closure >> 2) + 1] = cif; HEAPU32[(closure >> 2) + 2] = fun; HEAPU32[(closure >> 2) + 3] = user_data; return 0; }

// Imports from the Wasm binary.
var ___getTypeName,
  __embind_initialize_bindings,
  _getTempRet0,
  _vips_source_new_from_file,
  ___cxa_allocate_exception,
  __ZdlPv,
  ___cxa_free_exception,
  __Znwm,
  _vips_area_unref,
  _strlen,
  _pthread_self,
  _vips_target_new_to_file,
  _vips_target_new_to_memory,
  __ZSt9terminatev,
  __ZNSt12length_errorD1Ev,
  __ZNSt11logic_errorC2EPKc,
  ___cxa_atexit,
  _g_object_unref,
  _malloc,
  _g_signal_connect_data,
  _vips_image_new_memory,
  __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE25__init_copy_ctor_externalEPKcm,
  _g_object_ref,
  _vips_image_copy_memory,
  _vips_image_write,
  _g_object_get,
  __ZNSt20bad_array_new_lengthD1Ev,
  __ZNSt20bad_array_new_lengthC1Ev,
  _memcmp,
  _vips_blob_get_type,
  __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm,
  _vips_concurrency_get,
  _vips_connection_filename,
  _vips_image_set_int,
  _vips_image_set_array_int,
  _vips_image_set_string,
  _vips_image_set_blob,
  _vips_image_get_typeof,
  _vips_image_get_int,
  _vips_image_get_array_int,
  _vips_image_get_double,
  _vips_image_get_blob,
  _vips_image_hasalpha,
  _vips_enum_nick,
  _vips_image_get_page_height,
  _vips_image_iskilled,
  __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_no_aliasILb1EEERS5_PKcm,
  __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_no_aliasILb0EEERS5_PKcm,
  _main,
  _vips_foreign_subsample_get_type,
  _vips_foreign_heif_compression_get_type,
  _vips_foreign_heif_encoder_get_type,
  _vips_foreign_load_get_type,
  _g_type_register_static_simple,
  _vips_isprefix,
  _vips_error,
  _vips_source_rewind,
  _vips_foreign_save_get_type,
  _vips_extract_band,
  _vips_cast,
  _free,
  _vips_area_free_cb,
  _vips_malloc,
  _strcmp,
  _vips_iscasepostfix,
  _g_type_class_peek_parent,
  _g_type_class_adjust_private_offset,
  _vips_object_get_property,
  _vips_object_set_property,
  _g_param_spec_int,
  _vips_argument_get_id,
  _g_object_class_install_property,
  _vips_object_class_install_argument,
  _g_param_spec_string,
  _vips_image_init_fields,
  _vips_image_pipelinev,
  _vips_source_get_type,
  _g_param_spec_object,
  _vips_sink_disc,
  _vips_target_end,
  _vips_format_sizeof_unsafe,
  _vips_target_get_type,
  _vips_image_new,
  _vips_object_local_array,
  _g_param_spec_double,
  _g_param_spec_boolean,
  _vips_image_eval,
  _vips_target_write,
  _g_param_spec_boxed,
  _g_object_set,
  _g_param_spec_enum,
  _vips_object_argument_isset,
  _vips_image_generate,
  _vips_max_coord_get,
  ___wasm_setjmp_test,
  _setTempRet0,
  ___wasm_setjmp,
  _vips_autorot_remove_angle,
  _vips_source_minimise,
  _emscripten_longjmp,
  _vips_source_sniff,
  _vips_source_read,
  _vips_source_decode,
  _vips_sequential,
  _vips_image_get_orientation,
  _vips_source_new_from_memory,
  _vips_blob_get,
  _fwrite,
  _fflush,
  _strchr,
  _vips__get_bytes,
  _calloc,
  _strncmp,
  _realloc,
  _log2,
  _vips_source_seek,
  _vips_target_seek,
  _vips_image_write_prepare,
  _vips_profile_load,
  _vips_tilecache,
  _fclose,
  _fiprintf,
  _abort,
  _cos,
  _sin,
  _exp,
  _tan,
  _acos,
  _tanh,
  _log,
  _log10,
  _pow,
  _hypot,
  _vips_crop,
  _atan2,
  _cmsReadTag,
  _cmsCloseProfile,
  _cmsGetColorSpace,
  _cmsDeleteTransform,
  _cmsDoTransform,
  _cmsGetHeaderRenderingIntent,
  _hypotf,
  _powf,
  _cosf,
  _sinf,
  _logf,
  _ldexp,
  _cbrtf,
  _posix_memalign,
  _vips_region_black,
  _vips_image_minimise_all,
  _fmod,
  _qsort,
  _close,
  ___errno_location,
  _read,
  _write,
  _g_str_equal,
  _g_direct_hash,
  _fputc,
  _g_direct_equal,
  _g_str_hash,
  _vfprintf,
  _fputs,
  _vips_image_preeval,
  _vips_image_posteval,
  _fstat,
  _open,
  _fopen,
  _fileno,
  _fread,
  _feof,
  _ungetc,
  _strcpy,
  _lseek,
  _tolower,
  _strncpy,
  _g_log_default_handler,
  _g_log_writer_default,
  __emscripten_tls_init,
  _getc,
  _fscanf,
  _nl_langinfo,
  _strstr,
  _iconv_open,
  _iconv,
  _iconv_close,
  _memchr,
  _setlocale,
  _getenv,
  _stat,
  _getcwd,
  _bindtextdomain,
  _bind_textdomain_codeset,
  _dgettext,
  _textdomain,
  _gettext,
  _gettimeofday,
  _strcasecmp,
  _strpbrk,
  _raise,
  __exit,
  _strcat,
  _getpid,
  _vsnprintf,
  _isatty,
  _tzset,
  _localtime_r,
  _strftime,
  _memmem,
  _strtol,
  _unlink,
  _stpcpy,
  _snprintf,
  _strerror_r,
  _pthread_mutex_destroy,
  _pthread_create,
  _pthread_mutex_init,
  _pthread_mutex_lock,
  _pthread_mutex_unlock,
  _pthread_setspecific,
  _pthread_cond_destroy,
  _pthread_cond_broadcast,
  _pthread_cond_wait,
  _pthread_getspecific,
  _pthread_rwlock_init,
  _pthread_rwlock_destroy,
  _pthread_rwlock_unlock,
  _pthread_rwlock_rdlock,
  _strerror,
  _pthread_condattr_init,
  _pthread_condattr_setclock,
  _pthread_cond_init,
  _pthread_condattr_destroy,
  _pthread_key_create,
  _pthread_key_delete,
  _strtoul,
  _vasprintf,
  _ntohs,
  _inflateEnd,
  _inflateInit2_,
  _inflate,
  ___small_fprintf,
  _rand,
  _exp2,
  _SharpYuvConvert,
  _SharpYuvComputeConversionMatrix,
  _expf,
  _cmsSetLogErrorHandlerTHR,
  _fseek,
  _cmsEstimateGamma,
  _cmsOpenProfileFromMemTHR,
  _cmsReadRawTag,
  _wcslen,
  _cmsXYZ2xyY,
  _cmsCreateExtendedTransform,
  _cmsCreateTransformTHR,
  _cmsCreateXYZProfileTHR,
  _cmsCreateContext,
  _cmsAdaptToIlluminant,
  _emscripten_builtin_free,
  _emscripten_builtin_memalign,
  _emscripten_builtin_malloc,
  _emscripten_futex_wake,
  _emscripten_futex_wait,
  _sqrt,
  _acosf,
  _log1p,
  _atan2f,
  ___funcs_on_exit,
  ___libc_calloc,
  ___libc_free,
  ___libc_malloc,
  ___dl_seterr,
  __emscripten_dlsync_self_async,
  __emscripten_dlsync_self,
  __emscripten_proxy_dlsync_async,
  __emscripten_proxy_dlsync,
  __emscripten_find_dylib,
  __emscripten_thread_init,
  __emscripten_thread_crashed,
  _getentropy,
  _htons,
  _htonl,
  _sqrtf,
  _llroundf,
  _log1pf,
  _log2f,
  _lrint,
  _lroundf,
  _modff,
  __emscripten_run_on_main_thread_js,
  __emscripten_thread_free_data,
  __emscripten_thread_exit,
  _remainder,
  _round,
  _roundf,
  _strndup,
  __emscripten_check_mailbox,
  _wmemchr,
  _writev,
  __ZdlPvmSt11align_val_t,
  __ZdaPv,
  __ZdaPvm,
  __ZdlPvm,
  __Znaj,
  __ZnajSt11align_val_t,
  __Znwj,
  __ZnwjSt11align_val_t,
  ___libc_realloc,
  _emscripten_builtin_calloc,
  _emscripten_builtin_realloc,
  _malloc_size,
  _malloc_usable_size,
  _reallocf,
  _setThrew,
  __emscripten_tempret_set,
  __emscripten_tempret_get,
  _emscripten_stack_set_limits,
  __emscripten_stack_restore,
  __emscripten_stack_alloc,
  _emscripten_stack_get_current,
  __ZNSt3__26__sortIRNS_6__lessIiiEEPiEEvT0_S5_T_,
  __ZNSt3__26__sortIRNS_6__lessImmEEPmEEvT0_S5_T_,
  __ZNSt3__26__sortIRNS_6__lessIffEEPfEEvT0_S5_T_,
  __ZNSt3__218condition_variable10notify_oneEv,
  __ZNSt3__218condition_variable10notify_allEv,
  __ZNSt3__218condition_variable4waitERNS_11unique_lockINS_5mutexEEE,
  __ZNSt3__218condition_variableD1Ev,
  __ZNSt3__212__next_primeEm,
  __ZNSt3__29basic_iosIcNS_11char_traitsIcEEED2Ev,
  __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE5flushEv,
  __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE6sentryC1ERS3_,
  __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE6sentryD1Ev,
  __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEED2Ev,
  __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEb,
  __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEt,
  __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEi,
  __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEj,
  __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEm,
  __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEy,
  __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEf,
  __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEd,
  __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE3putEc,
  __ZNSt3__214basic_iostreamIcNS_11char_traitsIcEEED2Ev,
  __ZNKSt3__28ios_base6getlocEv,
  __ZNSt3__28ios_base5clearEj,
  __ZNSt3__28ios_base4initEPv,
  __ZNSt3__28ios_base33__set_badbit_and_consider_rethrowEv,
  __ZNSt3__26localeD1Ev,
  __ZNKSt3__26locale9use_facetERNS0_2idE,
  __ZNSt3__26localeC1Ev,
  __ZNSt3__212bad_weak_ptrD1Ev,
  __ZNSt3__219__shared_weak_count14__release_weakEv,
  __ZNSt3__219__shared_weak_count4lockEv,
  __ZNKSt3__219__shared_weak_count13__get_deleterERKSt9type_info,
  __ZNSt3__219__shared_weak_countD2Ev,
  __ZNSt3__25mutex4lockEv,
  __ZNSt3__25mutex6unlockEv,
  __ZNSt3__25mutexD1Ev,
  __ZnwmRKSt9nothrow_t,
  __Znam,
  __ZnamRKSt9nothrow_t,
  __ZnwmSt11align_val_t,
  __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_externalEPKcm,
  __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_externalEPKc,
  __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc,
  __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEmc,
  __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEmc,
  __ZNSt12out_of_rangeD1Ev,
  __ZNSt3__220__throw_system_errorEiPKc,
  __ZNSt3__26thread4joinEv,
  __ZNSt3__26thread20hardware_concurrencyEv,
  __ZNSt3__219__thread_local_dataEv,
  __ZNSt3__215__thread_structD1Ev,
  __ZNSt3__26threadD1Ev,
  __ZNSt3__215__thread_structC1Ev,
  ___cxa_increment_exception_refcount,
  ___cxa_decrement_exception_refcount,
  ___get_exception_message,
  ___cxa_guard_acquire,
  ___cxa_guard_release,
  ___cxa_pure_virtual,
  ___dynamic_cast,
  ___cxa_can_catch,
  ___cxa_get_exception_ptr,
  ___wasm_apply_data_relocs;


function assignWasmExports(wasmExports) {
  Module['___getTypeName'] = ___getTypeName = wasmExports['__getTypeName'];
  Module['__embind_initialize_bindings'] = __embind_initialize_bindings = wasmExports['_embind_initialize_bindings'];
  Module['_getTempRet0'] = _getTempRet0 = wasmExports['getTempRet0'];
  Module['_vips_source_new_from_file'] = _vips_source_new_from_file = wasmExports['vips_source_new_from_file'];
  Module['___cxa_allocate_exception'] = ___cxa_allocate_exception = wasmExports['__cxa_allocate_exception'];
  Module['__ZdlPv'] = __ZdlPv = wasmExports['_ZdlPv'];
  Module['___cxa_free_exception'] = ___cxa_free_exception = wasmExports['__cxa_free_exception'];
  Module['__Znwm'] = __Znwm = wasmExports['_Znwm'];
  Module['_vips_area_unref'] = _vips_area_unref = wasmExports['vips_area_unref'];
  Module['_strlen'] = _strlen = wasmExports['strlen'];
  Module['_pthread_self'] = _pthread_self = wasmExports['pthread_self'];
  Module['_vips_target_new_to_file'] = _vips_target_new_to_file = wasmExports['vips_target_new_to_file'];
  Module['_vips_target_new_to_memory'] = _vips_target_new_to_memory = wasmExports['vips_target_new_to_memory'];
  Module['__ZSt9terminatev'] = __ZSt9terminatev = wasmExports['_ZSt9terminatev'];
  Module['__ZNSt12length_errorD1Ev'] = __ZNSt12length_errorD1Ev = wasmExports['_ZNSt12length_errorD1Ev'];
  Module['__ZNSt11logic_errorC2EPKc'] = __ZNSt11logic_errorC2EPKc = wasmExports['_ZNSt11logic_errorC2EPKc'];
  Module['___cxa_atexit'] = ___cxa_atexit = wasmExports['__cxa_atexit'];
  Module['_g_object_unref'] = _g_object_unref = wasmExports['g_object_unref'];
  Module['_malloc'] = _malloc = wasmExports['malloc'];
  Module['_g_signal_connect_data'] = _g_signal_connect_data = wasmExports['g_signal_connect_data'];
  Module['_vips_image_new_memory'] = _vips_image_new_memory = wasmExports['vips_image_new_memory'];
  Module['__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE25__init_copy_ctor_externalEPKcm'] = __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE25__init_copy_ctor_externalEPKcm = wasmExports['_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE25__init_copy_ctor_externalEPKcm'];
  Module['_g_object_ref'] = _g_object_ref = wasmExports['g_object_ref'];
  Module['_vips_image_copy_memory'] = _vips_image_copy_memory = wasmExports['vips_image_copy_memory'];
  Module['_vips_image_write'] = _vips_image_write = wasmExports['vips_image_write'];
  Module['_g_object_get'] = _g_object_get = wasmExports['g_object_get'];
  Module['__ZNSt20bad_array_new_lengthD1Ev'] = __ZNSt20bad_array_new_lengthD1Ev = wasmExports['_ZNSt20bad_array_new_lengthD1Ev'];
  Module['__ZNSt20bad_array_new_lengthC1Ev'] = __ZNSt20bad_array_new_lengthC1Ev = wasmExports['_ZNSt20bad_array_new_lengthC1Ev'];
  Module['_memcmp'] = _memcmp = wasmExports['memcmp'];
  Module['_vips_blob_get_type'] = _vips_blob_get_type = wasmExports['vips_blob_get_type'];
  Module['__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm'] = __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm = wasmExports['_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEPKcm'];
  Module['_vips_concurrency_get'] = _vips_concurrency_get = wasmExports['vips_concurrency_get'];
  Module['_vips_connection_filename'] = _vips_connection_filename = wasmExports['vips_connection_filename'];
  Module['_vips_image_set_int'] = _vips_image_set_int = wasmExports['vips_image_set_int'];
  Module['_vips_image_set_array_int'] = _vips_image_set_array_int = wasmExports['vips_image_set_array_int'];
  Module['_vips_image_set_string'] = _vips_image_set_string = wasmExports['vips_image_set_string'];
  Module['_vips_image_set_blob'] = _vips_image_set_blob = wasmExports['vips_image_set_blob'];
  Module['_vips_image_get_typeof'] = _vips_image_get_typeof = wasmExports['vips_image_get_typeof'];
  Module['_vips_image_get_int'] = _vips_image_get_int = wasmExports['vips_image_get_int'];
  Module['_vips_image_get_array_int'] = _vips_image_get_array_int = wasmExports['vips_image_get_array_int'];
  Module['_vips_image_get_double'] = _vips_image_get_double = wasmExports['vips_image_get_double'];
  Module['_vips_image_get_blob'] = _vips_image_get_blob = wasmExports['vips_image_get_blob'];
  Module['_vips_image_hasalpha'] = _vips_image_hasalpha = wasmExports['vips_image_hasalpha'];
  Module['_vips_enum_nick'] = _vips_enum_nick = wasmExports['vips_enum_nick'];
  Module['_vips_image_get_page_height'] = _vips_image_get_page_height = wasmExports['vips_image_get_page_height'];
  Module['_vips_image_iskilled'] = _vips_image_iskilled = wasmExports['vips_image_iskilled'];
  Module['__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_no_aliasILb1EEERS5_PKcm'] = __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_no_aliasILb1EEERS5_PKcm = wasmExports['_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_no_aliasILb1EEERS5_PKcm'];
  Module['__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_no_aliasILb0EEERS5_PKcm'] = __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_no_aliasILb0EEERS5_PKcm = wasmExports['_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_no_aliasILb0EEERS5_PKcm'];
  Module['_main'] = _main = wasmExports['main'];
  Module['_vips_foreign_subsample_get_type'] = _vips_foreign_subsample_get_type = wasmExports['vips_foreign_subsample_get_type'];
  Module['_vips_foreign_heif_compression_get_type'] = _vips_foreign_heif_compression_get_type = wasmExports['vips_foreign_heif_compression_get_type'];
  Module['_vips_foreign_heif_encoder_get_type'] = _vips_foreign_heif_encoder_get_type = wasmExports['vips_foreign_heif_encoder_get_type'];
  Module['_vips_foreign_load_get_type'] = _vips_foreign_load_get_type = wasmExports['vips_foreign_load_get_type'];
  Module['_g_type_register_static_simple'] = _g_type_register_static_simple = wasmExports['g_type_register_static_simple'];
  Module['_vips_isprefix'] = _vips_isprefix = wasmExports['vips_isprefix'];
  Module['_vips_error'] = _vips_error = wasmExports['vips_error'];
  Module['_vips_source_rewind'] = _vips_source_rewind = wasmExports['vips_source_rewind'];
  Module['_vips_foreign_save_get_type'] = _vips_foreign_save_get_type = wasmExports['vips_foreign_save_get_type'];
  Module['_vips_extract_band'] = _vips_extract_band = wasmExports['vips_extract_band'];
  Module['_vips_cast'] = _vips_cast = wasmExports['vips_cast'];
  Module['_free'] = _free = wasmExports['free'];
  Module['_vips_area_free_cb'] = _vips_area_free_cb = wasmExports['vips_area_free_cb'];
  Module['_vips_malloc'] = _vips_malloc = wasmExports['vips_malloc'];
  Module['_strcmp'] = _strcmp = wasmExports['strcmp'];
  Module['_vips_iscasepostfix'] = _vips_iscasepostfix = wasmExports['vips_iscasepostfix'];
  Module['_g_type_class_peek_parent'] = _g_type_class_peek_parent = wasmExports['g_type_class_peek_parent'];
  Module['_g_type_class_adjust_private_offset'] = _g_type_class_adjust_private_offset = wasmExports['g_type_class_adjust_private_offset'];
  Module['_vips_object_get_property'] = _vips_object_get_property = wasmExports['vips_object_get_property'];
  Module['_vips_object_set_property'] = _vips_object_set_property = wasmExports['vips_object_set_property'];
  Module['_g_param_spec_int'] = _g_param_spec_int = wasmExports['g_param_spec_int'];
  Module['_vips_argument_get_id'] = _vips_argument_get_id = wasmExports['vips_argument_get_id'];
  Module['_g_object_class_install_property'] = _g_object_class_install_property = wasmExports['g_object_class_install_property'];
  Module['_vips_object_class_install_argument'] = _vips_object_class_install_argument = wasmExports['vips_object_class_install_argument'];
  Module['_g_param_spec_string'] = _g_param_spec_string = wasmExports['g_param_spec_string'];
  Module['_vips_image_init_fields'] = _vips_image_init_fields = wasmExports['vips_image_init_fields'];
  Module['_vips_image_pipelinev'] = _vips_image_pipelinev = wasmExports['vips_image_pipelinev'];
  Module['_vips_source_get_type'] = _vips_source_get_type = wasmExports['vips_source_get_type'];
  Module['_g_param_spec_object'] = _g_param_spec_object = wasmExports['g_param_spec_object'];
  Module['_vips_sink_disc'] = _vips_sink_disc = wasmExports['vips_sink_disc'];
  Module['_vips_target_end'] = _vips_target_end = wasmExports['vips_target_end'];
  Module['_vips_format_sizeof_unsafe'] = _vips_format_sizeof_unsafe = wasmExports['vips_format_sizeof_unsafe'];
  Module['_vips_target_get_type'] = _vips_target_get_type = wasmExports['vips_target_get_type'];
  Module['_vips_image_new'] = _vips_image_new = wasmExports['vips_image_new'];
  Module['_vips_object_local_array'] = _vips_object_local_array = wasmExports['vips_object_local_array'];
  Module['_g_param_spec_double'] = _g_param_spec_double = wasmExports['g_param_spec_double'];
  Module['_g_param_spec_boolean'] = _g_param_spec_boolean = wasmExports['g_param_spec_boolean'];
  Module['_vips_image_eval'] = _vips_image_eval = wasmExports['vips_image_eval'];
  Module['_vips_target_write'] = _vips_target_write = wasmExports['vips_target_write'];
  Module['_g_param_spec_boxed'] = _g_param_spec_boxed = wasmExports['g_param_spec_boxed'];
  Module['_g_object_set'] = _g_object_set = wasmExports['g_object_set'];
  Module['_g_param_spec_enum'] = _g_param_spec_enum = wasmExports['g_param_spec_enum'];
  Module['_vips_object_argument_isset'] = _vips_object_argument_isset = wasmExports['vips_object_argument_isset'];
  Module['_vips_image_generate'] = _vips_image_generate = wasmExports['vips_image_generate'];
  Module['_vips_max_coord_get'] = _vips_max_coord_get = wasmExports['vips_max_coord_get'];
  Module['___wasm_setjmp_test'] = ___wasm_setjmp_test = wasmExports['__wasm_setjmp_test'];
  Module['_setTempRet0'] = _setTempRet0 = wasmExports['setTempRet0'];
  Module['___wasm_setjmp'] = ___wasm_setjmp = wasmExports['__wasm_setjmp'];
  Module['_vips_autorot_remove_angle'] = _vips_autorot_remove_angle = wasmExports['vips_autorot_remove_angle'];
  Module['_vips_source_minimise'] = _vips_source_minimise = wasmExports['vips_source_minimise'];
  Module['_emscripten_longjmp'] = _emscripten_longjmp = wasmExports['emscripten_longjmp'];
  Module['_vips_source_sniff'] = _vips_source_sniff = wasmExports['vips_source_sniff'];
  Module['_vips_source_read'] = _vips_source_read = wasmExports['vips_source_read'];
  Module['_vips_source_decode'] = _vips_source_decode = wasmExports['vips_source_decode'];
  Module['_vips_sequential'] = _vips_sequential = wasmExports['vips_sequential'];
  Module['_vips_image_get_orientation'] = _vips_image_get_orientation = wasmExports['vips_image_get_orientation'];
  Module['_vips_source_new_from_memory'] = _vips_source_new_from_memory = wasmExports['vips_source_new_from_memory'];
  Module['_vips_blob_get'] = _vips_blob_get = wasmExports['vips_blob_get'];
  Module['_fwrite'] = _fwrite = wasmExports['fwrite'];
  Module['_fflush'] = _fflush = wasmExports['fflush'];
  Module['_strchr'] = _strchr = wasmExports['strchr'];
  Module['_vips__get_bytes'] = _vips__get_bytes = wasmExports['vips__get_bytes'];
  Module['_calloc'] = _calloc = wasmExports['calloc'];
  Module['_strncmp'] = _strncmp = wasmExports['strncmp'];
  Module['_realloc'] = _realloc = wasmExports['realloc'];
  Module['_log2'] = _log2 = wasmExports['log2'];
  Module['_vips_source_seek'] = _vips_source_seek = wasmExports['vips_source_seek'];
  Module['_vips_target_seek'] = _vips_target_seek = wasmExports['vips_target_seek'];
  Module['_vips_image_write_prepare'] = _vips_image_write_prepare = wasmExports['vips_image_write_prepare'];
  Module['_vips_profile_load'] = _vips_profile_load = wasmExports['vips_profile_load'];
  Module['_vips_tilecache'] = _vips_tilecache = wasmExports['vips_tilecache'];
  Module['_fclose'] = _fclose = wasmExports['fclose'];
  Module['_fiprintf'] = _fiprintf = wasmExports['fiprintf'];
  Module['_abort'] = _abort = wasmExports['abort'];
  Module['_cos'] = _cos = wasmExports['cos'];
  Module['_sin'] = _sin = wasmExports['sin'];
  Module['_exp'] = _exp = wasmExports['exp'];
  Module['_tan'] = _tan = wasmExports['tan'];
  Module['_acos'] = _acos = wasmExports['acos'];
  Module['_tanh'] = _tanh = wasmExports['tanh'];
  Module['_log'] = _log = wasmExports['log'];
  Module['_log10'] = _log10 = wasmExports['log10'];
  Module['_pow'] = _pow = wasmExports['pow'];
  Module['_hypot'] = _hypot = wasmExports['hypot'];
  Module['_vips_crop'] = _vips_crop = wasmExports['vips_crop'];
  Module['_atan2'] = _atan2 = wasmExports['atan2'];
  Module['_cmsReadTag'] = _cmsReadTag = wasmExports['cmsReadTag'];
  Module['_cmsCloseProfile'] = _cmsCloseProfile = wasmExports['cmsCloseProfile'];
  Module['_cmsGetColorSpace'] = _cmsGetColorSpace = wasmExports['cmsGetColorSpace'];
  Module['_cmsDeleteTransform'] = _cmsDeleteTransform = wasmExports['cmsDeleteTransform'];
  Module['_cmsDoTransform'] = _cmsDoTransform = wasmExports['cmsDoTransform'];
  Module['_cmsGetHeaderRenderingIntent'] = _cmsGetHeaderRenderingIntent = wasmExports['cmsGetHeaderRenderingIntent'];
  Module['_hypotf'] = _hypotf = wasmExports['hypotf'];
  Module['_powf'] = _powf = wasmExports['powf'];
  Module['_cosf'] = _cosf = wasmExports['cosf'];
  Module['_sinf'] = _sinf = wasmExports['sinf'];
  Module['_logf'] = _logf = wasmExports['logf'];
  Module['_ldexp'] = _ldexp = wasmExports['ldexp'];
  Module['_cbrtf'] = _cbrtf = wasmExports['cbrtf'];
  Module['_posix_memalign'] = _posix_memalign = wasmExports['posix_memalign'];
  Module['_vips_region_black'] = _vips_region_black = wasmExports['vips_region_black'];
  Module['_vips_image_minimise_all'] = _vips_image_minimise_all = wasmExports['vips_image_minimise_all'];
  Module['_fmod'] = _fmod = wasmExports['fmod'];
  Module['_qsort'] = _qsort = wasmExports['qsort'];
  Module['_close'] = _close = wasmExports['close'];
  Module['___errno_location'] = ___errno_location = wasmExports['__errno_location'];
  Module['_read'] = _read = wasmExports['read'];
  Module['_write'] = _write = wasmExports['write'];
  Module['_g_str_equal'] = _g_str_equal = wasmExports['g_str_equal'];
  Module['_g_direct_hash'] = _g_direct_hash = wasmExports['g_direct_hash'];
  Module['_fputc'] = _fputc = wasmExports['fputc'];
  Module['_g_direct_equal'] = _g_direct_equal = wasmExports['g_direct_equal'];
  Module['_g_str_hash'] = _g_str_hash = wasmExports['g_str_hash'];
  Module['_vfprintf'] = _vfprintf = wasmExports['vfprintf'];
  Module['_fputs'] = _fputs = wasmExports['fputs'];
  Module['_vips_image_preeval'] = _vips_image_preeval = wasmExports['vips_image_preeval'];
  Module['_vips_image_posteval'] = _vips_image_posteval = wasmExports['vips_image_posteval'];
  Module['_fstat'] = _fstat = wasmExports['fstat'];
  Module['_open'] = _open = wasmExports['open'];
  Module['_fopen'] = _fopen = wasmExports['fopen'];
  Module['_fileno'] = _fileno = wasmExports['fileno'];
  Module['_fread'] = _fread = wasmExports['fread'];
  Module['_feof'] = _feof = wasmExports['feof'];
  Module['_ungetc'] = _ungetc = wasmExports['ungetc'];
  Module['_strcpy'] = _strcpy = wasmExports['strcpy'];
  Module['_lseek'] = _lseek = wasmExports['lseek'];
  Module['_tolower'] = _tolower = wasmExports['tolower'];
  Module['_strncpy'] = _strncpy = wasmExports['strncpy'];
  Module['_g_log_default_handler'] = _g_log_default_handler = wasmExports['g_log_default_handler'];
  Module['_g_log_writer_default'] = _g_log_writer_default = wasmExports['g_log_writer_default'];
  Module['__emscripten_tls_init'] = __emscripten_tls_init = wasmExports['_emscripten_tls_init'];
  Module['_getc'] = _getc = wasmExports['getc'];
  Module['_fscanf'] = _fscanf = wasmExports['fscanf'];
  Module['_nl_langinfo'] = _nl_langinfo = wasmExports['nl_langinfo'];
  Module['_strstr'] = _strstr = wasmExports['strstr'];
  Module['_iconv_open'] = _iconv_open = wasmExports['iconv_open'];
  Module['_iconv'] = _iconv = wasmExports['iconv'];
  Module['_iconv_close'] = _iconv_close = wasmExports['iconv_close'];
  Module['_memchr'] = _memchr = wasmExports['memchr'];
  Module['_setlocale'] = _setlocale = wasmExports['setlocale'];
  Module['_getenv'] = _getenv = wasmExports['getenv'];
  Module['_stat'] = _stat = wasmExports['stat'];
  Module['_getcwd'] = _getcwd = wasmExports['getcwd'];
  Module['_bindtextdomain'] = _bindtextdomain = wasmExports['bindtextdomain'];
  Module['_bind_textdomain_codeset'] = _bind_textdomain_codeset = wasmExports['bind_textdomain_codeset'];
  Module['_dgettext'] = _dgettext = wasmExports['dgettext'];
  Module['_textdomain'] = _textdomain = wasmExports['textdomain'];
  Module['_gettext'] = _gettext = wasmExports['gettext'];
  Module['_gettimeofday'] = _gettimeofday = wasmExports['gettimeofday'];
  Module['_strcasecmp'] = _strcasecmp = wasmExports['strcasecmp'];
  Module['_strpbrk'] = _strpbrk = wasmExports['strpbrk'];
  Module['_raise'] = _raise = wasmExports['raise'];
  Module['__exit'] = __exit = wasmExports['_exit'];
  Module['_strcat'] = _strcat = wasmExports['strcat'];
  Module['_getpid'] = _getpid = wasmExports['getpid'];
  Module['_vsnprintf'] = _vsnprintf = wasmExports['vsnprintf'];
  Module['_isatty'] = _isatty = wasmExports['isatty'];
  Module['_tzset'] = _tzset = wasmExports['tzset'];
  Module['_localtime_r'] = _localtime_r = wasmExports['localtime_r'];
  Module['_strftime'] = _strftime = wasmExports['strftime'];
  Module['_memmem'] = _memmem = wasmExports['memmem'];
  Module['_strtol'] = _strtol = wasmExports['strtol'];
  Module['_unlink'] = _unlink = wasmExports['unlink'];
  Module['_stpcpy'] = _stpcpy = wasmExports['stpcpy'];
  Module['_snprintf'] = _snprintf = wasmExports['snprintf'];
  Module['_strerror_r'] = _strerror_r = wasmExports['strerror_r'];
  Module['_pthread_mutex_destroy'] = _pthread_mutex_destroy = wasmExports['pthread_mutex_destroy'];
  Module['_pthread_create'] = _pthread_create = wasmExports['pthread_create'];
  Module['_pthread_mutex_init'] = _pthread_mutex_init = wasmExports['pthread_mutex_init'];
  Module['_pthread_mutex_lock'] = _pthread_mutex_lock = wasmExports['pthread_mutex_lock'];
  Module['_pthread_mutex_unlock'] = _pthread_mutex_unlock = wasmExports['pthread_mutex_unlock'];
  Module['_pthread_setspecific'] = _pthread_setspecific = wasmExports['pthread_setspecific'];
  Module['_pthread_cond_destroy'] = _pthread_cond_destroy = wasmExports['pthread_cond_destroy'];
  Module['_pthread_cond_broadcast'] = _pthread_cond_broadcast = wasmExports['pthread_cond_broadcast'];
  Module['_pthread_cond_wait'] = _pthread_cond_wait = wasmExports['pthread_cond_wait'];
  Module['_pthread_getspecific'] = _pthread_getspecific = wasmExports['pthread_getspecific'];
  Module['_pthread_rwlock_init'] = _pthread_rwlock_init = wasmExports['pthread_rwlock_init'];
  Module['_pthread_rwlock_destroy'] = _pthread_rwlock_destroy = wasmExports['pthread_rwlock_destroy'];
  Module['_pthread_rwlock_unlock'] = _pthread_rwlock_unlock = wasmExports['pthread_rwlock_unlock'];
  Module['_pthread_rwlock_rdlock'] = _pthread_rwlock_rdlock = wasmExports['pthread_rwlock_rdlock'];
  Module['_strerror'] = _strerror = wasmExports['strerror'];
  Module['_pthread_condattr_init'] = _pthread_condattr_init = wasmExports['pthread_condattr_init'];
  Module['_pthread_condattr_setclock'] = _pthread_condattr_setclock = wasmExports['pthread_condattr_setclock'];
  Module['_pthread_cond_init'] = _pthread_cond_init = wasmExports['pthread_cond_init'];
  Module['_pthread_condattr_destroy'] = _pthread_condattr_destroy = wasmExports['pthread_condattr_destroy'];
  Module['_pthread_key_create'] = _pthread_key_create = wasmExports['pthread_key_create'];
  Module['_pthread_key_delete'] = _pthread_key_delete = wasmExports['pthread_key_delete'];
  Module['_strtoul'] = _strtoul = wasmExports['strtoul'];
  Module['_vasprintf'] = _vasprintf = wasmExports['vasprintf'];
  Module['_ntohs'] = _ntohs = wasmExports['ntohs'];
  Module['_inflateEnd'] = _inflateEnd = wasmExports['inflateEnd'];
  Module['_inflateInit2_'] = _inflateInit2_ = wasmExports['inflateInit2_'];
  Module['_inflate'] = _inflate = wasmExports['inflate'];
  Module['___small_fprintf'] = ___small_fprintf = wasmExports['__small_fprintf'];
  Module['_rand'] = _rand = wasmExports['rand'];
  Module['_exp2'] = _exp2 = wasmExports['exp2'];
  Module['_SharpYuvConvert'] = _SharpYuvConvert = wasmExports['SharpYuvConvert'];
  Module['_SharpYuvComputeConversionMatrix'] = _SharpYuvComputeConversionMatrix = wasmExports['SharpYuvComputeConversionMatrix'];
  Module['_expf'] = _expf = wasmExports['expf'];
  Module['_cmsSetLogErrorHandlerTHR'] = _cmsSetLogErrorHandlerTHR = wasmExports['cmsSetLogErrorHandlerTHR'];
  Module['_fseek'] = _fseek = wasmExports['fseek'];
  Module['_cmsEstimateGamma'] = _cmsEstimateGamma = wasmExports['cmsEstimateGamma'];
  Module['_cmsOpenProfileFromMemTHR'] = _cmsOpenProfileFromMemTHR = wasmExports['cmsOpenProfileFromMemTHR'];
  Module['_cmsReadRawTag'] = _cmsReadRawTag = wasmExports['cmsReadRawTag'];
  Module['_wcslen'] = _wcslen = wasmExports['wcslen'];
  Module['_cmsXYZ2xyY'] = _cmsXYZ2xyY = wasmExports['cmsXYZ2xyY'];
  Module['_cmsCreateExtendedTransform'] = _cmsCreateExtendedTransform = wasmExports['cmsCreateExtendedTransform'];
  Module['_cmsCreateTransformTHR'] = _cmsCreateTransformTHR = wasmExports['cmsCreateTransformTHR'];
  Module['_cmsCreateXYZProfileTHR'] = _cmsCreateXYZProfileTHR = wasmExports['cmsCreateXYZProfileTHR'];
  Module['_cmsCreateContext'] = _cmsCreateContext = wasmExports['cmsCreateContext'];
  Module['_cmsAdaptToIlluminant'] = _cmsAdaptToIlluminant = wasmExports['cmsAdaptToIlluminant'];
  Module['_emscripten_builtin_free'] = _emscripten_builtin_free = wasmExports['emscripten_builtin_free'];
  Module['_emscripten_builtin_memalign'] = _emscripten_builtin_memalign = wasmExports['emscripten_builtin_memalign'];
  Module['_emscripten_builtin_malloc'] = _emscripten_builtin_malloc = wasmExports['emscripten_builtin_malloc'];
  Module['_emscripten_futex_wake'] = _emscripten_futex_wake = wasmExports['emscripten_futex_wake'];
  Module['_emscripten_futex_wait'] = _emscripten_futex_wait = wasmExports['emscripten_futex_wait'];
  Module['_sqrt'] = _sqrt = wasmExports['sqrt'];
  Module['_acosf'] = _acosf = wasmExports['acosf'];
  Module['_log1p'] = _log1p = wasmExports['log1p'];
  Module['_atan2f'] = _atan2f = wasmExports['atan2f'];
  Module['___funcs_on_exit'] = ___funcs_on_exit = wasmExports['__funcs_on_exit'];
  Module['___libc_calloc'] = ___libc_calloc = wasmExports['__libc_calloc'];
  Module['___libc_free'] = ___libc_free = wasmExports['__libc_free'];
  Module['___libc_malloc'] = ___libc_malloc = wasmExports['__libc_malloc'];
  Module['___dl_seterr'] = ___dl_seterr = wasmExports['__dl_seterr'];
  Module['__emscripten_dlsync_self_async'] = __emscripten_dlsync_self_async = wasmExports['_emscripten_dlsync_self_async'];
  Module['__emscripten_dlsync_self'] = __emscripten_dlsync_self = wasmExports['_emscripten_dlsync_self'];
  Module['__emscripten_proxy_dlsync_async'] = __emscripten_proxy_dlsync_async = wasmExports['_emscripten_proxy_dlsync_async'];
  Module['__emscripten_proxy_dlsync'] = __emscripten_proxy_dlsync = wasmExports['_emscripten_proxy_dlsync'];
  Module['__emscripten_find_dylib'] = __emscripten_find_dylib = wasmExports['_emscripten_find_dylib'];
  Module['__emscripten_thread_init'] = __emscripten_thread_init = wasmExports['_emscripten_thread_init'];
  Module['__emscripten_thread_crashed'] = __emscripten_thread_crashed = wasmExports['_emscripten_thread_crashed'];
  Module['_getentropy'] = _getentropy = wasmExports['getentropy'];
  Module['_htons'] = _htons = wasmExports['htons'];
  Module['_htonl'] = _htonl = wasmExports['htonl'];
  Module['_sqrtf'] = _sqrtf = wasmExports['sqrtf'];
  Module['_llroundf'] = _llroundf = wasmExports['llroundf'];
  Module['_log1pf'] = _log1pf = wasmExports['log1pf'];
  Module['_log2f'] = _log2f = wasmExports['log2f'];
  Module['_lrint'] = _lrint = wasmExports['lrint'];
  Module['_lroundf'] = _lroundf = wasmExports['lroundf'];
  Module['_modff'] = _modff = wasmExports['modff'];
  Module['__emscripten_run_on_main_thread_js'] = __emscripten_run_on_main_thread_js = wasmExports['_emscripten_run_on_main_thread_js'];
  Module['__emscripten_thread_free_data'] = __emscripten_thread_free_data = wasmExports['_emscripten_thread_free_data'];
  Module['__emscripten_thread_exit'] = __emscripten_thread_exit = wasmExports['_emscripten_thread_exit'];
  Module['_remainder'] = _remainder = wasmExports['remainder'];
  Module['_round'] = _round = wasmExports['round'];
  Module['_roundf'] = _roundf = wasmExports['roundf'];
  Module['_strndup'] = _strndup = wasmExports['strndup'];
  Module['__emscripten_check_mailbox'] = __emscripten_check_mailbox = wasmExports['_emscripten_check_mailbox'];
  Module['_wmemchr'] = _wmemchr = wasmExports['wmemchr'];
  Module['_writev'] = _writev = wasmExports['writev'];
  Module['__ZdlPvmSt11align_val_t'] = __ZdlPvmSt11align_val_t = wasmExports['_ZdlPvmSt11align_val_t'];
  Module['__ZdaPv'] = __ZdaPv = wasmExports['_ZdaPv'];
  Module['__ZdaPvm'] = __ZdaPvm = wasmExports['_ZdaPvm'];
  Module['__ZdlPvm'] = __ZdlPvm = wasmExports['_ZdlPvm'];
  Module['__Znaj'] = __Znaj = wasmExports['_Znaj'];
  Module['__ZnajSt11align_val_t'] = __ZnajSt11align_val_t = wasmExports['_ZnajSt11align_val_t'];
  Module['__Znwj'] = __Znwj = wasmExports['_Znwj'];
  Module['__ZnwjSt11align_val_t'] = __ZnwjSt11align_val_t = wasmExports['_ZnwjSt11align_val_t'];
  Module['___libc_realloc'] = ___libc_realloc = wasmExports['__libc_realloc'];
  Module['_emscripten_builtin_calloc'] = _emscripten_builtin_calloc = wasmExports['emscripten_builtin_calloc'];
  Module['_emscripten_builtin_realloc'] = _emscripten_builtin_realloc = wasmExports['emscripten_builtin_realloc'];
  Module['_malloc_size'] = _malloc_size = wasmExports['malloc_size'];
  Module['_malloc_usable_size'] = _malloc_usable_size = wasmExports['malloc_usable_size'];
  Module['_reallocf'] = _reallocf = wasmExports['reallocf'];
  Module['_setThrew'] = _setThrew = wasmExports['setThrew'];
  Module['__emscripten_tempret_set'] = __emscripten_tempret_set = wasmExports['_emscripten_tempret_set'];
  Module['__emscripten_tempret_get'] = __emscripten_tempret_get = wasmExports['_emscripten_tempret_get'];
  Module['_emscripten_stack_set_limits'] = _emscripten_stack_set_limits = wasmExports['emscripten_stack_set_limits'];
  Module['__emscripten_stack_restore'] = __emscripten_stack_restore = wasmExports['_emscripten_stack_restore'];
  Module['__emscripten_stack_alloc'] = __emscripten_stack_alloc = wasmExports['_emscripten_stack_alloc'];
  Module['_emscripten_stack_get_current'] = _emscripten_stack_get_current = wasmExports['emscripten_stack_get_current'];
  Module['__ZNSt3__26__sortIRNS_6__lessIiiEEPiEEvT0_S5_T_'] = __ZNSt3__26__sortIRNS_6__lessIiiEEPiEEvT0_S5_T_ = wasmExports['_ZNSt3__26__sortIRNS_6__lessIiiEEPiEEvT0_S5_T_'];
  Module['__ZNSt3__26__sortIRNS_6__lessImmEEPmEEvT0_S5_T_'] = __ZNSt3__26__sortIRNS_6__lessImmEEPmEEvT0_S5_T_ = wasmExports['_ZNSt3__26__sortIRNS_6__lessImmEEPmEEvT0_S5_T_'];
  Module['__ZNSt3__26__sortIRNS_6__lessIffEEPfEEvT0_S5_T_'] = __ZNSt3__26__sortIRNS_6__lessIffEEPfEEvT0_S5_T_ = wasmExports['_ZNSt3__26__sortIRNS_6__lessIffEEPfEEvT0_S5_T_'];
  Module['__ZNSt3__218condition_variable10notify_oneEv'] = __ZNSt3__218condition_variable10notify_oneEv = wasmExports['_ZNSt3__218condition_variable10notify_oneEv'];
  Module['__ZNSt3__218condition_variable10notify_allEv'] = __ZNSt3__218condition_variable10notify_allEv = wasmExports['_ZNSt3__218condition_variable10notify_allEv'];
  Module['__ZNSt3__218condition_variable4waitERNS_11unique_lockINS_5mutexEEE'] = __ZNSt3__218condition_variable4waitERNS_11unique_lockINS_5mutexEEE = wasmExports['_ZNSt3__218condition_variable4waitERNS_11unique_lockINS_5mutexEEE'];
  Module['__ZNSt3__218condition_variableD1Ev'] = __ZNSt3__218condition_variableD1Ev = wasmExports['_ZNSt3__218condition_variableD1Ev'];
  Module['__ZNSt3__212__next_primeEm'] = __ZNSt3__212__next_primeEm = wasmExports['_ZNSt3__212__next_primeEm'];
  Module['__ZNSt3__29basic_iosIcNS_11char_traitsIcEEED2Ev'] = __ZNSt3__29basic_iosIcNS_11char_traitsIcEEED2Ev = wasmExports['_ZNSt3__29basic_iosIcNS_11char_traitsIcEEED2Ev'];
  Module['__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE5flushEv'] = __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE5flushEv = wasmExports['_ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE5flushEv'];
  Module['__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE6sentryC1ERS3_'] = __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE6sentryC1ERS3_ = wasmExports['_ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE6sentryC1ERS3_'];
  Module['__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE6sentryD1Ev'] = __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE6sentryD1Ev = wasmExports['_ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE6sentryD1Ev'];
  Module['__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEED2Ev'] = __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEED2Ev = wasmExports['_ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEED2Ev'];
  Module['__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEb'] = __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEb = wasmExports['_ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEb'];
  Module['__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEt'] = __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEt = wasmExports['_ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEt'];
  Module['__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEi'] = __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEi = wasmExports['_ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEi'];
  Module['__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEj'] = __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEj = wasmExports['_ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEj'];
  Module['__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEm'] = __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEm = wasmExports['_ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEm'];
  Module['__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEy'] = __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEy = wasmExports['_ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEy'];
  Module['__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEf'] = __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEf = wasmExports['_ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEf'];
  Module['__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEd'] = __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEd = wasmExports['_ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEElsEd'];
  Module['__ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE3putEc'] = __ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE3putEc = wasmExports['_ZNSt3__213basic_ostreamIcNS_11char_traitsIcEEE3putEc'];
  Module['__ZNSt3__214basic_iostreamIcNS_11char_traitsIcEEED2Ev'] = __ZNSt3__214basic_iostreamIcNS_11char_traitsIcEEED2Ev = wasmExports['_ZNSt3__214basic_iostreamIcNS_11char_traitsIcEEED2Ev'];
  Module['__ZNKSt3__28ios_base6getlocEv'] = __ZNKSt3__28ios_base6getlocEv = wasmExports['_ZNKSt3__28ios_base6getlocEv'];
  Module['__ZNSt3__28ios_base5clearEj'] = __ZNSt3__28ios_base5clearEj = wasmExports['_ZNSt3__28ios_base5clearEj'];
  Module['__ZNSt3__28ios_base4initEPv'] = __ZNSt3__28ios_base4initEPv = wasmExports['_ZNSt3__28ios_base4initEPv'];
  Module['__ZNSt3__28ios_base33__set_badbit_and_consider_rethrowEv'] = __ZNSt3__28ios_base33__set_badbit_and_consider_rethrowEv = wasmExports['_ZNSt3__28ios_base33__set_badbit_and_consider_rethrowEv'];
  Module['__ZNSt3__26localeD1Ev'] = __ZNSt3__26localeD1Ev = wasmExports['_ZNSt3__26localeD1Ev'];
  Module['__ZNKSt3__26locale9use_facetERNS0_2idE'] = __ZNKSt3__26locale9use_facetERNS0_2idE = wasmExports['_ZNKSt3__26locale9use_facetERNS0_2idE'];
  Module['__ZNSt3__26localeC1Ev'] = __ZNSt3__26localeC1Ev = wasmExports['_ZNSt3__26localeC1Ev'];
  Module['__ZNSt3__212bad_weak_ptrD1Ev'] = __ZNSt3__212bad_weak_ptrD1Ev = wasmExports['_ZNSt3__212bad_weak_ptrD1Ev'];
  Module['__ZNSt3__219__shared_weak_count14__release_weakEv'] = __ZNSt3__219__shared_weak_count14__release_weakEv = wasmExports['_ZNSt3__219__shared_weak_count14__release_weakEv'];
  Module['__ZNSt3__219__shared_weak_count4lockEv'] = __ZNSt3__219__shared_weak_count4lockEv = wasmExports['_ZNSt3__219__shared_weak_count4lockEv'];
  Module['__ZNKSt3__219__shared_weak_count13__get_deleterERKSt9type_info'] = __ZNKSt3__219__shared_weak_count13__get_deleterERKSt9type_info = wasmExports['_ZNKSt3__219__shared_weak_count13__get_deleterERKSt9type_info'];
  Module['__ZNSt3__219__shared_weak_countD2Ev'] = __ZNSt3__219__shared_weak_countD2Ev = wasmExports['_ZNSt3__219__shared_weak_countD2Ev'];
  Module['__ZNSt3__25mutex4lockEv'] = __ZNSt3__25mutex4lockEv = wasmExports['_ZNSt3__25mutex4lockEv'];
  Module['__ZNSt3__25mutex6unlockEv'] = __ZNSt3__25mutex6unlockEv = wasmExports['_ZNSt3__25mutex6unlockEv'];
  Module['__ZNSt3__25mutexD1Ev'] = __ZNSt3__25mutexD1Ev = wasmExports['_ZNSt3__25mutexD1Ev'];
  Module['__ZnwmRKSt9nothrow_t'] = __ZnwmRKSt9nothrow_t = wasmExports['_ZnwmRKSt9nothrow_t'];
  Module['__Znam'] = __Znam = wasmExports['_Znam'];
  Module['__ZnamRKSt9nothrow_t'] = __ZnamRKSt9nothrow_t = wasmExports['_ZnamRKSt9nothrow_t'];
  Module['__ZnwmSt11align_val_t'] = __ZnwmSt11align_val_t = wasmExports['_ZnwmSt11align_val_t'];
  Module['__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_externalEPKcm'] = __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_externalEPKcm = wasmExports['_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_externalEPKcm'];
  Module['__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_externalEPKc'] = __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_externalEPKc = wasmExports['_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE17__assign_externalEPKc'];
  Module['__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc'] = __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc = wasmExports['_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE9push_backEc'];
  Module['__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEmc'] = __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEmc = wasmExports['_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6appendEmc'];
  Module['__ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEmc'] = __ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEmc = wasmExports['_ZNSt3__212basic_stringIcNS_11char_traitsIcEENS_9allocatorIcEEE6resizeEmc'];
  Module['__ZNSt12out_of_rangeD1Ev'] = __ZNSt12out_of_rangeD1Ev = wasmExports['_ZNSt12out_of_rangeD1Ev'];
  Module['__ZNSt3__220__throw_system_errorEiPKc'] = __ZNSt3__220__throw_system_errorEiPKc = wasmExports['_ZNSt3__220__throw_system_errorEiPKc'];
  Module['__ZNSt3__26thread4joinEv'] = __ZNSt3__26thread4joinEv = wasmExports['_ZNSt3__26thread4joinEv'];
  Module['__ZNSt3__26thread20hardware_concurrencyEv'] = __ZNSt3__26thread20hardware_concurrencyEv = wasmExports['_ZNSt3__26thread20hardware_concurrencyEv'];
  Module['__ZNSt3__219__thread_local_dataEv'] = __ZNSt3__219__thread_local_dataEv = wasmExports['_ZNSt3__219__thread_local_dataEv'];
  Module['__ZNSt3__215__thread_structD1Ev'] = __ZNSt3__215__thread_structD1Ev = wasmExports['_ZNSt3__215__thread_structD1Ev'];
  Module['__ZNSt3__26threadD1Ev'] = __ZNSt3__26threadD1Ev = wasmExports['_ZNSt3__26threadD1Ev'];
  Module['__ZNSt3__215__thread_structC1Ev'] = __ZNSt3__215__thread_structC1Ev = wasmExports['_ZNSt3__215__thread_structC1Ev'];
  Module['___cxa_increment_exception_refcount'] = ___cxa_increment_exception_refcount = wasmExports['__cxa_increment_exception_refcount'];
  Module['___cxa_decrement_exception_refcount'] = ___cxa_decrement_exception_refcount = wasmExports['__cxa_decrement_exception_refcount'];
  Module['___get_exception_message'] = ___get_exception_message = wasmExports['__get_exception_message'];
  Module['___cxa_guard_acquire'] = ___cxa_guard_acquire = wasmExports['__cxa_guard_acquire'];
  Module['___cxa_guard_release'] = ___cxa_guard_release = wasmExports['__cxa_guard_release'];
  Module['___cxa_pure_virtual'] = ___cxa_pure_virtual = wasmExports['__cxa_pure_virtual'];
  Module['___dynamic_cast'] = ___dynamic_cast = wasmExports['__dynamic_cast'];
  Module['___cxa_can_catch'] = ___cxa_can_catch = wasmExports['__cxa_can_catch'];
  Module['___cxa_get_exception_ptr'] = ___cxa_get_exception_ptr = wasmExports['__cxa_get_exception_ptr'];
  Module['___wasm_apply_data_relocs'] = ___wasm_apply_data_relocs = wasmExports['__wasm_apply_data_relocs'];
}
var ___THREW__ = Module['___THREW__'] = 1204;
var __ZTISt12length_error = Module['__ZTISt12length_error'] = 1443976;
var __ZTVSt12length_error = Module['__ZTVSt12length_error'] = 1443956;
var __ZTVN10__cxxabiv120__si_class_type_infoE = Module['__ZTVN10__cxxabiv120__si_class_type_infoE'] = 1443648;
var __ZTVN10__cxxabiv117__class_type_infoE = Module['__ZTVN10__cxxabiv117__class_type_infoE'] = 1443608;
var __ZTISt20bad_array_new_length = Module['__ZTISt20bad_array_new_length'] = 1443848;
var ___threwValue = Module['___threwValue'] = 1208;
var _stdout = Module['_stdout'] = 1429520;
var _stderr = Module['_stderr'] = 1429368;
var _g_mem_gc_friendly = Module['_g_mem_gc_friendly'] = 3365180;
var _g_utf8_skip = Module['_g_utf8_skip'] = 1372468;
var __ZTVNSt3__215basic_streambufIcNS_11char_traitsIcEEEE = Module['__ZTVNSt3__215basic_streambufIcNS_11char_traitsIcEEEE'] = 1447072;
var __ZTVNSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEEE = Module['__ZTVNSt3__215basic_stringbufIcNS_11char_traitsIcEENS_9allocatorIcEEEE'] = 1447480;
var __ZTTNSt3__218basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE = Module['__ZTTNSt3__218basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE'] = 1447896;
var __ZTTNSt3__219basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE = Module['__ZTTNSt3__219basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE'] = 1448128;
var __ZTVNSt3__218basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE = Module['__ZTVNSt3__218basic_stringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE'] = 1447836;
var __ZTVNSt3__219basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE = Module['__ZTVNSt3__219basic_ostringstreamIcNS_11char_traitsIcEENS_9allocatorIcEEEE'] = 1448088;
var __ZNSt3__24coutE = Module['__ZNSt3__24coutE'] = 3415632;
var __ZNSt3__24cerrE = Module['__ZNSt3__24cerrE'] = 3415808;
var __ZNSt3__25ctypeIcE2idE = Module['__ZNSt3__25ctypeIcE2idE'] = 3412840;
var __ZTINSt3__219__shared_weak_countE = Module['__ZTINSt3__219__shared_weak_countE'] = 1444132;
var __ZTVNSt3__212bad_weak_ptrE = Module['__ZTVNSt3__212bad_weak_ptrE'] = 1444156;
var __ZTINSt3__212bad_weak_ptrE = Module['__ZTINSt3__212bad_weak_ptrE'] = 1444176;
var __ZSt7nothrow = Module['__ZSt7nothrow'] = 948324;
var __ZTISt12out_of_range = Module['__ZTISt12out_of_range'] = 1444008;
var __ZTVSt12out_of_range = Module['__ZTVSt12out_of_range'] = 1443988;
var __ZTVN10__cxxabiv121__vmi_class_type_infoE = Module['__ZTVN10__cxxabiv121__vmi_class_type_infoE'] = 1443700;  var wasmImports;
  function assignWasmImports() {
    wasmImports = {
    /** @export */
    __assert_fail: ___assert_fail,
    /** @export */
    __call_sighandler: ___call_sighandler,
    /** @export */
    __cxa_begin_catch: ___cxa_begin_catch,
    /** @export */
    __cxa_end_catch: ___cxa_end_catch,
    /** @export */
    __cxa_find_matching_catch_2: ___cxa_find_matching_catch_2,
    /** @export */
    __cxa_find_matching_catch_3: ___cxa_find_matching_catch_3,
    /** @export */
    __cxa_rethrow: ___cxa_rethrow,
    /** @export */
    __cxa_throw: ___cxa_throw,
    /** @export */
    __cxa_uncaught_exceptions: ___cxa_uncaught_exceptions,
    /** @export */
    __heap_base: ___heap_base,
    /** @export */
    __indirect_function_table: wasmTable,
    /** @export */
    __lsan_ignore_object: ___lsan_ignore_object,
    /** @export */
    __memory_base: ___memory_base,
    /** @export */
    __pthread_create_js: ___pthread_create_js,
    /** @export */
    __resumeException: ___resumeException,
    /** @export */
    __stack_high: ___stack_high,
    /** @export */
    __stack_low: ___stack_low,
    /** @export */
    __stack_pointer: ___stack_pointer,
    /** @export */
    __syscall_dup: ___syscall_dup,
    /** @export */
    __syscall_faccessat: ___syscall_faccessat,
    /** @export */
    __syscall_fcntl64: ___syscall_fcntl64,
    /** @export */
    __syscall_fstat64: ___syscall_fstat64,
    /** @export */
    __syscall_ftruncate64: ___syscall_ftruncate64,
    /** @export */
    __syscall_getcwd: ___syscall_getcwd,
    /** @export */
    __syscall_ioctl: ___syscall_ioctl,
    /** @export */
    __syscall_lstat64: ___syscall_lstat64,
    /** @export */
    __syscall_newfstatat: ___syscall_newfstatat,
    /** @export */
    __syscall_openat: ___syscall_openat,
    /** @export */
    __syscall_poll: ___syscall_poll,
    /** @export */
    __syscall_rmdir: ___syscall_rmdir,
    /** @export */
    __syscall_stat64: ___syscall_stat64,
    /** @export */
    __syscall_unlinkat: ___syscall_unlinkat,
    /** @export */
    __table_base: ___table_base,
    /** @export */
    _abort_js: __abort_js,
    /** @export */
    _dlopen_js: __dlopen_js,
    /** @export */
    _dlsym_catchup_js: __dlsym_catchup_js,
    /** @export */
    _dlsym_js: __dlsym_js,
    /** @export */
    _embind_finalize_value_object: __embind_finalize_value_object,
    /** @export */
    _embind_register_arithmetic_vector: __embind_register_arithmetic_vector,
    /** @export */
    _embind_register_bigint: __embind_register_bigint,
    /** @export */
    _embind_register_bool: __embind_register_bool,
    /** @export */
    _embind_register_class: __embind_register_class,
    /** @export */
    _embind_register_class_class_function: __embind_register_class_class_function,
    /** @export */
    _embind_register_class_constructor: __embind_register_class_constructor,
    /** @export */
    _embind_register_class_function: __embind_register_class_function,
    /** @export */
    _embind_register_class_property: __embind_register_class_property,
    /** @export */
    _embind_register_emval: __embind_register_emval,
    /** @export */
    _embind_register_enum: __embind_register_enum,
    /** @export */
    _embind_register_enum_value: __embind_register_enum_value,
    /** @export */
    _embind_register_float: __embind_register_float,
    /** @export */
    _embind_register_function: __embind_register_function,
    /** @export */
    _embind_register_integer: __embind_register_integer,
    /** @export */
    _embind_register_memory_view: __embind_register_memory_view,
    /** @export */
    _embind_register_std_string: __embind_register_std_string,
    /** @export */
    _embind_register_std_wstring: __embind_register_std_wstring,
    /** @export */
    _embind_register_value_object: __embind_register_value_object,
    /** @export */
    _embind_register_value_object_field: __embind_register_value_object_field,
    /** @export */
    _embind_register_void: __embind_register_void,
    /** @export */
    _emscripten_dlopen_js: __emscripten_dlopen_js,
    /** @export */
    _emscripten_dlsync_threads: __emscripten_dlsync_threads,
    /** @export */
    _emscripten_dlsync_threads_async: __emscripten_dlsync_threads_async,
    /** @export */
    _emscripten_get_dynamic_libraries_js: __emscripten_get_dynamic_libraries_js,
    /** @export */
    _emscripten_init_main_thread_js: __emscripten_init_main_thread_js,
    /** @export */
    _emscripten_notify_mailbox_postmessage: __emscripten_notify_mailbox_postmessage,
    /** @export */
    _emscripten_receive_on_main_thread_js: __emscripten_receive_on_main_thread_js,
    /** @export */
    _emscripten_runtime_keepalive_clear: __emscripten_runtime_keepalive_clear,
    /** @export */
    _emscripten_thread_cleanup: __emscripten_thread_cleanup,
    /** @export */
    _emscripten_thread_exit_joinable: __emscripten_thread_exit_joinable,
    /** @export */
    _emscripten_thread_mailbox_await: __emscripten_thread_mailbox_await,
    /** @export */
    _emscripten_thread_set_strongref: __emscripten_thread_set_strongref,
    /** @export */
    _emscripten_throw_longjmp: __emscripten_throw_longjmp,
    /** @export */
    _emval_as: __emval_as,
    /** @export */
    _emval_call: __emval_call,
    /** @export */
    _emval_decref: __emval_decref,
    /** @export */
    _emval_get_global: __emval_get_global,
    /** @export */
    _emval_get_method_caller: __emval_get_method_caller,
    /** @export */
    _emval_get_module_property: __emval_get_module_property,
    /** @export */
    _emval_get_property: __emval_get_property,
    /** @export */
    _emval_incref: __emval_incref,
    /** @export */
    _emval_instanceof: __emval_instanceof,
    /** @export */
    _emval_is_number: __emval_is_number,
    /** @export */
    _emval_is_string: __emval_is_string,
    /** @export */
    _emval_new_cstring: __emval_new_cstring,
    /** @export */
    _emval_run_destructors: __emval_run_destructors,
    /** @export */
    _emval_set_property: __emval_set_property,
    /** @export */
    _emval_take_value: __emval_take_value,
    /** @export */
    _emval_typeof: __emval_typeof,
    /** @export */
    _gmtime_js: __gmtime_js,
    /** @export */
    _localtime_js: __localtime_js,
    /** @export */
    _mmap_js: __mmap_js,
    /** @export */
    _munmap_js: __munmap_js,
    /** @export */
    _tzset_js: __tzset_js,
    /** @export */
    clock_time_get: _clock_time_get,
    /** @export */
    emscripten_check_blocking_allowed: _emscripten_check_blocking_allowed,
    /** @export */
    emscripten_date_now: _emscripten_date_now,
    /** @export */
    emscripten_err: _emscripten_err,
    /** @export */
    emscripten_exit_with_live_runtime: _emscripten_exit_with_live_runtime,
    /** @export */
    emscripten_get_heap_max: _emscripten_get_heap_max,
    /** @export */
    emscripten_get_now: _emscripten_get_now,
    /** @export */
    emscripten_num_logical_cores: _emscripten_num_logical_cores,
    /** @export */
    emscripten_promise_destroy: _emscripten_promise_destroy,
    /** @export */
    emscripten_promise_resolve: _emscripten_promise_resolve,
    /** @export */
    emscripten_resize_heap: _emscripten_resize_heap,
    /** @export */
    environ_get: _environ_get,
    /** @export */
    environ_sizes_get: _environ_sizes_get,
    /** @export */
    exit: _exit,
    /** @export */
    fd_close: _fd_close,
    /** @export */
    fd_fdstat_get: _fd_fdstat_get,
    /** @export */
    fd_read: _fd_read,
    /** @export */
    fd_seek: _fd_seek,
    /** @export */
    fd_write: _fd_write,
    /** @export */
    ffi_call_js,
    /** @export */
    heif_color_conversion_options_ext_copy: _heif_color_conversion_options_ext_copy,
    /** @export */
    heif_color_conversion_options_ext_free: _heif_color_conversion_options_ext_free,
    /** @export */
    heif_context_add_XMP_metadata: _heif_context_add_XMP_metadata,
    /** @export */
    heif_context_add_exif_metadata: _heif_context_add_exif_metadata,
    /** @export */
    heif_encoding_options_alloc: _heif_encoding_options_alloc,
    /** @export */
    heif_encoding_options_free: _heif_encoding_options_free,
    /** @export */
    heif_error_success: _heif_error_success,
    /** @export */
    heif_image_get_bits_per_pixel_range: _heif_image_get_bits_per_pixel_range,
    /** @export */
    heif_image_get_chroma_format: _heif_image_get_chroma_format,
    /** @export */
    heif_image_get_nclx_color_profile: _heif_image_get_nclx_color_profile,
    /** @export */
    heif_image_get_plane_readonly2: _heif_image_get_plane_readonly2,
    /** @export */
    heif_image_release: _heif_image_release,
    /** @export */
    heif_nclx_color_profile_free: _heif_nclx_color_profile_free,
    /** @export */
    heif_tai_clock_info_release: _heif_tai_clock_info_release,
    /** @export */
    heif_tai_timestamp_packet_alloc: _heif_tai_timestamp_packet_alloc,
    /** @export */
    heif_tai_timestamp_packet_copy: _heif_tai_timestamp_packet_copy,
    /** @export */
    heif_tai_timestamp_packet_release: _heif_tai_timestamp_packet_release,
    /** @export */
    invoke_di,
    /** @export */
    invoke_dii,
    /** @export */
    invoke_diii,
    /** @export */
    invoke_diiii,
    /** @export */
    invoke_fiii,
    /** @export */
    invoke_i,
    /** @export */
    invoke_ii,
    /** @export */
    invoke_iii,
    /** @export */
    invoke_iiid,
    /** @export */
    invoke_iiii,
    /** @export */
    invoke_iiiii,
    /** @export */
    invoke_iiiiid,
    /** @export */
    invoke_iiiiii,
    /** @export */
    invoke_iiiiiii,
    /** @export */
    invoke_iiiiiiii,
    /** @export */
    invoke_iiiiiiiiiii,
    /** @export */
    invoke_iiiiiiiiiiii,
    /** @export */
    invoke_iiiiiiiiiiiii,
    /** @export */
    invoke_iiiiij,
    /** @export */
    invoke_ji,
    /** @export */
    invoke_jiiii,
    /** @export */
    invoke_v,
    /** @export */
    invoke_vi,
    /** @export */
    invoke_vid,
    /** @export */
    invoke_viddi,
    /** @export */
    invoke_vii,
    /** @export */
    invoke_viid,
    /** @export */
    invoke_viidd,
    /** @export */
    invoke_viiddi,
    /** @export */
    invoke_viidi,
    /** @export */
    invoke_viii,
    /** @export */
    invoke_viiid,
    /** @export */
    invoke_viiidddddi,
    /** @export */
    invoke_viiiddddi,
    /** @export */
    invoke_viiidddi,
    /** @export */
    invoke_viiiddi,
    /** @export */
    invoke_viiidi,
    /** @export */
    invoke_viiii,
    /** @export */
    invoke_viiiii,
    /** @export */
    invoke_viiiiii,
    /** @export */
    invoke_viiiiiii,
    /** @export */
    invoke_viiiiiiii,
    /** @export */
    invoke_viiiiiiiii,
    /** @export */
    invoke_viiiiiiiiii,
    /** @export */
    invoke_viiiiiiiiiii,
    /** @export */
    invoke_viiiiiiiiiiii,
    /** @export */
    invoke_viiiiiiiiiiiii,
    /** @export */
    invoke_viiiiiiiiiiiiiii,
    /** @export */
    memory: wasmMemory,
    /** @export */
    proc_exit: _proc_exit,
    /** @export */
    random_get: _random_get
  };
  }
  var wasmExports = await createWasm();

function invoke_vi(index,a1) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viii(index,a1,a2,a3) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iii(index,a1,a2) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_v(index) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)();
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_ii(index,a1) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_i(index) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)();
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiii(index,a1,a2,a3,a4) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_diii(index,a1,a2,a3) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_vii(index,a1,a2) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiii(index,a1,a2,a3) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiiiii(index,a1,a2,a3,a4,a5) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3,a4,a5);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiiii(index,a1,a2,a3,a4,a5) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4,a5);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiiiiii(index,a1,a2,a3,a4,a5,a6) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiiii(index,a1,a2,a3,a4) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3,a4);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viid(index,a1,a2,a3) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viidd(index,a1,a2,a3,a4) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiid(index,a1,a2,a3) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_vid(index,a1,a2) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_diiii(index,a1,a2,a3,a4) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3,a4);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_di(index,a1) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiiiii(index,a1,a2,a3,a4,a5,a6) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_dii(index,a1,a2) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viidi(index,a1,a2,a3,a4) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiid(index,a1,a2,a3,a4) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viddi(index,a1,a2,a3,a4) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiidddi(index,a1,a2,a3,a4,a5,a6,a7) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiidddddi(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8,a9);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiiddddi(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiidi(index,a1,a2,a3,a4,a5) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4,a5);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiiddi(index,a1,a2,a3,a4,a5,a6) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8,a9);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiiiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiddi(index,a1,a2,a3,a4,a5) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4,a5);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiiiiiii(index,a1,a2,a3,a4,a5,a6,a7) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_ji(index,a1) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
    return 0n;
  }
}

function invoke_iiiiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_jiiii(index,a1,a2,a3,a4) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3,a4);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
    return 0n;
  }
}

function invoke_fiii(index,a1,a2,a3) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_viiiiiiiiiiiiiii(index,a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15) {
  var sp = stackSave();
  try {
    getWasmTableEntry(index)(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiiiij(index,a1,a2,a3,a4,a5) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3,a4,a5);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}

function invoke_iiiiid(index,a1,a2,a3,a4,a5) {
  var sp = stackSave();
  try {
    return getWasmTableEntry(index)(a1,a2,a3,a4,a5);
  } catch(e) {
    stackRestore(sp);
    if (!(e instanceof EmscriptenEH)) throw e;
    _setThrew(1, 0);
  }
}


// include: postamble.js
// === Auto-generated postamble setup entry stuff ===

function callMain(args = []) {

  var entryFunction = resolveGlobalSymbol('main').sym;;

  // Main modules can't tell if they have main() at compile time, since it may
  // arrive from a dynamic library.
  if (!entryFunction) return;

  args.unshift(thisProgram);

  var argc = args.length;
  var argv = stackAlloc((argc + 1) * 4);
  var argv_ptr = argv;
  args.forEach((arg) => {
    HEAPU32[((argv_ptr)>>2)] = stringToUTF8OnStack(arg);
    argv_ptr += 4;
  });
  HEAPU32[((argv_ptr)>>2)] = 0;

  try {

    var ret = entryFunction(argc, argv);

    // if we're not running an evented main loop, it's time to exit
    exitJS(ret, /* implicit = */ true);
    return ret;
  } catch (e) {
    return handleException(e);
  }
}

function run(args = arguments_) {

  if (runDependencies > 0) {
    dependenciesFulfilled = run;
    return;
  }

  if ((ENVIRONMENT_IS_PTHREAD)) {
    readyPromiseResolve?.(Module);
    initRuntime();
    return;
  }

  preRun();

  // a preRun added a dependency, run will be called later
  if (runDependencies > 0) {
    dependenciesFulfilled = run;
    return;
  }

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    preMain();

    readyPromiseResolve?.(Module);
    Module['onRuntimeInitialized']?.();

    var noInitialRun = Module['noInitialRun'] || false;
    if (!noInitialRun) callMain(args);

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(() => {
      setTimeout(() => Module['setStatus'](''), 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
}

function preInit() {
  if (Module['preInit']) {
    if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
    while (Module['preInit'].length > 0) {
      Module['preInit'].shift()();
    }
  }
}

preInit();
run();

// end include: postamble.js

// include: postamble_modularize.js
// In MODULARIZE mode we wrap the generated code in a factory function
// and return either the Module itself, or a promise of the module.
//
// We assign to the `moduleRtn` global here and configure closure to see
// this as and extern so it won't get minified.

if (runtimeInitialized)  {
  moduleRtn = Module;
} else {
  // Set up the promise that indicates the Module is initialized
  moduleRtn = new Promise((resolve, reject) => {
    readyPromiseResolve = resolve;
    readyPromiseReject = reject;
  });
}

// end include: postamble_modularize.js



  return moduleRtn;
}
);
})();
if (typeof exports === 'object' && typeof module === 'object') {
  module.exports = Vips;
  // This default export looks redundant, but it allows TS to import this
  // commonjs style module.
  module.exports.default = Vips;
} else if (typeof define === 'function' && define['amd'])
  define([], () => Vips);
var isPthread = globalThis.self?.name?.startsWith('em-pthread');
// When running as a pthread, construct a new instance on startup
isPthread && Vips();
