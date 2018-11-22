/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const isChildOfBody = function (editor, elm) {
  return editor.$.contains(editor.getBody(), elm);
};

const isTableCellNode = function (node) {
  return node && /^(TH|TD)$/.test(node.nodeName);
};

const isListNode = function (editor) {
  return function (node) {
    return node && (/^(OL|UL|DL)$/).test(node.nodeName) && isChildOfBody(editor, node);
  };
};

const getSelectedStyleType = function (editor) {
  const listElm = editor.dom.getParent(editor.selection.getNode(), 'ol,ul');
  return editor.dom.getStyle(listElm, 'listStyleType') || '';
};

export default {
  isTableCellNode,
  isListNode,
  getSelectedStyleType
};