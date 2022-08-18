import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { NodeChangeEvent } from 'tinymce/core/api/EventTypes';

import * as NodeType from './NodeType';

export const isCustomList = (list: HTMLElement): boolean =>
  /\btox\-/.test(list.className);

export const inList = (parents: Node[], listName: string): boolean =>
  Arr.findUntil(parents, NodeType.isListNode, NodeType.isTableCellNode)
    .exists((list) => list.nodeName === listName && !isCustomList(list));

export const setNodeChangeHandler = (editor: Editor, nodeChangeHandler: (e: NodeChangeEvent) => void): () => void => {
  const initialNode = editor.selection.getNode();
  // Set the initial state
  nodeChangeHandler({
    parents: editor.dom.getParents(initialNode),
    element: initialNode
  });
  editor.on('NodeChange', nodeChangeHandler);
  return () => editor.off('NodeChange', nodeChangeHandler);
};

// Advlist/core/ListUtils.ts - Duplicated in Advlist plugin
export const isEditableList = (editor: Editor, element: Element): boolean => {
  const parentList = editor.dom.getParent(element, 'ol,ul,dl');
  return editor.dom.getContentEditableParent(parentList ?? element) !== 'false';
};
