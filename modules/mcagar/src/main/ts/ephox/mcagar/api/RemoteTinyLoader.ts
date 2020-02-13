import { TestLogs } from '@ephox/agar';
import { Arr, FutureResult, Result } from '@ephox/katamari';
import { Attr, Body, DomEvent, Element, Insert } from '@ephox/sugar';
import * as Loader from '../loader/Loader';
import { setTinymceBaseUrl } from '../loader/Urls';

const setupBaseUrl = (tinymce: any, settings: Record<string, any>) => {
  if (settings.base_url) {
    setTinymceBaseUrl(tinymce, settings.base_url);
  }
};

const loadScript = (url: string): FutureResult<string, Error> => {
  return FutureResult.nu((resolve) => {
    const script = Element.fromTag('script');

    Attr.set(script, 'referrerpolicy', 'origin');

    Attr.set(script, 'src', url);
    const onLoad = DomEvent.bind(script, 'load', () => {
      onLoad.unbind();
      onError.unbind();
      resolve(Result.value(url));
    });
    const onError = DomEvent.bind(script, 'error', () => {
      onLoad.unbind();
      onError.unbind();
      resolve(Result.error(new Error('Failed to load script: ' + url)));
    });
    Insert.append(Body.body(), script);
  });
};

const loadScripts = (urls: string[], success: () => void, failure: Loader.FailureCallback) => {
  const result = Arr.foldl(urls, (acc, url) => {
    return acc.bindFuture(() => loadScript(url));
  }, FutureResult.pure(''));

  result.get((res) => {
    res.fold((e) => failure(e, TestLogs.init()), success);
  });
};

const setup = (callback: Loader.RunCallback, urls: string[], settings: Record<string, any>, success: Loader.SuccessCallback, failure: Loader.FailureCallback) => {
  loadScripts(urls, () => {
    Loader.setup({
      preInit: setupBaseUrl,
      run: callback,
      success,
      failure
    }, settings);
  }, failure);
};

export {
  setup
};
