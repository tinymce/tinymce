import Editor from 'tinymce/core/api/Editor';
import { NodeChangeEvent } from 'tinymce/core/api/EventTypes';
import { Toolbar } from 'tinymce/core/api/ui/Ui';

import * as Util from '../core/Util';

const setupToggleButtonHandler = (editor: Editor, listName: string) => (api: Toolbar.ToolbarToggleButtonInstanceApi): () => void => {
  const toggleButtonHandler = (e: NodeChangeEvent) => {
    api.setActive(Util.inList(e.parents, listName));
    api.setEnabled(!Util.isWithinNonEditableList(editor, e.element) && editor.selection.isEditable());
  };

  api.setEnabled(editor.selection.isEditable());

  return Util.setNodeChangeHandler(editor, toggleButtonHandler);
};

const register = (editor: Editor): void => {
  const exec = (command: string) => () => editor.execCommand(command);

  if (!editor.hasPlugin('advlist')) {
    editor.ui.registry.addToggleButton('numlist', {
      icon: 'ordered-list',
      active: false,
      tooltip: 'Numbered list',
      onAction: exec('InsertOrderedList'),
      onSetup: setupToggleButtonHandler(editor, 'OL')
    });

    editor.ui.registry.addToggleButton('bullist', {
      icon: 'unordered-list',
      active: false,
      tooltip: 'Bullet list',
      onAction: exec('InsertUnorderedList'),
      onSetup: setupToggleButtonHandler(editor, 'UL')
    });
  }
};

export {
  register
};
