/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element } from '@ephox/dom-globals';
import Editor from 'tinymce/core/api/Editor';

import Unlink from './Unlink';

const collapseSelectionToEnd = function (editor: Editor) {
  editor.selection.collapse(false);
};

const unlink = function (editor: Editor) {
  editor.focus();
  Unlink.unlinkSelection(editor);
  collapseSelectionToEnd(editor);
};

const changeHref = function (editor: Editor, elm: Element, url: string) {
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
  createLink,
  unlink
};