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

const register = function (editor) {
  editor.addButton('code', {
    icon: 'code',
    tooltip: 'Source code',
    onclick () {
      Dialog.open(editor);
    }
  });

  editor.addMenuItem('code', {
    icon: 'code',
    text: 'Source code',
    onclick () {
      Dialog.open(editor);
    }
  });
};

export default {
  register
};