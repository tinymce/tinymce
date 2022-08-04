import Editor from 'tinymce/core/api/Editor';

import * as Util from '../core/Util';

const register = (editor: Editor): void => {
  const exec = (command: string) => () => editor.execCommand(command);

  if (!editor.hasPlugin('advlist')) {
    editor.ui.registry.addToggleButton('numlist', {
      icon: 'ordered-list',
      active: false,
      tooltip: 'Numbered list',
      onAction: exec('InsertOrderedList'),
      onSetup: Util.setupButtonHandler(editor, 'OL')
    });

    editor.ui.registry.addToggleButton('bullist', {
      icon: 'unordered-list',
      active: false,
      tooltip: 'Bullet list',
      onAction: exec('InsertUnorderedList'),
      onSetup: Util.setupButtonHandler(editor, 'UL')
    });
  }
};

export {
  register
};
