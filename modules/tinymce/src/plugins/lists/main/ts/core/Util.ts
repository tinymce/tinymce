import { Arr, Fun } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as NodeType from './NodeType';

export const isCustomList = (list: HTMLElement): boolean =>
  /\btox\-/.test(list.className);

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

export const setupButtonHandler = (editor: Editor, listName: string) => (api) =>
  Fun.compose(listButtonState(editor, api.setEnabled), listState(editor, listName, api.setActive));

export const setupMenuItemHandler = (editor: Editor, listName: string) => (api) =>
  Fun.compose(listButtonState(editor, api.setEnabled), listState(editor, listName, api.setEnabled));

export const listState = (editor: Editor, listName: string, activate: (active: boolean) => void): () => void => {
  const nodeChangeHandler = (e: { parents: Node[] }) => {
    const inList = Arr.findUntil(e.parents, NodeType.isListNode, NodeType.isTableCellNode)
      .filter((list: HTMLElement) => list.nodeName === listName && !isCustomList(list))
      .isSome();
    activate(inList);
  };

  // Set the initial state
  const parents = editor.dom.getParents(editor.selection.getNode());
  nodeChangeHandler({ parents });

  editor.on('NodeChange', nodeChangeHandler);

  return () => editor.off('NodeChange', nodeChangeHandler);
};

export const listButtonState = (editor: Editor, enable: (state: boolean) => void): () => void => {
  const buttonStateHandler = (e: { element: Element }) => enable(isEditableSelection(editor, e.element));

  // Set the initial state
  const element = editor.selection.getNode();
  buttonStateHandler({ element });

  editor.on('NodeChange', buttonStateHandler);

  return () => editor.off('NodeChange', buttonStateHandler);
};
