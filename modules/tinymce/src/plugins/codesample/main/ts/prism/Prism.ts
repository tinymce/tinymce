import { Global } from '@ephox/katamari';
import * as PrismLib from 'prismjs';

import type Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';

type PrismType = typeof PrismLib & {
  highlightElement: (element: Element) => void;
};

const get = (editor: Editor): PrismType => {
  const candidate = (Global.Prism && Options.useGlobalPrismJS(editor)) ? Global.Prism : (PrismLib as unknown);
  const hasHighlight = (obj: any): obj is PrismType => obj && typeof obj.highlightElement === 'function';
  const resolved = hasHighlight(candidate) ? candidate : (candidate as any)?.default ?? candidate;
  return resolved as PrismType;
};

export {
  get
};
