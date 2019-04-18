/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Blob } from '@ephox/dom-globals';
import { Id } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';

const createTableHtml = function (cols: number, rows: number) {
  let x, y, html;

  html = '<table data-mce-id="mce" style="width: 100%">';
  html += '<tbody>';

  for (y = 0; y < rows; y++) {
    html += '<tr>';

    for (x = 0; x < cols; x++) {
      html += '<td><br></td>';
    }

    html += '</tr>';
  }

  html += '</tbody>';
  html += '</table>';

  return html;
};

const getInsertedElement = function (editor: Editor) {
  const elms = editor.dom.select('*[data-mce-id]');
  return elms[0];
};

const insertTableHtml = (editor: Editor, cols: number, rows: number) => {
  editor.undoManager.transact(function () {
    let tableElm, cellElm;

    editor.insertContent(createTableHtml(cols, rows));

    tableElm = getInsertedElement(editor);
    tableElm.removeAttribute('data-mce-id');
    cellElm = editor.dom.select('td,th', tableElm);
    editor.selection.setCursorLocation(cellElm[0], 0);
  });
};

const insertTable = function (editor: Editor, cols: number, rows: number) {
  editor.plugins.table ? editor.plugins.table.insertTable(cols, rows) : insertTableHtml(editor, cols, rows);
};

const insertBlob = function (editor: Editor, base64: string, blob: Blob) {
  let blobCache, blobInfo;

  blobCache = editor.editorUpload.blobCache;
  blobInfo = blobCache.create(Id.generate('mceu'), blob, base64);
  blobCache.add(blobInfo);

  editor.insertContent(editor.dom.createHTML('img', { src: blobInfo.blobUri() }));
};

export default {
  insertTable,
  insertBlob
};