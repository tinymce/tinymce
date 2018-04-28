/**
 * Api.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Editor } from 'tinymce/core/api/Editor';
import InsertTable from '../actions/InsertTable';
import { Arr, Option, Cell } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

const getClipboardRows = (clipboardRows): HTMLElement[] => {
  return clipboardRows.get().fold(function () {
    return;
  }, function (rows) {
    return Arr.map(rows, function (row) {
      return row.dom();
    });
  });
};

const setClipboardRows = (rows: HTMLElement[], clipboardRows) => {
  const sugarRows = Arr.map(rows, Element.fromDom);
  clipboardRows.set(Option.from(sugarRows));
};

const getApi = (editor: Editor, clipboardRows: Cell<Option<any>>) => {
  return {
    insertTable: (columns: number, rows: number) => {
      return InsertTable.insert(editor, columns, rows);
    },
    setClipboardRows: (rows: HTMLElement[]) => setClipboardRows(rows, clipboardRows),
    getClipboardRows: () => getClipboardRows(clipboardRows)
  };
};

export {
  getApi
};