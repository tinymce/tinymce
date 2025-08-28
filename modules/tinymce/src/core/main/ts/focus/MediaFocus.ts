import Editor from '../api/Editor';
import * as FakeCaretUtils from '../caret/FakeCaretUtils';
import * as CefUtils from '../dom/CefUtils';
import { isContentEditableFalse, isMedia } from '../dom/NodeType';

const setup = (editor: Editor): void => {
  editor.on('init', () => {
    // Audio elements don't fire mousedown/click events and only fire a focus event so
    // we need to capture that event being fired and use it to update the selection.
    editor.on('focusin', (e) => {
      const target = e.target;
      if (isMedia(target)) {
        const ceRoot = CefUtils.getContentEditableRoot(editor.getBody(), target);
        const node = isContentEditableFalse(ceRoot) ? ceRoot : target;
        if (editor.selection.getNode() !== node) {
          FakeCaretUtils.selectNode(editor, node).each((rng) => editor.selection.setRng(rng));
        }
      }
    });
  });
};

export {
  setup
};
