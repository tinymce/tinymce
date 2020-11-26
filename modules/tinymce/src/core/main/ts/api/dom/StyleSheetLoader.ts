/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Future, Futures, Obj, Result, Results, Type } from '@ephox/katamari';
import { Attribute, Insert, Remove, SelectorFind, SugarElement, SugarShadowDom, Traverse } from '@ephox/sugar';
import Delay from '../util/Delay';
import Tools from '../util/Tools';

/**
 * This class handles loading of external stylesheets and fires events when these are loaded.
 *
 * @class tinymce.dom.StyleSheetLoader
 */

export interface StyleSheetLoader {
  load: (url: string, success: () => void, failure?: () => void) => void;
  loadAll: (urls: string[], success: (urls: string[]) => void, failure: (urls: string[]) => void) => void;
  unload: (url: string) => void;
  unloadAll: (urls: string[]) => void;
  _setReferrerPolicy: (referrerPolicy: ReferrerPolicy) => void;
  appendFontsToTheGreatContainerOfOurBelovedTinyMce: (fonts: string[]) => void;
  removeCustomFontsFromTheGreatContainerOfOurBelovedTinyMce: (fonts: string[]) => void;
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

export function StyleSheetLoader(documentOrShadowRoot: Document | ShadowRoot, settings: StyleSheetLoaderSettings = {}): StyleSheetLoader {
  let idCount = 0;
  const loadedStates: Record<string, StyleState> = {};

  const edos = SugarElement.fromDom(documentOrShadowRoot);
  const doc = Traverse.documentOrOwner(edos);

  const maxLoadTime = settings.maxLoadTime || 5000;

  const _setReferrerPolicy = (referrerPolicy: ReferrerPolicy) => {
    settings.referrerPolicy = referrerPolicy;
  };

  /**
   * Add the provided style element to the target dom.
   * @param element The element to add to the dom.
   * @param targetDom The dom we wish to add the element to.
   */
  const addStyle = (element: SugarElement<HTMLStyleElement>, targetDom: SugarElement<Document | ShadowRoot>) => {
    Insert.append(SugarShadowDom.getStyleContainer(targetDom), element);
  };

  /**
   * Remove the provided style element from the target dom.
   * @param id The id of the element we want to remove from the dom.
   * @param targetDom The dom we wish to add the element to.
   */
  const removeStyle = (id: string, targetDom: SugarElement<Document | ShadowRoot>) => {
    const styleContainer = SugarShadowDom.getStyleContainer(targetDom);
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
   * Load the provided URL and attach it to the provided hostRoot.
   * @param url URL of the css to add.
   * @param success Called if URL is successfully added.
   * @param failure Called if the URL fails to be added as intended.
   * @param currentRoot The root of the editor document.
   * @param hostRoot The root of the host.
   * @param generateId Generate an ID based on the url.
   */
  const baseLoad = (url: string, success: () => void, failure: () => void, currentRoot: SugarElement<Document | ShadowRoot>, hostRoot: SugarElement<Document>, generateId: (url: string) => string) => {
    let link: HTMLLinkElement;

    const urlWithSuffix = Tools._addCacheSuffix(url);

    const state = getOrCreateState(urlWithSuffix);
    loadedStates[generateId(urlWithSuffix)] = state;
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
    const linkElem = SugarElement.fromTag('link', hostRoot.dom);
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

    addStyle(linkElem, currentRoot);
    Attribute.set(linkElem, 'href', urlWithSuffix);
  };

  /**
   * Load the provided URL and add it to the editor
   * @param url URL of the css to add.
   * @param success Called if URL is successfully added
   * @param failure Called if the URL fails to be added as intended
   * @param currentRoot The root of the editor document
   * @param hostRoot The root of the host
   * @param generateId Generate an ID based on the url
   */
  const load = (url: string, success: () => void, failure?: () => void) => {
    baseLoad(url, success, Type.isFunction(failure) ? failure : Fun.noop, edos, doc, Fun.identity);
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
   * Unloads the specified css file if no resources currently depend on it.
   * @param url the url to the css to unload.
   * @param generateId Generates an id based on the url.
   */
  const baseUnload = (url: string, generateId: (url: string) => string, targetDom: SugarElement<Document | ShadowRoot>) => {
    const urlWithSuffix = generateId(Tools._addCacheSuffix(url));
    Obj.get(loadedStates, urlWithSuffix).each((state) => {
      const count = --state.count;
      if (count === 0) {
        delete loadedStates[urlWithSuffix];
        removeStyle(state.id, targetDom);
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
  const unload = (url: string) =>
    baseUnload(url, Fun.identity, edos);

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

  /**
   * Append a series of fonts to the container of the editor. It is assumed that these do not already exist.
   * @param fonts The fonts we wish to add to the document containing the editor.
   */
  const appendFontsToTheGreatContainerOfOurBelovedTinyMce = (fonts: string[]) => {
    Arr.each(fonts, (font) => {
      const sweetDocument = SugarElement.fromDom(document);

      baseLoad(font, Fun.noop, Fun.noop, sweetDocument, sweetDocument, generateIdForFontsAttachedToTheGreatContainerOfOurBelovedTinyMce);
    });
  };

  /**
   * Remove a series of fonts from the container of the editor.
   * @param fonts The fonts we wish to remove from the document containing the editor.
   */
  const removeCustomFontsFromTheGreatContainerOfOurBelovedTinyMce = (fonts: string[]) => {
    Arr.each(fonts, (font) =>
      baseUnload(font, generateIdForFontsAttachedToTheGreatContainerOfOurBelovedTinyMce, SugarElement.fromDom(document))
    );
  };

  return {
    load,
    loadAll,
    unload,
    unloadAll,
    appendFontsToTheGreatContainerOfOurBelovedTinyMce,
    removeCustomFontsFromTheGreatContainerOfOurBelovedTinyMce,
    _setReferrerPolicy
  };
}

const generateIdForFontsAttachedToTheGreatContainerOfOurBelovedTinyMce = (url: string) => url + '-mainbody';