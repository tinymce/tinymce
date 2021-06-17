/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Future, Futures, Obj, Result, Results } from '@ephox/katamari';
import { Attribute, Insert, Remove, SelectorFind, SugarElement, SugarShadowDom, Traverse } from '@ephox/sugar';

import Delay from '../util/Delay';
import Tools from '../util/Tools';

/**
 * This class handles loading of external stylesheets and fires events when these are loaded.
 *
 * @class tinymce.dom.StyleSheetLoader
 */

interface StyleSheetLoader {
  load: (url: string, success: () => void, failure?: () => void) => void;
  loadAll: (urls: string[], success: (urls: string[]) => void, failure: (urls: string[]) => void) => void;
  unload: (url: string) => void;
  unloadAll: (urls: string[]) => void;
  _setReferrerPolicy: (referrerPolicy: ReferrerPolicy) => void;
}

export interface StyleSheetLoaderSettings {
  maxLoadTime?: number;
  contentCssCors?: boolean;
  referrerPolicy?: ReferrerPolicy;
}

interface StyleState {
  id: string;
  status?: number;
  passed: Array<() => void>;
  failed: Array<() => void>;
  count: number;
}

const StyleSheetLoader = (documentOrShadowRoot: Document | ShadowRoot, settings: StyleSheetLoaderSettings = {}): StyleSheetLoader => {
  let idCount = 0;
  const loadedStates: Record<string, StyleState> = {};

  const edos = SugarElement.fromDom(documentOrShadowRoot);
  const doc = Traverse.documentOrOwner(edos);

  const maxLoadTime = settings.maxLoadTime || 5000;

  const _setReferrerPolicy = (referrerPolicy: ReferrerPolicy) => {
    settings.referrerPolicy = referrerPolicy;
  };

  const addStyle = (element: SugarElement<HTMLStyleElement>) => {
    Insert.append(SugarShadowDom.getStyleContainer(edos), element);
  };

  const removeStyle = (id: string) => {
    const styleContainer = SugarShadowDom.getStyleContainer(edos);
    SelectorFind.descendant(styleContainer, '#' + id).each(Remove.remove);
  };

  const getOrCreateState = (url: string) =>
    Obj.get(loadedStates, url).getOrThunk((): StyleState => ({
      id: 'mce-u' + (idCount++),
      passed: [],
      failed: [],
      count: 0
    }));

  /**
   * Loads the specified CSS file and calls the `success` callback if successfully loaded, otherwise calls `failure`.
   *
   * @method load
   * @param {String} url Url to be loaded.
   * @param {Function} success Callback to be executed when loaded.
   * @param {Function} failure Callback to be executed when failed loading.
   */
  const load = (url: string, success: () => void, failure?: () => void) => {
    let link: HTMLLinkElement;

    const urlWithSuffix = Tools._addCacheSuffix(url);

    const state = getOrCreateState(urlWithSuffix);
    loadedStates[urlWithSuffix] = state;
    state.count++;

    const resolve = (callbacks: Array<() => void>, status: number) => {
      let i = callbacks.length;
      while (i--) {
        callbacks[i]();
      }

      state.status = status;
      state.passed = [];
      state.failed = [];

      if (link) {
        link.onload = null;
        link.onerror = null;
        link = null;
      }
    };

    const passed = () => resolve(state.passed, 2);
    const failed = () => resolve(state.failed, 3);

    // Calls the waitCallback until the test returns true or the timeout occurs
    const wait = (testCallback: () => boolean, waitCallback: () => void) => {
      if (!testCallback()) {
        // Wait for timeout
        if ((Date.now()) - startTime < maxLoadTime) {
          Delay.setTimeout(waitCallback);
        } else {
          failed();
        }
      }
    };

    // Workaround for WebKit that doesn't properly support the onload event for link elements
    // Or WebKit that fires the onload event before the StyleSheet is added to the document
    const waitForWebKitLinkLoaded = () => {
      wait(() => {
        const styleSheets = documentOrShadowRoot.styleSheets;
        let i = styleSheets.length;

        while (i--) {
          const styleSheet = styleSheets[i];
          const owner = styleSheet.ownerNode;
          if (owner && (owner as Element).id === link.id) {
            passed();
            return true;
          }
        }

        return false;
      }, waitForWebKitLinkLoaded);
    };

    if (success) {
      state.passed.push(success);
    }

    if (failure) {
      state.failed.push(failure);
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
    const linkElem = SugarElement.fromTag('link', doc.dom);
    Attribute.setAll(linkElem, {
      rel: 'stylesheet',
      type: 'text/css',
      id: state.id
    });
    const startTime = Date.now();

    if (settings.contentCssCors) {
      Attribute.set(linkElem, 'crossOrigin', 'anonymous');
    }

    if (settings.referrerPolicy) {
      // Note: Don't use link.referrerPolicy = ... here as it doesn't work on Safari
      Attribute.set(linkElem, 'referrerpolicy', settings.referrerPolicy);
    }

    link = linkElem.dom;
    link.onload = waitForWebKitLinkLoaded;
    link.onerror = failed;

    addStyle(linkElem);
    Attribute.set(linkElem, 'href', urlWithSuffix);
  };

  const loadF = (url: string): Future<Result<string, string>> =>
    Future.nu((resolve) => {
      load(
        url,
        Fun.compose(resolve, Fun.constant(Result.value(url))),
        Fun.compose(resolve, Fun.constant(Result.error(url)))
      );
    });

  /**
   * Loads the specified CSS files and calls the `success` callback if successfully loaded, otherwise calls `failure`.
   *
   * @method loadAll
   * @param {Array} urls URLs to be loaded.
   * @param {Function} success Callback to be executed when the style sheets have been successfully loaded.
   * @param {Function} failure Callback to be executed when the style sheets fail to load.
   */
  const loadAll = (urls: string[], success: (urls: string[]) => void, failure: (urls: string[]) => void) => {
    Futures.par(Arr.map(urls, loadF)).get((result) => {
      const parts = Arr.partition(result, (r) => r.isValue());

      if (parts.fail.length > 0) {
        failure(parts.fail.map(Results.unite));
      } else {
        success(parts.pass.map(Results.unite));
      }
    });
  };

  /**
   * Unloads the specified CSS file if no resources currently depend on it.
   * <br>
   * <em>Added in TinyMCE 5.5</em>
   *
   * @method unload
   * @param {String} url URL to unload or remove.
   */
  const unload = (url: string) => {
    const urlWithSuffix = Tools._addCacheSuffix(url);
    Obj.get(loadedStates, urlWithSuffix).each((state) => {
      const count = --state.count;
      if (count === 0) {
        delete loadedStates[urlWithSuffix];
        removeStyle(state.id);
      }
    });
  };

  /**
   * Unloads each specified CSS file if no resources currently depend on it.
   * <br>
   * <em>Added in TinyMCE 5.5</em>
   *
   * @method unloadAll
   * @param {Array} urls URLs to unload or remove.
   */
  const unloadAll = (urls: string[]) => {
    Arr.each(urls, (url) => {
      unload(url);
    });
  };

  return {
    load,
    loadAll,
    unload,
    unloadAll,
    _setReferrerPolicy
  };
};

export default StyleSheetLoader;
