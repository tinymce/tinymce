import Editor from 'tinymce/core/api/Editor';

import * as Dialog from '../ui/Dialog';
import * as Utils from '../util/Utils';

const register = (editor: Editor): void => {
  editor.addCommand('codesample', () => {
    const node = editor.selection.getNode();
    if (editor.selection.isCollapsed() || Utils.isCodeSample(node)) {
      Dialog.open(editor);
    } else {
      editor.formatter.toggle('code');
    }
  });
};

export {
  register
};
