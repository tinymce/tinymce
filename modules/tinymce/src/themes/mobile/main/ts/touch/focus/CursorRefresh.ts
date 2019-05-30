/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Focus } from '@ephox/sugar';
import Delay from 'tinymce/core/api/util/Delay';

const refreshInput = function (input) {
  // This is magic used to refresh the iOS cursor on an input field when input focus is
  // lost and then restored. The setTime out is important for consistency, a lower value
  // may not yield a successful reselection when the time out value is 10, 30% success
  // on making the blue selection reappear.
  const start = input.dom().selectionStart;
  const end = input.dom().selectionEnd;
  const dir = input.dom().selectionDirection;
  Delay.setTimeout(function () {
    input.dom().setSelectionRange(start, end, dir);
    Focus.focus(input);
  }, 50);
};

const refresh = function (winScope) {
  // Sometimes the cursor can get out of sync with the content, it looks weird and importantly
  // it causes the code that dismisses the keyboard to fail, Fussy has selection code, but since
  // this is fired often and confined to iOS, it's implemented with more native code. Note, you
  // can see the need for this if you remove this code, and click near the bottom of the content
  // and start typing. The content will scroll up to go into the greenzone, but the cursor will
  // still display in the old location. It only updates once you keep typing. However, if we do this
  // hack, then the cursor is updated. You'll still have any autocorrect selection boxes, though.
  const sel = winScope.getSelection();
  if (sel.rangeCount > 0) {
    const br = sel.getRangeAt(0);
    const r = winScope.document.createRange();
    r.setStart(br.startContainer, br.startOffset);
    r.setEnd(br.endContainer, br.endOffset);

    // Note, if dropdowns appear to flicker, we might want to remove this line. All selections
    // (not Firefox) probably just replace the one selection anyway.
    sel.removeAllRanges();
    sel.addRange(r);
  }
};

export default {
  refreshInput,
  refresh
};