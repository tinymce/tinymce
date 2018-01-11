/**
 * Commands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Actions from '../core/Actions';

const register = function (editor, clipboard, userIsInformedState) {
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