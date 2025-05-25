import { Arr, Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { NodeChangeEvent } from 'tinymce/core/api/EventTypes';
import Schema from 'tinymce/core/api/html/Schema';

import { getForcedRootBlock } from '../api/Options';

const isCustomList = (list: HTMLElement): boolean =>
  /\btox\-/.test(list.className);

const matchNodeNames = <T extends Node = Node>(regex: RegExp) =>
  (node: Node | null): node is T => Type.isNonNullable(node) && regex.test(node.nodeName);

const matchNodeName = <T extends Node = Node>(name: string) =>
  (node: Node | null): node is T => Type.isNonNullable(node) && node.nodeName.toLowerCase() === name;

const isListNode = matchNodeNames<HTMLOListElement | HTMLUListElement | HTMLDListElement>(/^(OL|UL|DL)$/);

const isTableCellNode = matchNodeNames<HTMLTableHeaderCellElement | HTMLTableCellElement>(/^(TH|TD)$/);

const isListItemNode = matchNodeNames<HTMLLIElement | HTMLElement>(/^(LI|DT|DD)$/);

const inList = (parents: Node[], listName: string): boolean =>
  Arr.findUntil(parents, isListNode, isTableCellNode)
    .exists((list) => list.nodeName === listName && !isCustomList(list));

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

const isWithinNonEditable = (editor: Editor, element: Element | null): boolean =>
  element !== null && !editor.dom.isEditable(element);

const isWithinNonEditableList = (editor: Editor, element: Element | null): boolean => {
  const parentList = editor.dom.getParent(element, 'ol,ul,dl');
  return isWithinNonEditable(editor, parentList) || !editor.selection.isEditable();
};

const isOlNode = matchNodeName<HTMLOListElement>('ol');

const listNames = [ 'OL', 'UL', 'DL' ];
const listSelector = listNames.join(',');

const getParentList = (editor: Editor, node?: Node): HTMLElement | null => {
  const selectionStart = node || editor.selection.getStart(true);

  return editor.dom.getParent(selectionStart, listSelector, getClosestListHost(editor, selectionStart));
};

const getClosestListHost = (editor: Editor, elm: Node): HTMLElement => {
  const parentBlocks = editor.dom.getParents<HTMLElement>(elm, editor.dom.isBlock);
  const isNotForcedRootBlock = (elm: HTMLElement) => elm.nodeName.toLowerCase() !== getForcedRootBlock(editor);
  const parentBlock = Arr.find(parentBlocks, (elm) => isNotForcedRootBlock(elm) && isListHost(editor.schema, elm));

  return parentBlock.getOr(editor.getBody());
};

const isListHost = (schema: Schema, node: Node): boolean =>
  !isListNode(node) && !isListItemNode(node) && Arr.exists(listNames, (listName) => schema.isValidChild(node.nodeName, listName));

export {
  getParentList,
  inList,
  isOlNode,
  isWithinNonEditableList,
  setNodeChangeHandler
};
