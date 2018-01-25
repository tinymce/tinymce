/**
 * ScriptLoader.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import DOMUtils from './DOMUtils';
import Tools from '../util/Tools';

/*globals console*/

/**
 * This class handles asynchronous/synchronous loading of JavaScript files it will execute callbacks
 * when various items gets loaded. This class is useful to load external JavaScript files.
 *
 * @class tinymce.dom.ScriptLoader
 * @example
 * // Load a script from a specific URL using the global script loader
 * tinymce.ScriptLoader.load('somescript.js');
 *
 * // Load a script using a unique instance of the script loader
 * var scriptLoader = new tinymce.dom.ScriptLoader();
 *
 * scriptLoader.load('somescript.js');
 *
 * // Load multiple scripts
 * var scriptLoader = new tinymce.dom.ScriptLoader();
 *
 * scriptLoader.add('somescript1.js');
 * scriptLoader.add('somescript2.js');
 * scriptLoader.add('somescript3.js');
 *
 * scriptLoader.loadQueue(function() {
 *    alert('All scripts are now loaded.');
 * });
 */

const DOM = DOMUtils.DOM;
const each = Tools.each, grep = Tools.grep;

const isFunction = function (f) {
  return typeof f === 'function';
};

const ScriptLoader: any = function () {
  const QUEUED = 0;
  const LOADING = 1;
  const LOADED = 2;
  const FAILED = 3;
  const states = {};
  const queue = [];
  const scriptLoadedCallbacks = {};
  const queueLoadedCallbacks = [];
  let loading = 0;

  /**
   * Loads a specific script directly without adding it to the load queue.
   *
   * @method load
   * @param {String} url Absolute URL to script to add.
   * @param {function} callback Optional success callback function when the script loaded successfully.
   * @param {function} callback Optional failure callback function when the script failed to load.
   */
  const loadScript = function (url, success, failure) {
    const dom = DOM;
    let elm, id;

    // Execute callback when script is loaded
    const done = function () {
      dom.remove(id);

      if (elm) {
        elm.onreadystatechange = elm.onload = elm = null;
      }

      success();
    };

    const error = function () {

      // We can't mark it as done if there is a load error since
      // A) We don't want to produce 404 errors on the server and
      // B) the onerror event won't fire on all browsers.
      // done();

      if (isFunction(failure)) {
        failure();
      } else {
        // Report the error so it's easier for people to spot loading errors
        if (typeof console !== 'undefined' && console.log) {
          // tslint:disable-next-line:no-console
          console.log('Failed to load script: ' + url);
        }
      }
    };

    id = dom.uniqueId();

    // Create new script element
    elm = document.createElement('script');
    elm.id = id;
    elm.type = 'text/javascript';
    elm.src = Tools._addCacheSuffix(url);

    // Seems that onreadystatechange works better on IE 10 onload seems to fire incorrectly
    if ('onreadystatechange' in elm) {
      elm.onreadystatechange = function () {
        if (/loaded|complete/.test(elm.readyState)) {
          done();
        }
      };
    } else {
      elm.onload = done;
    }

    // Add onerror event will get fired on some browsers but not all of them
    elm.onerror = error;

    // Add script to document
    (document.getElementsByTagName('head')[0] || document.body).appendChild(elm);
  };

  /**
   * Returns true/false if a script has been loaded or not.
   *
   * @method isDone
   * @param {String} url URL to check for.
   * @return {Boolean} true/false if the URL is loaded.
   */
  this.isDone = function (url) {
    return states[url] === LOADED;
  };

  /**
   * Marks a specific script to be loaded. This can be useful if a script got loaded outside
   * the script loader or to skip it from loading some script.
   *
   * @method markDone
   * @param {string} url Absolute URL to the script to mark as loaded.
   */
  this.markDone = function (url) {
    states[url] = LOADED;
  };

  /**
   * Adds a specific script to the load queue of the script loader.
   *
   * @method add
   * @param {String} url Absolute URL to script to add.
   * @param {function} success Optional success callback function to execute when the script loades successfully.
   * @param {Object} scope Optional scope to execute callback in.
   * @param {function} failure Optional failure callback function to execute when the script failed to load.
   */
  this.add = this.load = function (url, success, scope, failure) {
    const state = states[url];

    // Add url to load queue
    if (state === undefined) {
      queue.push(url);
      states[url] = QUEUED;
    }

    if (success) {
      // Store away callback for later execution
      if (!scriptLoadedCallbacks[url]) {
        scriptLoadedCallbacks[url] = [];
      }

      scriptLoadedCallbacks[url].push({
        success,
        failure,
        scope: scope || this
      });
    }
  };

  this.remove = function (url) {
    delete states[url];
    delete scriptLoadedCallbacks[url];
  };

  /**
   * Starts the loading of the queue.
   *
   * @method loadQueue
   * @param {function} success Optional callback to execute when all queued items are loaded.
   * @param {function} failure Optional callback to execute when queued items failed to load.
   * @param {Object} scope Optional scope to execute the callback in.
   */
  this.loadQueue = function (success, scope, failure) {
    this.loadScripts(queue, success, scope, failure);
  };

  /**
   * Loads the specified queue of files and executes the callback ones they are loaded.
   * This method is generally not used outside this class but it might be useful in some scenarios.
   *
   * @method loadScripts
   * @param {Array} scripts Array of queue items to load.
   * @param {function} callback Optional callback to execute when scripts is loaded successfully.
   * @param {Object} scope Optional scope to execute callback in.
   * @param {function} callback Optional callback to execute if scripts failed to load.
   */
  this.loadScripts = function (scripts, success, scope, failure) {
    let loadScripts;
    const failures = [];

    const execCallbacks = function (name, url) {
      // Execute URL callback functions
      each(scriptLoadedCallbacks[url], function (callback) {
        if (isFunction(callback[name])) {
          callback[name].call(callback.scope);
        }
      });

      scriptLoadedCallbacks[url] = undefined;
    };

    queueLoadedCallbacks.push({
      success,
      failure,
      scope: scope || this
    });

    loadScripts = function () {
      const loadingScripts = grep(scripts);

      // Current scripts has been handled
      scripts.length = 0;

      // Load scripts that needs to be loaded
      each(loadingScripts, function (url) {
        // Script is already loaded then execute script callbacks directly
        if (states[url] === LOADED) {
          execCallbacks('success', url);
          return;
        }

        if (states[url] === FAILED) {
          execCallbacks('failure', url);
          return;
        }

        // Is script not loading then start loading it
        if (states[url] !== LOADING) {
          states[url] = LOADING;
          loading++;

          loadScript(url, function () {
            states[url] = LOADED;
            loading--;

            execCallbacks('success', url);

            // Load more scripts if they where added by the recently loaded script
            loadScripts();
          }, function () {
            states[url] = FAILED;
            loading--;

            failures.push(url);
            execCallbacks('failure', url);

            // Load more scripts if they where added by the recently loaded script
            loadScripts();
          });
        }
      });

      // No scripts are currently loading then execute all pending queue loaded callbacks
      if (!loading) {
        // We need to clone the notifications and empty the pending callbacks so that callbacks can load more resources
        const notifyCallbacks = queueLoadedCallbacks.slice(0);
        queueLoadedCallbacks.length = 0;

        each(notifyCallbacks, function (callback) {
          if (failures.length === 0) {
            if (isFunction(callback.success)) {
              callback.success.call(callback.scope);
            }
          } else {
            if (isFunction(callback.failure)) {
              callback.failure.call(callback.scope, failures);
            }
          }
        });
      }
    };

    loadScripts();
  };
};

ScriptLoader.ScriptLoader = new ScriptLoader();

export default ScriptLoader;