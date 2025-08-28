import Editor from 'tinymce/core/api/Editor';
import Env from 'tinymce/core/api/Env';

import * as Utils from './Utils';

const setup = (editor: Editor): void => {
  // TINY-10177: On Safari, clicking on the expand arrow of the `details` element sets the selection before the `summary`,
  // so we override the selection to the beginning of `summary` content
  if (Env.browser.isSafari()) {
    editor.on('click', (e) => {
      if (Utils.isSummary(e.target)) {
        const summary = e.target;
        const rng = editor.selection.getRng();
        if (rng.collapsed && rng.startContainer === summary.parentNode && rng.startOffset === 0) {
          editor.selection.setCursorLocation(summary, 0);
        }
      }
    });
  }
};

export {
  setup
};
