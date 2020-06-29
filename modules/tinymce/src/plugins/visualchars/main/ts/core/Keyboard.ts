/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Delay from 'tinymce/core/api/util/Delay';
import * as VisualChars from './VisualChars';
import * as Settings from '../api/Settings';
import Editor from 'tinymce/core/api/Editor';

const setup = (editor: Editor, toggleState) => {
  const debouncedToggle = Delay.debounce(() => {
    VisualChars.toggle(editor);
  }, 300);

  if (Settings.hasForcedRootBlock(editor)) {
    editor.on('keydown', (e) => {
      if (toggleState.get() === true) {
        e.keyCode === 13 ? VisualChars.toggle(editor) : debouncedToggle();
      }
    });
  }
};

export {
  setup
};
