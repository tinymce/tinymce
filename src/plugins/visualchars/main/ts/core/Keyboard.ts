/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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