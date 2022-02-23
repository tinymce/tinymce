import { Cell } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Actions from './Actions';

const setup = (editor: Editor, toggleState: Cell<boolean>): void => {
  /*
    Note: applyVisualChars does not place a bookmark before modifying the DOM on init.
    This will cause a loss of selection if the following conditions are met:
      - Autofocus enabled, or editor is manually focused on init
      - The first piece of text in the editor must be a nbsp
      - Integrator has manually set the selection before init

    Another improvement would be to ensure DOM elements aren't destroyed/recreated,
    but rather wrapped/unwrapped when applying styling for visualchars so that selection
    is not lost.
  */
  editor.on('init', () => {
    Actions.applyVisualChars(editor, toggleState);
  });
};

export {
  setup
};
