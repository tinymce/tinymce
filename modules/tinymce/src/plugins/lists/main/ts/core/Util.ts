import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { NodeChangeEvent } from 'tinymce/core/api/EventTypes';

import * as Selection from '../core/Selection';
import * as NodeType from './NodeType';

const isCustomList = (list: HTMLElement): boolean =>
  /\btox\-/.test(list.className);

const inList = (parents: Node[], listName: string): boolean =>
  Arr.findUntil(parents, NodeType.isListNode, NodeType.isTableCellNode)
    .exists((list) => list.nodeName === listName && !isCustomList(list));

// Advlist/core/ListUtils.ts - Duplicated in Advlist plugin
const isWithinNonEditable = (editor: Editor, element: Element | null): boolean =>
  element !== null && !editor.dom.isEditable(element);

const selectionIsWithinNonEditableList = (editor: Editor): boolean => {
  const parentList = Selection.getParentList(editor);
  return isWithinNonEditable(editor, parentList);
};

const isWithinNonEditableList = (editor: Editor, element: Element | null): boolean => {
  const parentList = editor.dom.getParent(element, 'ol,ul,dl');
  return isWithinNonEditable(editor, parentList);
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
  isCustomList,
  inList,
  selectionIsWithinNonEditableList,
  isWithinNonEditableList,
  setNodeChangeHandler
};
