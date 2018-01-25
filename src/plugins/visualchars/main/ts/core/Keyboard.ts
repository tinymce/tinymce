/**
 * Keyboard.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Delay from 'tinymce/core/api/util/Delay';
import VisualChars from './VisualChars';

const setup = function (editor, toggleState) {
  const debouncedToggle = Delay.debounce(function () {
    VisualChars.toggle(editor);
  }, 300);

  if (editor.settings.forced_root_block !== false) {
    editor.on('keydown', function (e) {
      if (toggleState.get() === true) {
        e.keyCode === 13 ? VisualChars.toggle(editor) : debouncedToggle();
      }
    });
  }
};

export default {
  setup
};