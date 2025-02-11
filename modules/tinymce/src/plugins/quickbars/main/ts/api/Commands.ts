import Editor from 'tinymce/core/api/Editor';

import * as Actions from '../insert/Actions';
import * as Conversions from '../insert/Conversions';
import * as Picker from '../insert/Picker';

const register = (editor: Editor): void => {
  editor.on('PreInit', () => {
    if (!editor.queryCommandSupported('QuickbarInsertImage')) {
      editor.addCommand('QuickbarInsertImage', () => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        Picker.pickFile(editor).then((files) => {
          if (files.length > 0) {
            const blob = files[0];

            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            Conversions.blobToBase64(blob).then((base64) => {
              Actions.insertBlob(editor, base64, blob);
            });
          }
        });
      });
    }
  });
};

export {
  register
};
