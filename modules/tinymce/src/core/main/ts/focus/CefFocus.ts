import { Throttler } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as FakeCaretUtils from '../caret/FakeCaretUtils';

const setup = (editor: Editor): void => {
  const renderFocusCaret = Throttler.first(() => {
    // AP-24 Added the second condition in this if because of a race condition with setting focus on the PowerPaste
    // remove/keep formatting dialog on paste in IE11. Without this, because we paste twice on IE11, focus ends up set
    // in the editor, not the dialog buttons. Specifically, we focus, blur, focus, blur, focus then enter this throttled
    // code before the next blur has been able to run. With this check, this function doesn't run at all in this case,
    // so focus goes to the dialog's buttons correctly.
    if (!editor.removed && editor.getBody().contains(document.activeElement)) {
      const rng = editor.selection.getRng();
      if (rng.collapsed) { // see TINY-1479
        const caretRange = FakeCaretUtils.renderRangeCaret(editor, rng, false);
        editor.selection.setRng(caretRange);
      }
    }
  }, 0);

  editor.on('focus', () => {
    renderFocusCaret.throttle();
  });

  editor.on('blur', () => {
    renderFocusCaret.cancel();
  });
};

export {
  setup
};
