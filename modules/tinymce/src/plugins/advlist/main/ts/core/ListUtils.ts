import { Optional, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

const isChildOfBody = (editor: Editor, elm: Node): boolean => {
  return editor.dom.isChildOf(elm, editor.getBody());
};

const isTableCellNode = (node: Node | null): boolean => {
  return Type.isNonNullable(node) && /^(TH|TD)$/.test(node.nodeName);
};

const isListNode = (editor: Editor) => (node: Node | null): boolean => {
  return Type.isNonNullable(node) && (/^(OL|UL|DL)$/).test(node.nodeName) && isChildOfBody(editor, node);
};

const getSelectedStyleType = (editor: Editor): Optional<string> => {
  const listElm = editor.dom.getParent(editor.selection.getNode(), 'ol,ul');
  const style = editor.dom.getStyle(listElm, 'listStyleType');
  return Optional.from(style);
};

export {
  isTableCellNode,
  isListNode,
  getSelectedStyleType
};
