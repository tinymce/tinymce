/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const isNamedAnchor = (editor: Editor, node: Element) => node.tagName === 'A' && editor.dom.getAttrib(node, 'href') === '';

const isValidId = (id: string) =>
  // Follows HTML4 rules: https://www.w3.org/TR/html401/types.html#type-id
  /^[A-Za-z][A-Za-z0-9\-:._]*$/.test(id);

const getId = (editor: Editor) => {
  const selectedNode = editor.selection.getNode();
  return isNamedAnchor(editor, selectedNode) ? (selectedNode.getAttribute('id') || selectedNode.getAttribute('name')) : '';
};

const insert = (editor: Editor, id: string) => {
  const selectedNode = editor.selection.getNode();

  if (isNamedAnchor(editor, selectedNode)) {
    selectedNode.removeAttribute('name');
    selectedNode.id = id;
    editor.undoManager.add();
  } else {
    editor.focus();
    editor.selection.collapse(true);
    editor.insertContent(editor.dom.createHTML('a', {
      id
    }));
  }
};

export {
  isValidId,
  getId,
  insert
};
