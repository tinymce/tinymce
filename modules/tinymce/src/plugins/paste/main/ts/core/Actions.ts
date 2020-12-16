/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { Clipboard } from '../api/Clipboard';
import * as Events from '../api/Events';

const togglePlainTextPaste = (editor: Editor, clipboard: Clipboard) => {
  if (clipboard.pasteFormat.get() === 'text') {
    clipboard.pasteFormat.set('html');
    Events.firePastePlainTextToggle(editor, false);
  } else {
    clipboard.pasteFormat.set('text');
    Events.firePastePlainTextToggle(editor, true);
  }
  editor.focus();
};

export {
  togglePlainTextPaste
};
