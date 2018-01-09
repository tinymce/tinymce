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

var register = function (editor) {
  editor.addButton('code', {
    icon: 'code',
    tooltip: 'Source code',
    onclick: function () {
      Dialog.open(editor);
    }
  });

  editor.addMenuItem('code', {
    icon: 'code',
    text: 'Source code',
    onclick: function () {
      Dialog.open(editor);
    }
  });
};

export default {
  register: register
};