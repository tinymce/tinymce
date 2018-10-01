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
  editor.ui.registry.addButton('codesample', {
    icon: 'code-sample',
    tooltip: 'Insert/Edit Code Sample',
    onAction: () => Dialog.open(editor)
  });

  editor.ui.registry.addMenuItem('codesample', {
    text: 'Code Sample',
    icon: 'code-sample',
    onAction: () => Dialog.open(editor)
  });
};

export default {
  register
};