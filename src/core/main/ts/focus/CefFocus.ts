/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Throttler } from '@ephox/katamari';
import * as CefUtils from '../keyboard/CefUtils';

const setup = function (editor) {
  const renderFocusCaret = Throttler.first(function () {
    if (!editor.removed) {
      const rng = editor.selection.getRng();
      if (rng.collapsed) { // see TINY-1479
        const caretRange = CefUtils.renderRangeCaret(editor, editor.selection.getRng(), false);
        editor.selection.setRng(caretRange);
      }
    }
  }, 0);

  editor.on('focus', function () {
    renderFocusCaret.throttle();
  });

  editor.on('blur', function () {
    renderFocusCaret.cancel();
  });
};

export default {
  setup
};