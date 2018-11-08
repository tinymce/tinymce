/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const register = function (editor) {
  editor.ui.registry.addButton('charmap', {
    icon: 'insert-character',
    tooltip: 'Special character',
    onAction: () => editor.execCommand('mceShowCharmap')
  });

  editor.ui.registry.addMenuItem('charmap', {
    icon: 'insert-character',
    text: 'Special character...',
    onAction: () => editor.execCommand('mceShowCharmap'),
  });
};

export default {
  register
};