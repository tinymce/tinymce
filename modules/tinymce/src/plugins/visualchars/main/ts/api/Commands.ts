import { Cell } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Actions from '../core/Actions';

const register = (editor: Editor, toggleState: Cell<boolean>): void => {
  editor.addCommand('mceVisualChars', () => {
    Actions.toggleVisualChars(editor, toggleState);
  });
};

export {
  register
};
