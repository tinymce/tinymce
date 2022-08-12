import Editor from 'tinymce/core/api/Editor';

import * as Dialog from '../ui/Dialog';
import { WordCountApi } from './Api';

const register = (editor: Editor, api: WordCountApi): void => {
  editor.addCommand('mceWordCount', () => Dialog.open(editor, api));
};

export {
  register
};
