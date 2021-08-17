/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Id } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

const createTableHtml = (cols: number, rows: number): string => {
  let html = '<table data-mce-id="mce" style="width: 100%">';
  html += '<tbody>';

  for (let y = 0; y < rows; y++) {
    html += '<tr>';

    for (let x = 0; x < cols; x++) {
      html += '<td><br></td>';
    }

    html += '</tr>';
  }

  html += '</tbody>';
  html += '</table>';

  return html;
};

const getInsertedElement = (editor: Editor): HTMLElement => {
  const elms = editor.dom.select('*[data-mce-id]');
  return elms[0];
};

const insertTableHtml = (editor: Editor, cols: number, rows: number): void => {
  editor.undoManager.transact(() => {
    editor.insertContent(createTableHtml(cols, rows));

    const tableElm = getInsertedElement(editor);
    tableElm.removeAttribute('data-mce-id');
    const cellElm = editor.dom.select('td,th', tableElm);
    editor.selection.setCursorLocation(cellElm[0], 0);
  });
};

const insertTable = (editor: Editor, cols: number, rows: number): void => {
  editor.plugins.table ? editor.plugins.table.insertTable(cols, rows) : insertTableHtml(editor, cols, rows);
};

const insertBlob = (editor: Editor, base64: string, blob: Blob): void => {
  const blobCache = editor.editorUpload.blobCache;
  const blobInfo = blobCache.create(Id.generate('mceu'), blob, base64);
  blobCache.add(blobInfo);

  editor.insertContent(editor.dom.createHTML('img', { src: blobInfo.blobUri() }));
};

export {
  insertTable,
  insertBlob
};
