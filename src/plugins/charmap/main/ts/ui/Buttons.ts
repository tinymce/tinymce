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
  editor.addButton('charmap', {
    icon: 'charmap',
    tooltip: 'Special character',
    cmd: 'mceShowCharmap'
  });

  editor.addMenuItem('charmap', {
    icon: 'charmap',
    text: 'Special character',
    cmd: 'mceShowCharmap',
    context: 'insert'
  });
};

export default {
  register
};