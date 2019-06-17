/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
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