import Editor from 'tinymce/core/api/Editor';

import * as Direction from '../core/Direction';

const register = (editor: Editor): void => {
  editor.addCommand('mceDirectionLTR', () => {
    Direction.setDir(editor, 'ltr');
  });

  editor.addCommand('mceDirectionRTL', () => {
    Direction.setDir(editor, 'rtl');
  });
};

export {
  register
};
