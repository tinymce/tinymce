/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Editor } from 'tinymce/core/api/Editor';
import { Clipboard } from '../api/Clipboard';

const makeSetupHandler = (editor: Editor, clipboard: Clipboard) => (api) => {
  api.setActive(clipboard.pasteFormat.get() === 'text');
  const pastePlainTextToggleHandler = (e) => api.setActive(e.state);
  editor.on('PastePlainTextToggle', pastePlainTextToggleHandler);
  return () => editor.off('PastePlainTextToggle', pastePlainTextToggleHandler);
};

const register = function (editor: Editor, clipboard: Clipboard) {
  editor.ui.registry.addToggleButton('pastetext', {
    active: false,
    icon: 'paste-text',
    tooltip: 'Paste as text',
    onAction: () => editor.execCommand('mceTogglePlainTextPaste'),
    onSetup: makeSetupHandler(editor, clipboard)
  });

  editor.ui.registry.addToggleMenuItem('pastetext', {
    text: 'Paste as text',
    onAction: () => editor.execCommand('mceTogglePlainTextPaste'),
    onSetup: makeSetupHandler(editor, clipboard)
  });
};

export default {
  register
};