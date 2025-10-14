import { Global } from '@ephox/katamari';
import * as PrismLib from 'prismjs';

import type Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';

type PrismType = typeof PrismLib & {
  highlightElement: (element: Element) => void;
};

const get = (editor: Editor): PrismType => {
  const prismCandidate = (Global.Prism && Options.useGlobalPrismJS(editor)) ? Global.Prism : PrismLib;
  return prismCandidate as unknown as PrismType;
};

export {
  get
};
