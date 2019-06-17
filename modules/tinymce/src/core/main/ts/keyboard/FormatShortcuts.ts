/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
import Editor from '../api/Editor';

const setup = function (editor: Editor) {
  // Add some inline shortcuts
  editor.addShortcut('meta+b', '', 'Bold');
  editor.addShortcut('meta+i', '', 'Italic');
  editor.addShortcut('meta+u', '', 'Underline');

  // BlockFormat shortcuts keys
  for (let i = 1; i <= 6; i++) {
    editor.addShortcut('access+' + i, '', ['FormatBlock', false, 'h' + i]);
  }

  editor.addShortcut('access+7', '', ['FormatBlock', false, 'p']);
  editor.addShortcut('access+8', '', ['FormatBlock', false, 'div']);
  editor.addShortcut('access+9', '', ['FormatBlock', false, 'address']);
};

export default {
  setup
};