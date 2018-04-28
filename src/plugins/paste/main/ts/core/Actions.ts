/**
 * Actions.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Events from '../api/Events';
import Settings from '../api/Settings';
import { Editor } from 'tinymce/core/api/Editor';
import { Clipboard } from '../api/Clipboard';

const shouldInformUserAboutPlainText = function (editor: Editor, userIsInformedState) {
  return userIsInformedState.get() === false && Settings.shouldPlainTextInform(editor);
};

const displayNotification = function (editor: Editor, message: string) {
  editor.notificationManager.open({
    text: editor.translate(message),
    type: 'info'
  });
};

const togglePlainTextPaste = function (editor: Editor, clipboard: Clipboard, userIsInformedState) {
  if (clipboard.pasteFormat.get() === 'text') {
    clipboard.pasteFormat.set('html');
    Events.firePastePlainTextToggle(editor, false);
  } else {
    clipboard.pasteFormat.set('text');
    Events.firePastePlainTextToggle(editor, true);

    if (shouldInformUserAboutPlainText(editor, userIsInformedState)) {
      displayNotification(editor, 'Paste is now in plain text mode. Contents will now be pasted as plain text until you toggle this option off.');
      userIsInformedState.set(true);
    }
  }

  editor.focus();
};

export default {
  togglePlainTextPaste
};