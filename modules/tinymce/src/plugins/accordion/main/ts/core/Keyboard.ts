import Editor from 'tinymce/core/api/Editor';
import VK from 'tinymce/core/api/util/VK';

import * as Utils from './Utils';

const setupEnterKeyInSummary = (editor: Editor): void => {
  editor.on('keydown', (event): void => {
    if (!event.shiftKey && event.keyCode === VK.ENTER
      && Utils.isInSummary(editor) || Utils.isAtDetailsStart(editor)) {
      event.preventDefault();
      editor.execCommand('ToggleAccordion');
    }
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
};

export { setup };
