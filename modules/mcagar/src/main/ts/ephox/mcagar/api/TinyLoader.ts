import { Option, Strings, Type } from '@ephox/katamari';
import { Element, Insert, Body, Remove, ShadowDom } from '@ephox/sugar';
import 'tinymce';
import * as Loader from '../loader/Loader';
import { setTinymceBaseUrl } from '../loader/Urls';
import { document, HTMLElement, ShadowRoot } from '@ephox/dom-globals';

const setupBaseUrl = (tinymce: any, settings: Record<string, any>) => {
  if (settings.base_url) {
    setTinymceBaseUrl(tinymce, settings.base_url);
  } else if (!Type.isString(tinymce.baseURL) || !Strings.contains(tinymce.baseURL, '/project/')) {
    setTinymceBaseUrl(tinymce, '/project/node_modules/tinymce');
  }
};

const setupLight = (callback: Loader.RunCallback, settings: Record<string, any>, success: Loader.SuccessCallback, failure: Loader.FailureCallback) => {
  const nuSettings: Record<string, any> = {
    toolbar: '',
    menubar: false,
    statusbar: false,
    ...settings
  };

  Loader.setup({
    preInit: setupBaseUrl,
    run: callback,
    success,
    failure
  }, nuSettings, Option.none());
};

const setup = (callback: Loader.RunCallback, settings: Record<string, any>, success: Loader.SuccessCallback, failure: Loader.FailureCallback) => {
  Loader.setup({
    preInit: setupBaseUrl,
    run: callback,
    success,
    failure
  }, settings, Option.none());
};

const setupFromElement = (callback: Loader.RunCallback, settings: Record<string, any>, element: Element, success: Loader.SuccessCallback, failure: Loader.FailureCallback) => {
  Loader.setup({
    preInit: setupBaseUrl,
    run: callback,
    success,
    failure
  }, settings, Option.some(element));
};

const setupInShadowRoot = (callback: Loader.RunCallback, settings: Record<string, any>, success: Loader.SuccessCallback, failure: Loader.FailureCallback) => {
  if (!ShadowDom.isSupported()) {
    return success();
  }

  const shadowHost: Element<HTMLElement> = Element.fromTag('div', document);

  Insert.append(Body.body(), shadowHost);
  const sr: Element<ShadowRoot> = Element.fromDom(shadowHost.dom().attachShadow({ mode: 'open' }));
  const editorDiv: Element<HTMLElement> = Element.fromTag('div', document);

  Insert.append(sr, editorDiv);

  setupFromElement(
    callback,
    settings,
    editorDiv,
    (v, logs) => {
      Remove.remove(shadowHost);
      success(v, logs);
    },
    failure
  );
};

/** Runs the callback in the body, and then in a shadow root. Lets you test both scenarios. */
const setupInBodyAndShadowRoot = (callback: Loader.RunCallback, settings: Record<string, any>, success: Loader.SuccessCallback, failure: Loader.FailureCallback) => {
  setup(
    callback,
    settings,
    () => {
      setupInShadowRoot(callback, settings, success, failure);
    },
    failure
  );
};

export {
  setup,
  setupLight,
  setupFromElement,
  setupInShadowRoot,
  setupInBodyAndShadowRoot
};
