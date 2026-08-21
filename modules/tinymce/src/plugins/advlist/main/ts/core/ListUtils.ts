import { Arr, Optional, Type } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';
import type { NodeChangeEvent } from 'tinymce/core/api/EventTypes';

const isCustomList = (list: HTMLElement): boolean =>
  /\btox\-/.test(list.className);

const isChildOfBody = (editor: Editor, elm: Node): boolean => {
  return editor.dom.isChildOf(elm, editor.getBody());
};

const matchNodeNames = <T extends Node = Node>(regex: RegExp) =>
  (node: Node | null): node is T => Type.isNonNullable(node) && regex.test(node.nodeName);

const isListNode = matchNodeNames<HTMLOListElement | HTMLUListElement | HTMLDListElement>(/^(OL|UL|DL)$/);

const isTableCellNode = matchNodeNames<HTMLTableHeaderCellElement | HTMLTableCellElement>(/^(TH|TD)$/);

const inList = (editor: Editor, parents: Node[], nodeName: string): boolean =>
  Arr.findUntil(parents, (parent) => isListNode(parent) && !isCustomList(parent), isTableCellNode)
    .exists((list) => list.nodeName === nodeName && isChildOfBody(editor, list));

const getSelectedStyleType = (editor: Editor): Optional<string> => {
  const dom = editor.dom;
  const node = editor.selection.getNode();
  const listElm = dom.getParent(node, 'ol,ul');

  if (Type.isNullable(listElm)) {
    return Optional.none();
  }

  // A `list-style-type` on the item wins over the one on the list, so the item has to be checked
  // first for the toolbar to reflect the correct style
  const listItemElm = dom.getParent(node, 'li', listElm);
  const itemStyleType = Optional.from(listItemElm)
    .bind((listItemElm) => Optional.from(dom.getStyle(listItemElm, 'listStyleType')))
    // `none` marks the items that only wrap a nested list
    .filter((styleType) => styleType !== '' && styleType !== 'none');

  return itemStyleType.orThunk(() => Optional.from(dom.getStyle(listElm, 'listStyleType')));
};

// Lists/core/Util.ts - Duplicated in Lists plugin
const isWithinNonEditable = (editor: Editor, element: Element | null): boolean =>
  element !== null && !editor.dom.isEditable(element);

const isWithinNonEditableList = (editor: Editor, element: Element | null): boolean => {
  const parentList = editor.dom.getParent(element, 'ol,ul,dl');
  return isWithinNonEditable(editor, parentList) || !editor.selection.isEditable();
};

const setNodeChangeHandler = (editor: Editor, nodeChangeHandler: (e: NodeChangeEvent) => void): () => void => {
  const initialNode = editor.selection.getNode();
  // Set the initial state
  nodeChangeHandler({
    parents: editor.dom.getParents(initialNode),
    element: initialNode
  });
  editor.on('NodeChange', nodeChangeHandler);
  return () => editor.off('NodeChange', nodeChangeHandler);
};

export {
  isTableCellNode, // Exported for testing
  isListNode, // Exported for testing
  inList,
  getSelectedStyleType,
  isWithinNonEditableList,
  setNodeChangeHandler
};

