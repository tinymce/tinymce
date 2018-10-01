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
  editor.ui.registry.addButton('help', {
    icon: 'help',
    tooltip: 'Help',
    onAction: Dialog.opener(editor, pluginUrl)
  });

  editor.ui.registry.addMenuItem('help', {
    text: 'Help',
    icon: 'help',
    onAction: Dialog.opener(editor, pluginUrl)
  });
};

export default {
  register
};