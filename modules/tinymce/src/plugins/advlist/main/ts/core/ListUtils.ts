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

// Lists/core/Util.ts - Duplicated in Lists plugin
const isWithinNonEditable = (editor: Editor, element: Element | null): boolean =>
  element !== null && editor.dom.getContentEditableParent(element) === 'false';

const isWithinNonEditableList = (editor: Editor, element: Element | null): boolean => {
  const parentList = editor.dom.getParent(element, 'ol,ul,dl');
  return isWithinNonEditable(editor, parentList);
};

export {
  isTableCellNode,
  isListNode,
  getSelectedStyleType,
  isWithinNonEditableList
};
