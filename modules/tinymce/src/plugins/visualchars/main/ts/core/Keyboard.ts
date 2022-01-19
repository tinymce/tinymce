/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell, Throttler } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as VisualChars from './VisualChars';

const setup = (editor: Editor, toggleState: Cell<boolean>): void => {
  const debouncedToggle = Throttler.first(() => {
    VisualChars.toggle(editor);
  }, 300);

  editor.on('keydown', (e) => {
    if (toggleState.get() === true) {
      e.keyCode === 13 ? VisualChars.toggle(editor) : debouncedToggle.throttle();
    }
  });

  editor.on('remove', debouncedToggle.cancel);
};

export {
  setup
};
