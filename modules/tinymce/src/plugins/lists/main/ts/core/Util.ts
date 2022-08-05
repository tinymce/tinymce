import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { NodeChangeEvent } from 'tinymce/core/api/EventTypes';

import * as NodeType from './NodeType';

export const isCustomList = (list: HTMLElement): boolean =>
  /\btox\-/.test(list.className);

export const setupToggleButtonHandler = (editor: Editor, listName: string) => (api): () => void => {
  const toggleButtonHandler = (e: NodeChangeEvent) => {
    api.setActive(inList(e.parents, listName));
    api.setEnabled(isEditableSelection(editor, e.element));
  };
  return setNodeChangeHandler(editor, toggleButtonHandler, getInitial(editor));
};

export const setupMenuButtonHandler = (editor: Editor, listName: string) => (api): () => void => {
  const menuButtonHandler = (e: NodeChangeEvent) =>
    api.setEnabled(inList(e.parents, listName) && isEditableSelection(editor, e.element));
  return setNodeChangeHandler(editor, menuButtonHandler, getInitial(editor));
};

const getInitial = (editor: Editor): NodeChangeEvent => {
  const initialNode = editor.selection.getNode();
  return {
    parents: editor.dom.getParents(initialNode),
    element: initialNode
  };
};

const setNodeChangeHandler = (editor: Editor, nodeChangeHandler: (e: NodeChangeEvent) => void, initial: NodeChangeEvent): () => void => {
  // Set the initial state
  nodeChangeHandler(initial);
  editor.on('NodeChange', nodeChangeHandler);
  return () => editor.off('NodeChange', nodeChangeHandler);
};

const inList = (parents: Node[], listName: string): boolean =>
  Arr.findUntil(parents, NodeType.isListNode, NodeType.isTableCellNode)
    .filter((list: HTMLElement) => list.nodeName === listName && !isCustomList(list))
    .isSome();

export const isEditableSelection = (editor: Editor, node: Element): boolean => {
  const root = editor.getBody();
  let parent: HTMLElement | null = node as HTMLElement;
  while (parent !== root && parent) {
    if (editor.dom.getContentEditable(parent) === 'false') {
      return false;
    }
    parent = parent.parentElement;
  }
  return true;
};
