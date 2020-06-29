/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { navigator, Document as DomDocument, Node as DomNode, ShadowRoot } from '@ephox/dom-globals';
import { Arr, Fun, Future, Futures, Result, Results } from '@ephox/katamari';
import { Attr, Element, Insert, ShadowDom, Traverse } from '@ephox/sugar';
import { ReferrerPolicy } from '../SettingsTypes';
import Delay from '../util/Delay';
import Tools from '../util/Tools';

/**
 * This class handles loading of external stylesheets and fires events when these are loaded.
 *
 * @class tinymce.dom.StyleSheetLoader
 */

export interface StyleSheetLoader {
  load: (url: string, loadedCallback: Function, errorCallback?: Function) => void;
  loadAll: (urls: string[], success: Function, failure: Function) => void;
  _setReferrerPolicy: (referrerPolicy: ReferrerPolicy) => void;
}

export interface StyleSheetLoaderSettings {
  maxLoadTime: number;
  contentCssCors: boolean;
  referrerPolicy: ReferrerPolicy;
}

export function StyleSheetLoader(documentOrShadowRoot: DomDocument | ShadowRoot, settings: Partial<StyleSheetLoaderSettings> = {}): StyleSheetLoader {
  let idCount = 0;
  const loadedStates = {};

  const edos = Element.fromDom(documentOrShadowRoot);
  const doc = Traverse.documentOrOwner(edos);

  const maxLoadTime = settings.maxLoadTime || 5000;

  const _setReferrerPolicy = (referrerPolicy: ReferrerPolicy) => {
    settings.referrerPolicy = referrerPolicy;
  };

  const addStyle = (element: Element<DomNode>) => {
    Insert.append(ShadowDom.getStyleContainer(edos), element);
  };

  /**
   * Loads the specified CSS file and calls the `loadedCallback` once it's finished loading.
   *
   * @method load
   * @param {String} url Url to be loaded.
   * @param {Function} loadedCallback Callback to be executed when loaded.
   * @param {Function} errorCallback Callback to be executed when failed loading.
   */
  const load = function (url: string, loadedCallback: Function, errorCallback?: Function) {
    let link, style, state;

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
        const styleSheets = documentOrShadowRoot.styleSheets;
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
    // TODO: Use Sugar to create this element
    link = doc.dom().createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.id = 'u' + (idCount++);
    link.async = false;
    link.defer = false;
    const startTime = new Date().getTime();

    if (settings.contentCssCors) {
      link.crossOrigin = 'anonymous';
    }

    if (settings.referrerPolicy) {
      // Note: Don't use link.referrerPolicy = ... here as it doesn't work on Safari
      Attr.set(Element.fromDom(link), 'referrerpolicy', settings.referrerPolicy);
    }

    // Feature detect onload on link element and sniff older webkits since it has an broken onload event
    if ('onload' in link && !isOldWebKit()) {
      link.onload = waitForWebKitLinkLoaded;
      link.onerror = failed;
    } else {
      // Sniff for old Firefox that doesn't support the onload event on link elements
      // TODO: Remove this in the future when everyone uses modern browsers
      if (navigator.userAgent.indexOf('Firefox') > 0) {
        // TODO: Use Sugar to create this element
        style = doc.dom().createElement('style');
        style.textContent = '@import "' + url + '"';
        waitForGeckoLinkLoaded();
        addStyle(Element.fromDom(style));
        return;
      }

      // Use the id owner on older webkits
      waitForWebKitLinkLoaded();
    }

    addStyle(Element.fromDom(link));
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

  /**
   * Loads the specified CSS files and calls the `success` callback once it's finished loading.
   *
   * @method loadAll
   * @param {Array} urls Urls to be loaded.
   * @param {Function} success Callback to be executed when the style sheets have been successfully loaded.
   * @param {Function} failure Callback to be executed when the style sheets fail to load.
   */
  const loadAll = function (urls: string[], success: Function, failure: Function) {
    Futures.par(Arr.map(urls, loadF)).get(function (result) {
      const parts = Arr.partition(result, function (r) {
        return r.isValue();
      });

      if (parts.fail.length > 0) {
        failure(parts.fail.map(Results.unite));
      } else {
        success(parts.pass.map(Results.unite));
      }
    });
  };

  return {
    load,
    loadAll,
    _setReferrerPolicy
  };
}
