/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Dialog from './Dialog';

const register = function (editor, pluginUrl) {
  editor.addButton('help', {
    icon: 'help',
    onclick: Dialog.open(editor, pluginUrl)
  });

  editor.addMenuItem('help', {
    text: 'Help',
    icon: 'help',
    context: 'help',
    onclick: Dialog.open(editor, pluginUrl)
  });
};

export default {
  register
};