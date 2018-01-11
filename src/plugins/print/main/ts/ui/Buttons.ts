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
  editor.addButton('print', {
    title: 'Print',
    cmd: 'mcePrint'
  });

  editor.addMenuItem('print', {
    text: 'Print',
    cmd: 'mcePrint',
    icon: 'print'
  });
};

export default {
  register
};