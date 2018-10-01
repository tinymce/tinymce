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
  editor.ui.registry.addButton('hr', {
    icon: 'horizontal-rule',
    tooltip: 'Horizontal line',
    onAction: () => editor.execCommand('InsertHorizontalRule'),
  });

  editor.ui.registry.addMenuItem('hr', {
    icon: 'horizontal-rule',
    text: 'Horizontal line',
    onAction: () => editor.execCommand('InsertHorizontalRule'),
    context: 'insert'
  });
};

export default {
  register
};