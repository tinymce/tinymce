import { Strings, Type } from '@ephox/katamari';
import 'tinymce';
import * as Loader from '../loader/Loader';
import { setTinymceBaseUrl } from '../loader/Urls';

const setupBaseUrl = (tinymce: any, settings: Record<string, any>) => {
  if (settings.base_url) {
    setTinymceBaseUrl(tinymce, settings.base_url);
  } else if (!Type.isString(tinymce.baseURL) || !Strings.contains(tinymce.baseURL, '/project/')) {
    setTinymceBaseUrl(tinymce, `/project/node_modules/tinymce`);
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
  }, nuSettings);
};

const setup = (callback: Loader.RunCallback, settings: Record<string, any>, success: Loader.SuccessCallback, failure: Loader.FailureCallback) => {
  Loader.setup({
    preInit: setupBaseUrl,
    run: callback,
    success,
    failure
  }, settings);
};

export default {
  setup,
  setupLight
};
