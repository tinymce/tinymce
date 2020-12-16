/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';

const isChildOfBody = (editor, elm) => {
  return editor.$.contains(editor.getBody(), elm);
};

const isTableCellNode = (node) => {
  return node && /^(TH|TD)$/.test(node.nodeName);
};

const isListNode = (editor) => {
  return (node) => {
    return node && (/^(OL|UL|DL)$/).test(node.nodeName) && isChildOfBody(editor, node);
  };
};

const getSelectedStyleType = (editor): Optional<string> => {
  const listElm = editor.dom.getParent(editor.selection.getNode(), 'ol,ul');
  const style = editor.dom.getStyle(listElm, 'listStyleType');
  return Optional.from(style);
};

export {
  isTableCellNode,
  isListNode,
  getSelectedStyleType
};
