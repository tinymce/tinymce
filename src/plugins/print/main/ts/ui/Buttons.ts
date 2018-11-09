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
  editor.ui.registry.addButton('print', {
    icon: 'print',
    tooltip: 'Print',
    onAction: () => editor.execCommand('mcePrint')
  });

  editor.ui.registry.addMenuItem('print', {
    text: 'Print...',
    icon: 'print',
    onAction: () => editor.execCommand('mcePrint')
  });
};

export default {
  register
};