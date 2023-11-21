import { Arr, Fun, Obj } from '@ephox/katamari';
import { Attribute, Insert, Remove, SelectorFind, SugarElement, SugarShadowDom, Traverse } from '@ephox/sugar';

import Tools from '../util/Tools';

/**
 * This class handles loading of external stylesheets and fires events when these are loaded.
 *
 * @class tinymce.dom.StyleSheetLoader
 */

interface StyleSheetLoader {
  load: (url: string) => Promise<void>;
  loadRawCss: (key: string, css: string) => void;
  loadAll: (urls: string[]) => Promise<string[]>;
  unload: (url: string) => void;
  unloadRawCss: (key: string) => void;
  unloadAll: (urls: string[]) => void;
  _setReferrerPolicy: (referrerPolicy: ReferrerPolicy) => void;
  _setContentCssCors: (contentCssCors: boolean) => void;
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

  const _setReferrerPolicy = (referrerPolicy: ReferrerPolicy) => {
    settings.referrerPolicy = referrerPolicy;
  };

  const _setContentCssCors = (contentCssCors: boolean) => {
    settings.contentCssCors = contentCssCors;
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
   * Loads the specified CSS file and returns a Promise that will resolve when the stylesheet is loaded successfully or reject if it failed to load.
   *
   * @method load
   * @param {String} url Url to be loaded.
   * @return {Promise} A Promise that will resolve or reject when the stylesheet is loaded.
   */
  const load = (url: string): Promise<void> =>
    new Promise((success, failure) => {
      let link: HTMLLinkElement | null;

      const urlWithSuffix = Tools._addCacheSuffix(url);

      const state = getOrCreateState(urlWithSuffix);
      loadedStates[urlWithSuffix] = state;
      state.count++;

      const resolve = (callbacks: Array<() => void>, status: number) => {
        Arr.each(callbacks, Fun.call);

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

      if (settings.contentCssCors) {
        Attribute.set(linkElem, 'crossOrigin', 'anonymous');
      }

      if (settings.referrerPolicy) {
        // Note: Don't use link.referrerPolicy = ... here as it doesn't work on Safari
        Attribute.set(linkElem, 'referrerpolicy', settings.referrerPolicy);
      }

      link = linkElem.dom;
      link.onload = passed;
      link.onerror = failed;

      addStyle(linkElem);
      Attribute.set(linkElem, 'href', urlWithSuffix);
    });

  /**
   * Loads the specified css string in as a style element with an unique key.
   *
   * @method loadRawCss
   * @param {String} key Unique key for the style element.
   * @param {String} css Css style content to add.
   */
  const loadRawCss = (key: string, css: string): void => {
    const state = getOrCreateState(key);
    loadedStates[key] = state;
    state.count++;

    // Start loading
    const styleElem = SugarElement.fromTag('style', doc.dom);
    Attribute.setAll(styleElem, {
      rel: 'stylesheet',
      type: 'text/css',
      id: state.id
    });

    styleElem.dom.innerHTML = css;

    addStyle(styleElem);
  };

  /**
   * Loads the specified CSS files and returns a Promise that is resolved when all stylesheets are loaded or rejected if any failed to load.
   *
   * @method loadAll
   * @param {Array} urls URLs to be loaded.
   * @return {Promise} A Promise that will resolve or reject when all stylesheets are loaded.
   */
  const loadAll = (urls: string[]) => {
    const loadedUrls = Promise.allSettled(Arr.map(urls, (url) => load(url).then(Fun.constant(url))));
    return loadedUrls.then((results) => {
      const parts = Arr.partition(results, (r) => r.status === 'fulfilled');

      if (parts.fail.length > 0) {
        return Promise.reject(Arr.map(parts.fail as PromiseRejectedResult[], (result) => result.reason));
      } else {
        return Arr.map(parts.pass as PromiseFulfilledResult<string>[], (result) => result.value);
      }
    });
  };

  /**
   * Unloads the specified CSS file if no resources currently depend on it.
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
   * Unloads the specified CSS style element by key.
   *
   * @method unloadRawCss
   * @param {String} key Key of CSS style resource to unload.
   */
  const unloadRawCss = (key: string) => {
    Obj.get(loadedStates, key).each((state) => {
      const count = --state.count;
      if (count === 0) {
        delete loadedStates[key];
        removeStyle(state.id);
      }
    });
  };

  /**
   * Unloads each specified CSS file if no resources currently depend on it.
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
    loadRawCss,
    loadAll,
    unload,
    unloadRawCss,
    unloadAll,
    _setReferrerPolicy,
    _setContentCssCors
  };
};

export default StyleSheetLoader;
