import TestProviders from './TestProviders';
import { Fun, Option, Future } from '@ephox/katamari';
import { window } from '@ephox/dom-globals';
import { UrlData } from 'tinymce/themes/silver/backstage/UrlInputBackstage';

const urlinput = {
  getHistory: () => [],
  addToHistory: () => {},
  getLinkInformation: () => Option.none(),
  getValidationHandler: () => Option.none(),
  getUrlPicker: (filetype) => Option.some((entry: UrlData) => {
    const newUrl = Option.from(window.prompt('File browser would show instead of this...', entry.value));
    return Future.pure({...entry, value: newUrl.getOr(entry.value)});
  })
};

export default {
  shared: {
    providers: TestProviders,
    interpreter: Fun.identity
  },
  urlinput,
  interpreter: Fun.identity
};