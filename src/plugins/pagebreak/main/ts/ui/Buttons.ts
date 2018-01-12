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
  editor.addButton('pagebreak', {
    title: 'Page break',
    cmd: 'mcePageBreak'
  });

  editor.addMenuItem('pagebreak', {
    text: 'Page break',
    icon: 'pagebreak',
    cmd: 'mcePageBreak',
    context: 'insert'
  });
};

export default {
  register
};