import { TestLogs } from '@ephox/agar';
import { Arr, FutureResult, Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as Loader from '../../loader/Loader';
import { setTinymceBaseUrl } from '../../loader/Urls';

const setupBaseUrl = (tinymce: any, settings: Record<string, any>) => {
  if (settings.base_url) {
    setTinymceBaseUrl(tinymce, settings.base_url);
  }
};

const loadScripts = (urls: string[], success: () => void, failure: Loader.FailureCallback) => {
  const result = Arr.foldl(urls, (acc, url) => acc.bindFuture(() => Loader.loadScript(url)), FutureResult.pure(''));

  result.get((res) => {
    res.fold((e) => failure(e, TestLogs.init()), success);
  });
};

const setup = (callback: Loader.RunCallback, urls: string[], settings: Record<string, any>, success: Loader.SuccessCallback, failure: Loader.FailureCallback): void => {
  loadScripts(urls, () => {
    Loader.setup({
      preInit: setupBaseUrl,
      run: callback,
      success,
      failure
    }, settings, Optional.none());
  }, failure);
};

const setupFromElement = (
  callback: Loader.RunCallback,
  urls: string[],
  settings: Record<string, any>,
  element: SugarElement<Element>,
  success: Loader.SuccessCallback,
  failure: Loader.FailureCallback
): void => {
  loadScripts(urls, () => {
    Loader.setup({
      preInit: setupBaseUrl,
      run: callback,
      success,
      failure
    }, settings, Optional.some(element));
  }, failure);
};

export {
  setup,
  setupFromElement
};
