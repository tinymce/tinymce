/**
 * Anchor.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const isValidId = function (id) {
  // Follows HTML4 rules: https://www.w3.org/TR/html401/types.html#type-id
  return /^[A-Za-z][A-Za-z0-9\-:._]*$/.test(id);
};

const getId = function (editor) {
  const selectedNode = editor.selection.getNode();
  const isAnchor = selectedNode.tagName === 'A' && editor.dom.getAttrib(selectedNode, 'href') === '';
  return isAnchor ? (selectedNode.id || selectedNode.name) : '';
};

const insert = function (editor, id) {
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