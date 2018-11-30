/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Actions from '../core/Actions';
import { Editor } from 'tinymce/core/api/Editor';
import { Clipboard } from '../api/Clipboard';

const register = function (editor: Editor, clipboard: Clipboard, userIsInformedState) {
  editor.addCommand('mceTogglePlainTextPaste', function () {
    Actions.togglePlainTextPaste(editor, clipboard, userIsInformedState);
  });

  editor.addCommand('mceInsertClipboardContent', function (ui, value) {
    if (value.content) {
      clipboard.pasteHtml(value.content, value.internal);
    }

    if (value.text) {
      clipboard.pasteText(value.text);
    }
  });
};

export default {
  register
};