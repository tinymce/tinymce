import { Toolbar, Menu } from '@ephox/bridge';
import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { NodeChangeEvent } from 'tinymce/core/api/EventTypes';

import * as NodeType from './NodeType';

export const isCustomList = (list: HTMLElement): boolean =>
  /\btox\-/.test(list.className);

const inList = (parents: Node[], listName: string): boolean =>
  Arr.findUntil(parents, NodeType.isListNode, NodeType.isTableCellNode)
    .filter((list: HTMLElement) => list.nodeName === listName && !isCustomList(list))
    .isSome();

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

// Advlist/core/ListUtils.ts - Duplicated in Advlist plugin
export const isEditableList = (editor: Editor, element: Element): boolean => {
  const parentList = editor.dom.getParent(element, 'ol,ul,dl', editor.dom.getRoot());
  return editor.dom.getContentEditableParent(parentList ?? element) !== 'false';
};

export const setupToggleButtonHandler = (editor: Editor, listName: string) => (api: Toolbar.ToolbarToggleButtonInstanceApi): () => void => {
  const toggleButtonHandler = (e: NodeChangeEvent) => {
    api.setActive(inList(e.parents, listName));
    api.setEnabled(isEditableList(editor, e.element));
  };
  return setNodeChangeHandler(editor, toggleButtonHandler);
};

export const setupMenuButtonHandler = (editor: Editor, listName: string) => (api: Menu.MenuItemInstanceApi): () => void => {
  const menuButtonHandler = (e: NodeChangeEvent) =>
    api.setEnabled(inList(e.parents, listName) && isEditableList(editor, e.element));
  return setNodeChangeHandler(editor, menuButtonHandler);
};
