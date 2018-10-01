import Actions from './Actions';
import Conversions from './Conversions';
import Picker from './Picker';

/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
// import { Editor } from 'tinymce/core/api/Editor';

const setupButtons = function (editor) {
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