import { Arr, FutureResult, Futures, Result, Results } from '@ephox/katamari';
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

const loadScripts = (urls: string[], success: () => void, failure: (err: Error) => void) => {
  Futures.par(Arr.map(urls, loadScript)).get((results) => {
    const partition = Results.partition(results);
    if (partition.errors.length > 0) {
      // Pass back the first failure
      failure(partition.errors[0]);
    } else {
      success();
    }
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
