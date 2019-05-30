/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Future, Futures, Result } from '@ephox/katamari';
import Delay from '../api/util/Delay';
import Tools from '../api/util/Tools';
import { navigator } from '@ephox/dom-globals';

/**
 * This class handles loading of external stylesheets and fires events when these are loaded.
 *
 * @class tinymce.dom.StyleSheetLoader
 * @private
 */

export interface StyleSheetLoader {
  load: (url: string, loadedCallback: Function, errorCallback?: Function) => void;
  loadAll: (urls: string[], success: Function, failure: Function) => void;
}

export interface StyleSheetLoaderSettings {
  maxLoadTime: number;
  contentCssCors: boolean;
}

export function StyleSheetLoader(document, settings: Partial<StyleSheetLoaderSettings> = {}): StyleSheetLoader {
  let idCount = 0;
  const loadedStates = {};
  let maxLoadTime;

  maxLoadTime = settings.maxLoadTime || 5000;

  const appendToHead = function (node) {
    document.getElementsByTagName('head')[0].appendChild(node);
  };

  /**
   * Loads the specified css style sheet file and call the loadedCallback once it's finished loading.
   *
   * @method load
   * @param {String} url Url to be loaded.
   * @param {Function} loadedCallback Callback to be executed when loaded.
   * @param {Function} errorCallback Callback to be executed when failed loading.
   */
  const load = function (url: string, loadedCallback: Function, errorCallback?: Function) {
    let link, style, startTime, state;

    const resolve = (status: number) => {
      state.status = status;
      state.passed = [];
      state.failed = [];

      if (link) {
        link.onload = null;
        link.onerror = null;
        link = null;
      }
    };

    const passed = function () {
      const callbacks = state.passed;
      let i = callbacks.length;

      while (i--) {
        callbacks[i]();
      }

      resolve(2);
    };

    const failed = function () {
      const callbacks = state.failed;
      let i = callbacks.length;

      while (i--) {
        callbacks[i]();
      }

      resolve(3);
    };

    // Sniffs for older WebKit versions that have the link.onload but a broken one
    const isOldWebKit = function () {
      const webKitChunks = navigator.userAgent.match(/WebKit\/(\d*)/);
      return !!(webKitChunks && parseInt(webKitChunks[1], 10) < 536);
    };

    // Calls the waitCallback until the test returns true or the timeout occurs
    const wait = function (testCallback, waitCallback) {
      if (!testCallback()) {
        // Wait for timeout
        if ((new Date().getTime()) - startTime < maxLoadTime) {
          Delay.setTimeout(waitCallback);
        } else {
          failed();
        }
      }
    };

    // Workaround for WebKit that doesn't properly support the onload event for link elements
    // Or WebKit that fires the onload event before the StyleSheet is added to the document
    const waitForWebKitLinkLoaded = function () {
      wait(function () {
        const styleSheets = document.styleSheets;
        let styleSheet, i = styleSheets.length, owner;

        while (i--) {
          styleSheet = styleSheets[i];
          owner = styleSheet.ownerNode ? styleSheet.ownerNode : styleSheet.owningElement;
          if (owner && owner.id === link.id) {
            passed();
            return true;
          }
        }
      }, waitForWebKitLinkLoaded);
    };

    // Workaround for older Geckos that doesn't have any onload event for StyleSheets
    const waitForGeckoLinkLoaded = function () {
      wait(function () {
        try {
          // Accessing the cssRules will throw an exception until the CSS file is loaded
          const cssRules = style.sheet.cssRules;
          passed();
          return !!cssRules;
        } catch (ex) {
          // Ignore
        }
      }, waitForGeckoLinkLoaded);
    };

    url = Tools._addCacheSuffix(url);

    if (!loadedStates[url]) {
      state = {
        passed: [],
        failed: []
      };

      loadedStates[url] = state;
    } else {
      state = loadedStates[url];
    }

    if (loadedCallback) {
      state.passed.push(loadedCallback);
    }

    if (errorCallback) {
      state.failed.push(errorCallback);
    }

    // Is loading wait for it to pass
    if (state.status === 1) {
      return;
    }

    // Has finished loading and was success
    if (state.status === 2) {
      passed();
      return;
    }

    // Has finished loading and was a failure
    if (state.status === 3) {
      failed();
      return;
    }

    // Start loading
    state.status = 1;
    link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.id = 'u' + (idCount++);
    link.async = false;
    link.defer = false;
    startTime = new Date().getTime();

    if (settings.contentCssCors) {
      link.crossOrigin = 'anonymous';
    }

    // Feature detect onload on link element and sniff older webkits since it has an broken onload event
    if ('onload' in link && !isOldWebKit()) {
      link.onload = waitForWebKitLinkLoaded;
      link.onerror = failed;
    } else {
      // Sniff for old Firefox that doesn't support the onload event on link elements
      // TODO: Remove this in the future when everyone uses modern browsers
      if (navigator.userAgent.indexOf('Firefox') > 0) {
        style = document.createElement('style');
        style.textContent = '@import "' + url + '"';
        waitForGeckoLinkLoaded();
        appendToHead(style);
        return;
      }

      // Use the id owner on older webkits
      waitForWebKitLinkLoaded();
    }

    appendToHead(link);
    link.href = url;
  };

  const loadF = function (url) {
    return Future.nu(function (resolve) {
      load(
        url,
        Fun.compose(resolve, Fun.constant(Result.value(url))),
        Fun.compose(resolve, Fun.constant(Result.error(url)))
      );
    });
  };

  const unbox = function (result) {
    return result.fold(Fun.identity, Fun.identity);
  };

  const loadAll = function (urls: string[], success: Function, failure: Function) {
    Futures.par(Arr.map(urls, loadF)).get(function (result) {
      const parts = Arr.partition(result, function (r) {
        return r.isValue();
      });

      if (parts.fail.length > 0) {
        failure(parts.fail.map(unbox));
      } else {
        success(parts.pass.map(unbox));
      }
    });
  };

  return {
    load,
    loadAll
  };
}