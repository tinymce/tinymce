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
  editor.ui.registry.addButton('pagebreak', {
    icon: 'page-break',
    tooltip: 'Page break',
    onAction: () => editor.execCommand('mcePageBreak')
  });

  editor.ui.registry.addMenuItem('pagebreak', {
    text: 'Page break',
    icon: 'page-break',
    onAction: () => editor.execCommand('mcePageBreak')
  });
};

export default {
  register
};