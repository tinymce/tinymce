import type { Cell } from '@ephox/katamari';

import type Editor from 'tinymce/core/api/Editor';

import * as Resize from '../core/Resize';

const register = (editor: Editor, oldSize: Cell<Resize.ResizeData>): void => {
  editor.addCommand('mceAutoResize', () => {
    Resize.resize(editor, oldSize);
  });
};

export {
  register
};
