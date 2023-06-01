import DomTreeWalker from 'tinymce/core/api/dom/TreeWalker';
import Editor from 'tinymce/core/api/Editor';
import VK from 'tinymce/core/api/util/VK';

import * as Utils from './Utils';

const setupEnterKeyInSummary = (editor: Editor): void => {
  editor.on('keydown', (event): void => {
    if (event.shiftKey || event.keyCode !== VK.ENTER || !Utils.isInSummary(editor)) {
      return;
    }
    event.preventDefault();
    editor.execCommand('ToggleAccordion');
  });
};

const setup = (editor: Editor): void => {
  setupEnterKeyInSummary(editor);

  editor.on('ExecCommand', (e) => {
    const cmd = e.command.toLowerCase();
    if ((cmd === 'delete' || cmd === 'forwarddelete') && Utils.isDetailsSelected(editor)) {
      Utils.normalizeDetails(editor);
    }
  });

  editor.on('keydown', (e) => {
    if (e.keyCode === VK.BACKSPACE || e.keyCode === VK.DELETE) {
      const prevNode = new DomTreeWalker(editor.selection.getNode(), editor.getBody()).prev2(true);
      if (!prevNode) {
        return;
      }
      if (Utils.isDetails(prevNode) || editor.dom.getParent(prevNode, 'details')) {
        e.preventDefault();
        editor.execCommand(e.keyCode === VK.BACKSPACE ? 'Delete' : 'ForwardDelete');
        Utils.normalizeDetails(editor);
      }
    }
  });
};

export { setup };
