/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const register = function (editor: Editor) {
  editor.ui.registry.addButton('charmap', {
    icon: 'insert-character',
    tooltip: 'Special character',
    onAction: () => editor.execCommand('mceShowCharmap')
  });

  editor.ui.registry.addMenuItem('charmap', {
    icon: 'insert-character',
    text: 'Special character...',
    onAction: () => editor.execCommand('mceShowCharmap'),
  });
};

export default {
  register
};