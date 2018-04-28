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
  editor.addButton('hr', {
    icon: 'hr',
    tooltip: 'Horizontal line',
    cmd: 'InsertHorizontalRule'
  });

  editor.addMenuItem('hr', {
    icon: 'hr',
    text: 'Horizontal line',
    cmd: 'InsertHorizontalRule',
    context: 'insert'
  });
};

export default {
  register
};