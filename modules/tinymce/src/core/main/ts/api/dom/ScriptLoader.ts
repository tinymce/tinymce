import { Arr, Fun, Obj, Optional, Type, Unique } from '@ephox/katamari';

import Tools from '../util/Tools';
import DOMUtils from './DOMUtils';

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
 * const scriptLoader = new tinymce.dom.ScriptLoader();
 *
 * scriptLoader.load('somescript.js');
 *
 * // Load multiple scripts
 * scriptLoader.add('somescript1.js');
 * scriptLoader.add('somescript2.js');
 * scriptLoader.add('somescript3.js');
 *
 * scriptLoader.loadQueue().then(() => {
 *   alert('All scripts are now loaded.');
 * });
 */

const DOM = DOMUtils.DOM;

export interface ScriptLoaderSettings {
  referrerPolicy?: ReferrerPolicy;
}

export interface ScriptLoaderConstructor {
  readonly prototype: ScriptLoader;

  new(): ScriptLoader;

  ScriptLoader: ScriptLoader;
}

const QUEUED = 0;
const LOADING = 1;
const LOADED = 2;
const FAILED = 3;

class ScriptLoader {
  public static ScriptLoader = new ScriptLoader();

  private settings: ScriptLoaderSettings;
  private states: Record<string, number> = {};
  private queue: string[] = [];
  private scriptLoadedCallbacks: Record<string, Array<{ resolve: () => void; reject: (reason: any) => void }>> = {};
  private queueLoadedCallbacks: Array<() => void> = [];
  private loading = false;

  public constructor(settings: ScriptLoaderSettings = {}) {
    this.settings = settings;
  }

  public _setReferrerPolicy(referrerPolicy: ReferrerPolicy): void {
    this.settings.referrerPolicy = referrerPolicy;
  }

  /**
   * Loads a specific script directly without adding it to the load queue.
   *
   * @method loadScript
   * @param {String} url Absolute URL to script to add.
   * @return {Promise} A promise that will resolve when the script loaded successfully or reject if it failed to load.
   */
  public loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const dom = DOM;
      let elm: HTMLScriptElement | null;

      const cleanup = () => {
        dom.remove(id);
        if (elm) {
          elm.onerror = elm.onload = elm = null;
        }
      };

      // Execute callback when script is loaded
      const done = () => {
        cleanup();
        resolve();
      };

      const error = () => {
        // We can't mark it as done if there is a load error since
        // A) We don't want to produce 404 errors on the server and
        // B) the onerror event won't fire on all browsers.
        cleanup();
        reject('Failed to load script: ' + url);
      };

      const id = dom.uniqueId();

      // Create new script element
      elm = document.createElement('script');
      elm.id = id;
      elm.type = 'text/javascript';
      elm.src = Tools._addCacheSuffix(url);

      if (this.settings.referrerPolicy) {
        // Note: Don't use elm.referrerPolicy = ... here as it doesn't work on Safari
        dom.setAttrib(elm, 'referrerpolicy', this.settings.referrerPolicy);
      }

      elm.onload = done;

      // Add onerror event will get fired on some browsers but not all of them
      elm.onerror = error;

