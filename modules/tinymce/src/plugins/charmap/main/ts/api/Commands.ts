import Editor from 'tinymce/core/api/Editor';

import * as CharMap from '../core/CharMap';
import * as Dialog from '../ui/Dialog';

type CharMap = CharMap.CharMap;

const register = (editor: Editor, charMap: CharMap[]): void => {
  editor.addCommand('mceShowCharmap', () => {
    Dialog.open(editor, charMap);
  });
};

export {
  register
};
