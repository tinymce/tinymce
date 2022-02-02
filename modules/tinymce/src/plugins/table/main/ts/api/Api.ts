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

export interface Api {
  readonly insertTable: (columns: number, rows: number, options?: Record<string, number>) => HTMLTableElement | null;
  readonly setClipboardRows: (rows: Array<HTMLTableRowElement | HTMLTableColElement>) => void;
  readonly getClipboardRows: () => Array<HTMLTableRowElement | HTMLTableColElement>;
  readonly setClipboardCols: (cols: Array<HTMLTableRowElement | HTMLTableColElement>) => void;
  readonly getClipboardCols: () => Array<HTMLTableRowElement | HTMLTableColElement>;
  // Internal Apis
  readonly resizeHandler: ResizeHandler;
  readonly selectionTargets: SelectionTargets;
}

const getClipboardElements = <T extends HTMLElement>(getClipboard: () => Optional<SugarElement<T>[]>) => (): T[] => getClipboard().fold(
  () => [],
  (elems) => Arr.map(elems, (e) => e.dom)
);

const setClipboardElements = <T extends HTMLElement>(setClipboard: (elems: Optional<SugarElement<T>[]>) => void) => (elems: T[]): void => {
  const elmsOpt = elems.length > 0 ? Optional.some(SugarElements.fromDom(elems)) : Optional.none<SugarElement[]>();
  setClipboard(elmsOpt);
};

const insertTable = (editor: Editor) => (columns: number, rows: number, options: Record<string, number> = {}): HTMLTableElement | null => {
  const table = insertTableWithDataValidation(editor, rows, columns, options, 'Invalid values for insertTable - rows and columns values are required to insert a table.');
  editor.undoManager.add();
  return table;
};

const getApi = (editor: Editor, clipboard: Clipboard, resizeHandler: ResizeHandler, selectionTargets: SelectionTargets): Api => ({
  insertTable: insertTable(editor),
  setClipboardRows: setClipboardElements(clipboard.setRows),
  getClipboardRows: getClipboardElements(clipboard.getRows),
  setClipboardCols: setClipboardElements(clipboard.setColumns),
  getClipboardCols: getClipboardElements(clipboard.getColumns),
  resizeHandler,
  selectionTargets
});

export { getApi };

