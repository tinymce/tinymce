import Editor from 'tinymce/core/api/Editor';

import { open } from '../ui/Dialog';

const register = (editor: Editor): void => {
  editor.addCommand('mcePreview', () => {
    open(editor);
  });
};

export {
  register
};
