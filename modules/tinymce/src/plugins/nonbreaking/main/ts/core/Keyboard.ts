/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import VK from 'tinymce/core/api/util/VK';
import Settings from '../api/Settings';
import Actions from './Actions';

const setup = function (editor) {
  const spaces = Settings.getKeyboardSpaces(editor);

  if (spaces > 0) {
    editor.on('keydown', function (e) {
      if (e.keyCode === VK.TAB && !e.isDefaultPrevented()) {
        if (e.shiftKey) {
          return;
        }

        e.preventDefault();
        e.stopImmediatePropagation();
        Actions.insertNbsp(editor, spaces);
      }
    });
  }
};

export default {
  setup
};