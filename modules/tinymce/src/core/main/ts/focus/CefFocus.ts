/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { document } from '@ephox/dom-globals';
import { Throttler } from '@ephox/katamari';
import * as CefUtils from '../keyboard/CefUtils';
import Editor from '../api/Editor';

const setup = function (editor: Editor) {
  const renderFocusCaret = Throttler.first(function () {
    // AP-24 Added the second condition in this if because of a race condition with setting focus on the PowerPaste
    // remove/keep formatting dialog on paste in IE11. Without this, because we paste twice on IE11, focus ends up set
    // in the editor, not the dialog buttons. Specifically, we focus, blur, focus, blur, focus then enter this throttled
    // code before the next blur has been able to run. With this check, this function doesn't run at all in this case,
    // so focus goes to the dialog's buttons correctly.
    if (!editor.removed && editor.getBody().contains(document.activeElement)) {
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

export {
  setup
};
