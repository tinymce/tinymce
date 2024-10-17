import Editor from 'tinymce/core/api/Editor';

import { Reverser } from '../core/Types';

const register = (editor: Editor, reverser: Reverser): void => {
  editor.addCommand('reverseOrderedList', reverser.toggleReversedOrderedList);
};

export {
  register
};
