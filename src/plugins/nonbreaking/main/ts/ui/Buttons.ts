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
  editor.ui.registry.addButton('nonbreaking', {
    icon: 'non-breaking',
    tooltip: 'Nonbreaking space',
    onAction: () => editor.execCommand('mceNonBreaking')
  });

  editor.ui.registry.addMenuItem('nonbreaking', {
    icon: 'non-breaking',
    text: 'Nonbreaking space',
    onAction: () => editor.execCommand('mceNonBreaking')
  });
};

export default {
  register
};