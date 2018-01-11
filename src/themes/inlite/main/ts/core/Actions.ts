/**
 * Actions.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Uuid from '../alien/Uuid';
import Unlink from '../alien/Unlink';

const createTableHtml = function (cols, rows) {
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

const getInsertedElement = function (editor) {
  const elms = editor.dom.select('*[data-mce-id]');
  return elms[0];
};

const insertTable = function (editor, cols, rows) {
  editor.undoManager.transact(function () {
    let tableElm, cellElm;

    editor.insertContent(createTableHtml(cols, rows));

    tableElm = getInsertedElement(editor);
    tableElm.removeAttribute('data-mce-id');
    cellElm = editor.dom.select('td,th', tableElm);
    editor.selection.setCursorLocation(cellElm[0], 0);
  });
};

const formatBlock = function (editor, formatName) {
  editor.execCommand('FormatBlock', false, formatName);
};

const insertBlob = function (editor, base64, blob) {
  let blobCache, blobInfo;

  blobCache = editor.editorUpload.blobCache;
  blobInfo = blobCache.create(Uuid.uuid('mceu'), blob, base64);
  blobCache.add(blobInfo);

  editor.insertContent(editor.dom.createHTML('img', { src: blobInfo.blobUri() }));
};

const collapseSelectionToEnd = function (editor) {
  editor.selection.collapse(false);
};

const unlink = function (editor) {
  editor.focus();
  Unlink.unlinkSelection(editor);
  collapseSelectionToEnd(editor);
};

const changeHref = function (editor, elm, url) {
  editor.focus();
  editor.dom.setAttrib(elm, 'href', url);
  collapseSelectionToEnd(editor);
};

const insertLink = function (editor, url) {
  editor.execCommand('mceInsertLink', false, { href: url });
  collapseSelectionToEnd(editor);
};

const updateOrInsertLink = function (editor, url) {
  const elm = editor.dom.getParent(editor.selection.getStart(), 'a[href]');
  elm ? changeHref(editor, elm, url) : insertLink(editor, url);
};

const createLink = function (editor, url) {
  url.trim().length === 0 ? unlink(editor) : updateOrInsertLink(editor, url);
};

export default {
  insertTable,
  formatBlock,
  insertBlob,
  createLink,
  unlink
};