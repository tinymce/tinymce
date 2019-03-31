/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import Dialog from './Dialog';

const register = function (editor: Editor) {
  editor.ui.registry.addButton('help', {
    icon: 'help',
    tooltip: 'Help',
    onAction: Dialog.opener(editor)
  });

  editor.ui.registry.addMenuItem('help', {
    text: 'Help',
    icon: 'help',
    shortcut: 'Alt+0',
    onAction: Dialog.opener(editor)
  });
};

export default {
  register
};