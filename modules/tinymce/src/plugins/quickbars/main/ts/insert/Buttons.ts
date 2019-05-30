/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Actions from './Actions';
import Conversions from './Conversions';
import Picker from './Picker';
import Editor from 'tinymce/core/api/Editor';

const setupButtons = function (editor: Editor) {
  editor.ui.registry.addButton('quickimage', {
    icon: 'image',
    tooltip: 'Insert image',
    onAction () {
      Picker.pickFile().then(function (files) {
        const blob = files[0];

        Conversions.blobToBase64(blob).then(function (base64) {
          Actions.insertBlob(editor, base64, blob);
        });
      });
    }
  });

  editor.ui.registry.addButton('quicktable', {
    icon: 'table',
    tooltip: 'Insert table',
    onAction () {
      // panel.hide();
      Actions.insertTable(editor, 2, 2);
    }
  });
};

export default {
  setupButtons
};