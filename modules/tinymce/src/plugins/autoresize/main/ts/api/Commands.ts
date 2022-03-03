import { Cell } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Resize from '../core/Resize';

const register = (editor: Editor, oldSize: Cell<number>): void => {
  editor.addCommand('mceAutoResize', () => {
    Resize.resize(editor, oldSize);
  });
};

export {
  register
};
