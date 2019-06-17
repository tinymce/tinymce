/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { console, document } from '@ephox/dom-globals';
import { Type } from '@ephox/katamari';
import DOMUtils from './DOMUtils';
import Tools from '../util/Tools';

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

export interface ScriptLoaderConstructor {
  readonly prototype: ScriptLoader;
  ScriptLoader: ScriptLoader;

  new (): ScriptLoader;
}

interface ScriptLoader {
  loadScript (url: string, success?: () => void, failure?: () => void): void;
  loadScripts (url: string[], success?: () => void, failure?: (urls: string[]) => void): void;
  isDone (url: string): boolean;
  markDone (url: string): void;
  add (url: string, success?: () => void, scope?: {}, failure?: () => void): void;
  load (url: string, success?: () => void, scope?: {}, failure?: () => void): void;
  remove (url: string);
  loadQueue (success?: () => void, scope?: {}, failure?: (urls: string[]) => void): void;
}

const QUEUED = 0;
const LOADING = 1;
const LOADED = 2;
const FAILED = 3;

class ScriptLoader {
  public static ScriptLoader = new ScriptLoader();

  private states = {};
  private queue = [];
  private scriptLoadedCallbacks = {};
  private queueLoadedCallbacks = [];
  private loading = 0;

  constructor () { }

  /**
   * Loads a specific script directly without adding it to the load queue.
   *
   * @method load
   * @param {String} url Absolute URL to script to add.
   * @param {function} success Optional success callback function when the script loaded successfully.
   * @param {function} failure Optional failure callback function when the script failed to load.
   */
  public loadScript (url: string, success?: () => void, failure?: () => void) {
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

      if (Type.isFunction(failure)) {
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

    elm.onload = done;

    // Add onerror event will get fired on some browsers but not all of them
    elm.onerror = error;

    // Add script to document
    (document.getElementsByTagName('head')[0] || document.body).appendChild(elm);
  }

  /**
   * Returns true/false if a script has been loaded or not.
   *
   * @method isDone
   * @param {String} url URL to check for.
   * @return {Boolean} true/false if the URL is loaded.
   */
  public isDone (url: string): boolean {
    return this.states[url] === LOADED;
  }

  /**
   * Marks a specific script to be loaded. This can be useful if a script got loaded outside
   * the script loader or to skip it from loading some script.
   *
   * @method markDone
   * @param {string} url Absolute URL to the script to mark as loaded.
   */
  public markDone (url: string) {
    this.states[url] = LOADED;
  }

  /**
   * Adds a specific script to the load queue of the script loader.
   *
   * @method add
   * @param {String} url Absolute URL to script to add.
   * @param {function} success Optional success callback function to execute when the script loades successfully.
   * @param {Object} scope Optional scope to execute callback in.
   * @param {function} failure Optional failure callback function to execute when the script failed to load.
   */
  public add (url: string, success?: () => void, scope?: {}, failure?: () => void) {
    const state = this.states[url];

    // Add url to load queue
    if (state === undefined) {
      this.queue.push(url);
      this.states[url] = QUEUED;
    }

    if (success) {
      // Store away callback for later execution
      if (!this.scriptLoadedCallbacks[url]) {
        this.scriptLoadedCallbacks[url] = [];
      }

      this.scriptLoadedCallbacks[url].push({
        success,
        failure,
        scope: scope || this
      });
    }
  }

  public load (url: string, success?: () => void, scope?: {}, failure?: () => void) {
    return this.add(url, success, scope, failure);
  }

  public remove (url: string) {
    delete this.states[url];
    delete this.scriptLoadedCallbacks[url];
  }

  /**
   * Starts the loading of the queue.
   *
   * @method loadQueue
   * @param {function} success Optional callback to execute when all queued items are loaded.
   * @param {function} failure Optional callback to execute when queued items failed to load.
   * @param {Object} scope Optional scope to execute the callback in.
   */
  public loadQueue (success?: () => void, scope?: {}, failure?: (urls: string[]) => void) {
    this.loadScripts(this.queue, success, scope, failure);
  }

  /**
   * Loads the specified queue of files and executes the callback ones they are loaded.
   * This method is generally not used outside this class but it might be useful in some scenarios.
   *
   * @method loadScripts
   * @param {Array} scripts Array of queue items to load.
   * @param {function} success Optional callback to execute when scripts is loaded successfully.
   * @param {Object} scope Optional scope to execute callback in.
   * @param {function} failure Optional callback to execute if scripts failed to load.
   */
  public loadScripts (scripts: string[], success?: () => void, scope?: {}, failure?: (urls: string[]) => void) {
    const self = this;
    let loadScripts;
    const failures = [];

    const execCallbacks = function (name, url) {
      // Execute URL callback functions
      each(self.scriptLoadedCallbacks[url], function (callback) {
        if (Type.isFunction(callback[name])) {
          callback[name].call(callback.scope);
        }
      });

      self.scriptLoadedCallbacks[url] = undefined;
    };

    self.queueLoadedCallbacks.push({
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
        if (self.states[url] === LOADED) {
          execCallbacks('success', url);
          return;
        }

        if (self.states[url] === FAILED) {
          execCallbacks('failure', url);
          return;
        }

        // Is script not loading then start loading it
        if (self.states[url] !== LOADING) {
          self.states[url] = LOADING;
          self.loading++;

          self.loadScript(url, function () {
            self.states[url] = LOADED;
            self.loading--;

            execCallbacks('success', url);

            // Load more scripts if they where added by the recently loaded script
            loadScripts();
          }, function () {
            self.states[url] = FAILED;
            self.loading--;

            failures.push(url);
            execCallbacks('failure', url);

            // Load more scripts if they where added by the recently loaded script
            loadScripts();
          });
        }
      });

      // No scripts are currently loading then execute all pending queue loaded callbacks
      if (!self.loading) {
        // We need to clone the notifications and empty the pending callbacks so that callbacks can load more resources
        const notifyCallbacks = self.queueLoadedCallbacks.slice(0);
        self.queueLoadedCallbacks.length = 0;

        each(notifyCallbacks, function (callback) {
          if (failures.length === 0) {
            if (Type.isFunction(callback.success)) {
              callback.success.call(callback.scope);
            }
          } else {
            if (Type.isFunction(callback.failure)) {
              callback.failure.call(callback.scope, failures);
            }
          }
        });
      }
    };

    loadScripts();
  }
}

export default ScriptLoader;