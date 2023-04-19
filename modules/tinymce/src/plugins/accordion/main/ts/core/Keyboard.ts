import Editor from 'tinymce/core/api/Editor';
import VK from 'tinymce/core/api/util/VK';
import DomTreeWalker from 'tinymce/core/api/dom/TreeWalker';

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
      Utils.normalizeAccordions(editor);
    }
  });

  editor.on('keydown', (e) => {
    if (e.keyCode === VK.BACKSPACE) {
      const prevNode = new DomTreeWalker(editor.selection.getNode(), editor.getBody()).prev2(true);
      if (Utils.isDetails(prevNode)) {
        e.preventDefault();
        editor.execCommand('Delete');
        Utils.normalizeAccordions(editor);
      }
    }
  });
};

export { setup };
