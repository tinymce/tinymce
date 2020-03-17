/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import * as InsertTable from '../actions/InsertTable';
import { Arr, Option, Cell } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { HTMLElement } from '@ephox/dom-globals';
import { ResizeHandler } from '../actions/ResizeHandler';
import { SelectionTargets } from '../selection/SelectionTargets';

const getClipboardRows = (clipboardRows): HTMLElement[] => clipboardRows.get().fold(function () {
  return;
}, function (rows) {
  return Arr.map(rows, function (row) {
    return row.dom();
  });
});

const setClipboardRows = (rows: HTMLElement[], clipboardRows) => {
  const sugarRows = Arr.map(rows, Element.fromDom);
  clipboardRows.set(Option.from(sugarRows));
};

const getApi = (editor: Editor, clipboardRows: Cell<Option<any>>, resizeHandler: ResizeHandler, selectionTargets: SelectionTargets) => ({
  insertTable: (columns: number, rows: number) => InsertTable.insert(editor, columns, rows),
  setClipboardRows: (rows: HTMLElement[]) => setClipboardRows(rows, clipboardRows),
  getClipboardRows: () => getClipboardRows(clipboardRows),
  resizeHandler,
  selectionTargets
});

export {
  getApi
};
