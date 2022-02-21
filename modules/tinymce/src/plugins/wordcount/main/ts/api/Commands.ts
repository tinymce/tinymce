import Editor from 'tinymce/core/api/Editor';

import { WordCountApi } from '../api/Api';
import * as Dialog from '../ui/Dialog';

const register = (editor: Editor, api: WordCountApi): void => {
  editor.addCommand('mceWordCount', () => Dialog.open(editor, api));
};

export {
  register
};