      // Add script to document
      (document.getElementsByTagName('head')[0] || document.body).appendChild(elm);
    });
  }

  /**
   * Returns true/false if a script has been loaded or not.
   *
   * @method isDone
   * @param {String} url URL to check for.
   * @return {Boolean} true/false if the URL is loaded.
   */
  public isDone(url: string): boolean {
    return this.states[url] === LOADED;
  }

  /**
   * Marks a specific script to be loaded. This can be useful if a script got loaded outside
   * the script loader or to skip it from loading some script.
   *
   * @method markDone
   * @param {String} url Absolute URL to the script to mark as loaded.
   */
  public markDone(url: string): void {
    this.states[url] = LOADED;
  }

  /**
   * Adds a specific script to the load queue of the script loader.
   *
   * @method add
   * @param {String} url Absolute URL to script to add.
   * @return {Promise} A promise that will resolve when the script loaded successfully or reject if it failed to load.
   */
  public add(url: string): Promise<void> {
    const self = this;
    self.queue.push(url);

    // Add url to load queue
    const state = self.states[url];
    if (state === undefined) {
      self.states[url] = QUEUED;
    }

    return new Promise((resolve, reject) => {
      // Store away callback for later execution
      if (!self.scriptLoadedCallbacks[url]) {
        self.scriptLoadedCallbacks[url] = [];
      }

      self.scriptLoadedCallbacks[url].push({
        resolve,
        reject
      });
    });
  }

  public load(url: string): Promise<void> {
    return this.add(url);
  }

  public remove(url: string): void {
    delete this.states[url];
    delete this.scriptLoadedCallbacks[url];
  }

  /**
   * Starts the loading of the queue.
   *
   * @method loadQueue
   * @return {Promise} A promise that is resolved when all queued items are loaded or rejected with the script urls that failed to load.
   */
  public loadQueue(): Promise<void> {
    const queue = this.queue;
    this.queue = [];
    return this.loadScripts(queue);
  }

  /**
   * Loads the specified queue of files and executes the callback ones they are loaded.
   * This method is generally not used outside this class but it might be useful in some scenarios.
   *
   * @method loadScripts
   * @param {Array} scripts Array of queue items to load.
   * @return {Promise} A promise that is resolved when all scripts are loaded or rejected with the script urls that failed to load.
   */
  public loadScripts(scripts: string[]): Promise<void> {
    const self = this;

    const execCallbacks = (name: 'resolve' | 'reject', url: string) => {
      // Execute URL callback functions
      Obj.get(self.scriptLoadedCallbacks, url).each((callbacks) => {
        Arr.each(callbacks, (callback) => callback[name](url));
      });

      delete self.scriptLoadedCallbacks[url];
    };

    const processResults = (results: Array<PromiseSettledResult<void>>): Promise<void> => {
      const failures = Arr.filter(results, (result): result is PromiseRejectedResult => result.status === 'rejected');
      if (failures.length > 0) {
        return Promise.reject(Arr.bind(failures, ({ reason }) => Type.isArray(reason) ? reason : [ reason ]));
      } else {
        return Promise.resolve();
      }
    };

    const load = (urls: string[]) => Promise.allSettled(Arr.map(urls, (url): Promise<void> => {
      // Script is already loaded then execute script callbacks directly
      if (self.states[url] === LOADED) {
        execCallbacks('resolve', url);
        return Promise.resolve();
      } else if (self.states[url] === FAILED) {
        execCallbacks('reject', url);
        return Promise.reject(url);
      } else {
        // Script is not already loaded, so load it
        self.states[url] = LOADING;

        return self.loadScript(url).then(() => {
          self.states[url] = LOADED;
          execCallbacks('resolve', url);

          // Immediately load additional scripts if any were added to the queue while loading this script
          const queue = self.queue;
          if (queue.length > 0) {
            self.queue = [];
            return load(queue).then(processResults);
          } else {
            return Promise.resolve();
          }
        }, () => {
          self.states[url] = FAILED;
          execCallbacks('reject', url);
          return Promise.reject(url);
        });
      }
    }));

    const processQueue = (urls: string[]) => {
      self.loading = true;
      return load(urls).then((results) => {
        self.loading = false;

        // Start loading the next queued item
        const nextQueuedItem = self.queueLoadedCallbacks.shift();
        Optional.from(nextQueuedItem).each(Fun.call);

        return processResults(results);
      });
    };

    // Wait for any other scripts to finish loading first, otherwise load immediately
    const uniqueScripts = Unique.stringArray(scripts);
    if (self.loading) {
      return new Promise((resolve, reject) => {
        self.queueLoadedCallbacks.push(() => {
          processQueue(uniqueScripts).then(resolve, reject);
        });
      });
    } else {
      return processQueue(uniqueScripts);
    }
  }
}

export default ScriptLoader;
