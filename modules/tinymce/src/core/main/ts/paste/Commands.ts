import { Cell } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Events from '../api/Events';
import * as Clipboard from './Clipboard';

const togglePlainTextPaste = (editor: Editor, pasteFormat: Cell<string>): void => {
  if (pasteFormat.get() === 'text') {
    pasteFormat.set('html');
    Events.firePastePlainTextToggle(editor, false);
  } else {
    pasteFormat.set('text');
    Events.firePastePlainTextToggle(editor, true);
  }
  editor.focus();
};

const register = (editor: Editor, pasteFormat: Cell<string>): void => {
  editor.addCommand('mceTogglePlainTextPaste', () => {
    togglePlainTextPaste(editor, pasteFormat);
  });

  editor.addCommand('mceInsertClipboardContent', (ui, value) => {
    if (value.html) {
      // TINY-9997: Input events are not simulated when using paste commands, similar to how the 'mceInsertContent'
      // and 'Delete' commands work.
      Clipboard.pasteHtml(editor, value.html, value.internal, false);
    }

    if (value.text) {
      Clipboard.pasteText(editor, value.text, false);
    }
  });
};

export {
  register
};
