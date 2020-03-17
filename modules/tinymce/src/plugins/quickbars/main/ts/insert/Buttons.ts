/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as Actions from './Actions';
import * as Conversions from './Conversions';
import * as Picker from './Picker';
import Editor from 'tinymce/core/api/Editor';

const setupButtons = function (editor: Editor) {
  editor.ui.registry.addButton('quickimage', {
    icon: 'image',
    tooltip: 'Insert image',
    onAction() {
      Picker.pickFile(editor).then(function (files) {
        if (files.length > 0) {
          const blob = files[0];

          Conversions.blobToBase64(blob).then(function (base64) {
            Actions.insertBlob(editor, base64, blob);
          });
        }
      });
    }
  });

  editor.ui.registry.addButton('quicktable', {
    icon: 'table',
    tooltip: 'Insert table',
    onAction() {
      // panel.hide();
      Actions.insertTable(editor, 2, 2);
    }
  });
};

export {
  setupButtons
};
