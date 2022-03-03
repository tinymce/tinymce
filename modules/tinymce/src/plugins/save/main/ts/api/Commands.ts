import Editor from 'tinymce/core/api/Editor';

import * as Actions from '../core/Actions';

const register = (editor: Editor): void => {
  editor.addCommand('mceSave', () => {
    Actions.save(editor);
  });

  editor.addCommand('mceCancel', () => {
    Actions.cancel(editor);
  });
};

export {
  register
};
