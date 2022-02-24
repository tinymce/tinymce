import Editor from 'tinymce/core/api/Editor';

import * as Actions from './Actions';
import * as Conversions from './Conversions';
import * as Picker from './Picker';

const setupButtons = (editor: Editor): void => {
  editor.ui.registry.addButton('quickimage', {
    icon: 'image',
    tooltip: 'Insert image',
    onAction: () => {
      Picker.pickFile(editor).then((files) => {
        if (files.length > 0) {
          const blob = files[0];

          Conversions.blobToBase64(blob).then((base64) => {
            Actions.insertBlob(editor, base64, blob);
          });
        }
      });
    }
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
