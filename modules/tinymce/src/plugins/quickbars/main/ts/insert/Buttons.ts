/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

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
