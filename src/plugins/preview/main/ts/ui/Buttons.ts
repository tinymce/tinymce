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
  editor.ui.registry.addButton('preview', {
    icon: 'preview',
    tooltip: 'Preview Text',
    onAction: () => editor.execCommand('mcePreview')
  });

  editor.ui.registry.addMenuItem('preview', {
    icon: 'preview',
    text: 'Preview',
    onAction: () => editor.execCommand('mcePreview'),
  });
};

export default {
  register
};