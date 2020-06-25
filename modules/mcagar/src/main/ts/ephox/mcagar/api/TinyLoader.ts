import { Option, Strings, Type } from '@ephox/katamari';
import { Body, Element, Insert, Remove, ShadowDom } from '@ephox/sugar';
import 'tinymce';
import * as Loader from '../loader/Loader';
import { setTinymceBaseUrl } from '../loader/Urls';
import { document, HTMLElement, ShadowRoot } from '@ephox/dom-globals';
import { TestLogs } from '@ephox/agar';

type FailureCallback = Loader.FailureCallback;
type SuccessCallback = Loader.SuccessCallback;

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

const setupInShadowRoot = (callback: (editor: any, shadowRoot: Element<ShadowRoot>, success: SuccessCallback, failure: FailureCallback) => void, settings: Record<string, any>, success: Loader.SuccessCallback, failure: Loader.FailureCallback) => {
  if (!ShadowDom.isSupported()) {
    return success();
  }

  const shadowHost: Element<HTMLElement> = Element.fromTag('div', document);

  Insert.append(Body.body(), shadowHost);
  const sr: Element<ShadowRoot> = Element.fromDom(shadowHost.dom().attachShadow({ mode: 'open' }));
  const editorDiv: Element<HTMLElement> = Element.fromTag('div', document);

  Insert.append(sr, editorDiv);

  setupFromElement(
    (editor, success, failure) => callback(editor, sr, success, failure),
    settings,
    editorDiv,
    (v, logs) => {
      Remove.remove(shadowHost);
      success(v, logs);
    },
    failure
  );
};

/** Runs the callback with an editor in the body, and then with an editor in a shadow root. Lets you test both scenarios. */
const setupInBodyAndShadowRoot = (callback: Loader.RunCallback, settings: Record<string, any>, success: Loader.SuccessCallback, failure: Loader.FailureCallback) => {
  setup(
    callback,
    settings,
    (v, logs1) => {
      if (ShadowDom.isSupported()) {
        setupInShadowRoot((e, _sr, s, f) => callback(e, s, f), settings, (v2, logs2) => {
          const logs = TestLogs.concat(TestLogs.getOrInit(logs1), TestLogs.getOrInit(logs2));
          success(v2, logs);
        }, failure);
      } else {
        success(v, logs1);
      }
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
