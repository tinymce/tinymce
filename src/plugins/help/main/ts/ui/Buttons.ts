/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Dialog from './Dialog';

const register = function (editor, pluginUrl) {
  editor.addButton('help', {
    icon: 'help',
    onclick: Dialog.open(editor, pluginUrl)
  });

  editor.addMenuItem('help', {
    text: 'Help',
    icon: 'help',
    context: 'help',
    onclick: Dialog.open(editor, pluginUrl)
  });
};

export default {
  register
};