import { Arr, Optional, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

const isCustomList = (list: Element): boolean =>
  /\btox\-/.test(list.className);

const isChildOfBody = (editor: Editor, elm: Node): boolean => {
  return editor.dom.isChildOf(elm, editor.getBody());
};

const matchNodeNames = <T extends Node = Node>(regex: RegExp) =>
  (node: Node | null): node is T => Type.isNonNullable(node) && regex.test(node.nodeName);

const isListNode = matchNodeNames<HTMLOListElement | HTMLUListElement | HTMLDListElement>(/^(OL|UL|DL)$/);

const isTableCellNode = matchNodeNames<HTMLTableHeaderCellElement | HTMLTableCellElement>(/^(TH|TD)$/);

const inList = (editor: Editor, e: Node[], nodeName: string): boolean =>
  Arr.findUntil(e, isListNode, isTableCellNode)
    .exists((list) => list.nodeName === nodeName && !isCustomList(list) && isChildOfBody(editor, list));

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
  inList,
  getSelectedStyleType,
  isWithinNonEditableList
};
