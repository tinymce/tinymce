import Editor from 'tinymce/core/api/Editor';

import * as Actions from './Actions';

const setupButtons = (editor: Editor): void => {
  editor.ui.registry.addButton('quickimage', {
    icon: 'image',
    tooltip: 'Insert image',
    onAction: () => editor.execCommand('QuickbarInsertImage')
  });

  editor.ui.registry.addButton('quicktable', {
    icon: 'table',
    tooltip: 'Insert table',
    onAction: () => {
      Actions.insertTable(editor, 2, 2);
    }
  });
};

export {
  setupButtons
};
