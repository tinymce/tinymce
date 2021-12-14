/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional } from '@ephox/katamari';
import { SugarElement, SugarElements } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { Clipboard as FakeClipboard } from 'tinymce/models/dom/table/api/Clipboard';

// TODO: Remove this file once clipboard is moved to core

export interface Api {
  readonly setClipboardRows: (rows: Array<HTMLTableRowElement | HTMLTableColElement>) => void;
  readonly getClipboardRows: () => Array<HTMLTableRowElement | HTMLTableColElement>;
  readonly setClipboardCols: (cols: Array<HTMLTableRowElement | HTMLTableColElement>) => void;
  readonly getClipboardCols: () => Array<HTMLTableRowElement | HTMLTableColElement>;
}

const getClipboardElements = <T extends HTMLElement>(getClipboard: () => Optional<SugarElement<T>[]>) => (): T[] => getClipboard().fold(
  () => [],
  (elems) => Arr.map(elems, (e) => e.dom)
);

const setClipboardElements = <T extends HTMLElement>(setClipboard: (elems: Optional<SugarElement<T>[]>) => void) => (elems: T[]): void => {
  const elmsOpt = elems.length > 0 ? Optional.some(SugarElements.fromDom(elems)) : Optional.none<SugarElement[]>();
  setClipboard(elmsOpt);
};

const getApi = (_editor: Editor, clipboard: FakeClipboard): Api => ({
  setClipboardRows: setClipboardElements(clipboard.setRows),
  getClipboardRows: getClipboardElements(clipboard.getRows),
  setClipboardCols: setClipboardElements(clipboard.setColumns),
  getClipboardCols: getClipboardElements(clipboard.getColumns),
});

export { getApi };

