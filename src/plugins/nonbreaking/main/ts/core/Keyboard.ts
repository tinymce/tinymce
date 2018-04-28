/**
 * Keyboard.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
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