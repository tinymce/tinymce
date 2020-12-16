/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import * as Actions from '../core/Actions';
import { Clipboard } from './Clipboard';

const register = (editor: Editor, clipboard: Clipboard) => {
  editor.addCommand('mceTogglePlainTextPaste', () => {
    Actions.togglePlainTextPaste(editor, clipboard);
  });

  editor.addCommand('mceInsertClipboardContent', (ui, value) => {
    if (value.content) {
      clipboard.pasteHtml(value.content, value.internal);
    }

    if (value.text) {
      clipboard.pasteText(value.text);
    }
  });
};

export {
  register
};
