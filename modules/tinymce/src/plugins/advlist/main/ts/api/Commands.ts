import Editor from 'tinymce/core/api/Editor';

import * as Actions from '../core/Actions';

const register = (editor: Editor): void => {
  editor.addCommand('ApplyUnorderedListStyle', (ui, value) => {
    Actions.applyListFormat(editor, 'UL', value['list-style-type']);
  });

  editor.addCommand('ApplyOrderedListStyle', (ui, value) => {
    Actions.applyListFormat(editor, 'OL', value['list-style-type']);
  });
};

export {
  register
};
