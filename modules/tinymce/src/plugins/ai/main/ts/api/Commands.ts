import Editor from 'tinymce/core/api/Editor';

import * as Ai from '../core/Ai';

const register = (editor: Editor): void => {
  editor.addCommand('mceAi', () => {
    Ai.execAi(editor);
  });
};

export {
  register
};
