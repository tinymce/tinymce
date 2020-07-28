/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional } from '@ephox/katamari';
import { SugarElement, SugarElements } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { insertTableWithDataValidation } from '../actions/InsertTable';
import { ResizeHandler } from '../actions/ResizeHandler';
import { Clipboard } from '../core/Clipboard';
import { SelectionTargets } from '../selection/SelectionTargets';

const getClipboardElements = (getClipboard: () => Optional<SugarElement[]>) => (): HTMLElement[] => getClipboard().fold(
  () => [],
  (elems) => Arr.map(elems, (e) => e.dom)
);

const setClipboardElements = (setClipboard: (elems: Optional<SugarElement[]>) => void) => (elems: HTMLElement[]): void => {
  const elmsOpt = elems.length > 0 ? Optional.some(SugarElements.fromDom(elems)) : Optional.none<SugarElement[]>();
  setClipboard(elmsOpt);
};

const getApi = (editor: Editor, clipboard: Clipboard, resizeHandler: ResizeHandler, selectionTargets: SelectionTargets) => ({
  insertTable: (columns: number, rows: number, options: Record<string, number> = {}) =>
    insertTableWithDataValidation(editor, rows, columns, options, 'Invalid values for insertTable - rows and columns values are required to insert a table.'),
  setClipboardRows: setClipboardElements(clipboard.setRows),
  getClipboardRows: getClipboardElements(clipboard.getRows),
  setClipboardCols: setClipboardElements(clipboard.setColumns),
  getClipboardCols: getClipboardElements(clipboard.getColumns),
  resizeHandler,
  selectionTargets
});

export { getApi };

