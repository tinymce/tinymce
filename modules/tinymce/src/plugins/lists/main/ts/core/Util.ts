import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as NodeType from './NodeType';

export const isCustomList = (list: HTMLElement): boolean =>
  /\btox\-/.test(list.className);

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
