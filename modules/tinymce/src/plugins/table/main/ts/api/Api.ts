/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement } from '@ephox/dom-globals';
import { Arr, Cell, Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { insertTableWithDataValidation } from '../actions/InsertTable';
import { ResizeHandler } from '../actions/ResizeHandler';
import { SelectionTargets } from '../selection/SelectionTargets';

const getClipboardRows = (clipboardRows: Cell<Option<Element[]>>): HTMLElement[] => clipboardRows.get().fold(
  () => [],
  (rows) => Arr.map(rows, (row) => row.dom())
);

const setClipboardRows = (rows: HTMLElement[], clipboardRows) => {
  const sugarRows = Arr.map(rows, Element.fromDom);
  clipboardRows.set(Option.from(sugarRows));
};

const getApi = (editor: Editor, clipboardRows: Cell<Option<Element[]>>, resizeHandler: ResizeHandler, selectionTargets: SelectionTargets) => ({
  insertTable: (columns: number, rows: number, options: Record<string, number> = {}) =>
    insertTableWithDataValidation(editor, rows, columns, options, 'Invalid values for insertTable - rows and columns values are required to insert a table.'),
  setClipboardRows: (rows: HTMLElement[]) => setClipboardRows(rows, clipboardRows),
  getClipboardRows: () => getClipboardRows(clipboardRows),
  resizeHandler,
  selectionTargets
});

export { getApi };

