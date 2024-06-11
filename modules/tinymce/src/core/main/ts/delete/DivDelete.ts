import { Optional } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as StructureBookmark from '../bookmark/StructureBookmark';
import { execNativeDeleteCommand, execNativeForwardDeleteCommand } from './DeleteUtils';

export const backspaceDelete = (editor: Editor, forward: boolean): Optional<() => void> => {
  const dom = editor.dom;
  const startBlock = dom.getParent(editor.selection.getStart(), dom.isBlock);
  const endBlock = dom.getParent(editor.selection.getEnd(), dom.isBlock);
  const body = editor.getBody();
  const startBlockName = startBlock?.nodeName?.toLowerCase();

  // Only act on single root div that is not empty
  if (startBlockName === 'div' && startBlock && endBlock && startBlock === body.firstChild && endBlock === body.lastChild && !dom.isEmpty(body)) {
    const wrapper = startBlock.cloneNode(false) as HTMLElement;

    const deleteAction = () => {
      if (forward) {
        execNativeForwardDeleteCommand(editor);
      } else {
        execNativeDeleteCommand(editor);
      }

      // Div was deleted by delete operation then lets restore it
      if (body.firstChild !== startBlock) {
        const bookmark = StructureBookmark.getBookmark(editor.selection.getRng(), () => document.createElement('span'));
        Array.from(body.childNodes).forEach((node) => wrapper.appendChild(node));
        body.appendChild(wrapper);
        editor.selection.setRng(StructureBookmark.resolveBookmark(bookmark));
      }
    };

    return Optional.some(deleteAction);
  }

  return Optional.none();
};

