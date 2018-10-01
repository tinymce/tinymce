/**
 * Actions.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
import { Node } from '@ephox/dom-globals';
import { Editor } from 'tinymce/core/api/Editor';

import Unlink from './Unlink';

const formatBlock = function (editor: Editor, formatName: string) {
  editor.execCommand('FormatBlock', false, formatName);
};

const collapseSelectionToEnd = function (editor: Editor) {
  editor.selection.collapse(false);
};

const unlink = function (editor: Editor) {
  editor.focus();
  Unlink.unlinkSelection(editor);
  collapseSelectionToEnd(editor);
};

const changeHref = function (editor: Editor, elm: Node, url: string) {
  editor.focus();
  editor.dom.setAttrib(elm, 'href', url);
  collapseSelectionToEnd(editor);
};

const insertLink = function (editor: Editor, url: string) {
  editor.execCommand('mceInsertLink', false, { href: url });
  collapseSelectionToEnd(editor);
};

const updateOrInsertLink = function (editor: Editor, url: string) {
  const elm = editor.dom.getParent(editor.selection.getStart(), 'a[href]');
  elm ? changeHref(editor, elm, url) : insertLink(editor, url);
};

const createLink = function (editor: Editor, url: string) {
  url.trim().length === 0 ? unlink(editor) : updateOrInsertLink(editor, url);
};

export default {
  formatBlock,
  createLink,
  unlink
};