import { Fun } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Util from '../core/Util';

const setupHandler = (editor: Editor, listName: string) => (api) =>
  Fun.compose(Util.listButtonState(editor, api.setEnabled), Util.listState(editor, listName, api.setActive));

const register = (editor: Editor): void => {
  const exec = (command: string) => () => editor.execCommand(command);

  if (!editor.hasPlugin('advlist')) {
    editor.ui.registry.addToggleButton('numlist', {
      icon: 'ordered-list',
      active: false,
      tooltip: 'Numbered list',
      onAction: exec('InsertOrderedList'),
      onSetup: setupHandler(editor, 'OL')
    });

    editor.ui.registry.addToggleButton('bullist', {
      icon: 'unordered-list',
      active: false,
      tooltip: 'Bullet list',
      onAction: exec('InsertUnorderedList'),
      onSetup: setupHandler(editor, 'UL')
    });
  }
};

export {
  register
};
