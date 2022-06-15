import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';

const setup = (editor: Editor): void => {
  editor.addShortcut('Meta+K', '', () => {
    if (Options.useQuickLink(editor)) {
      editor.execCommand('mceLink', false);
    } else {
      editor.execCommand('mceLink', true);
    }

  });
};

export {
  setup
};
