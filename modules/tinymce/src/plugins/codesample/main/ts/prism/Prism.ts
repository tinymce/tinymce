import { Global } from '@ephox/katamari';
import * as Prism from 'prismjs';

import type Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';

type PrismType = typeof Prism & {
  highlightElement: (element: Element) => void;
};

const get = (editor: Editor): PrismType =>
  (Global.Prism && Options.useGlobalPrismJS(editor)) ? Global.Prism as PrismType : Prism as PrismType;

export {
  get
};
