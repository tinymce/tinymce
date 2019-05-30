/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const isValidId = function (id: string) {
  // Follows HTML4 rules: https://www.w3.org/TR/html401/types.html#type-id
  return /^[A-Za-z][A-Za-z0-9\-:._]*$/.test(id);
};

const getId = function (editor: Editor) {
  const selectedNode = editor.selection.getNode();
  const isAnchor = selectedNode.tagName === 'A' && editor.dom.getAttrib(selectedNode, 'href') === '';
  return isAnchor ? (selectedNode.getAttribute('id') || selectedNode.getAttribute('name')) : '';
};

const insert = function (editor: Editor, id: string) {
  const selectedNode = editor.selection.getNode();
  const isAnchor = selectedNode.tagName === 'A' && editor.dom.getAttrib(selectedNode, 'href') === '';

  if (isAnchor) {
    selectedNode.removeAttribute('name');
    selectedNode.id = id;
    editor.undoManager.add();
  } else {
    editor.focus();
    editor.selection.collapse(true);
    editor.execCommand('mceInsertContent', false, editor.dom.createHTML('a', {
      id
    }));
  }
};

export default {
  isValidId,
  getId,
  insert
};