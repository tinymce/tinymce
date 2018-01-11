/**
 * Commands.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Dialog from '../ui/Dialog';
import Utils from '../util/Utils';

const register = function (editor) {
  editor.addCommand('codesample', function () {
    const node = editor.selection.getNode();
    if (editor.selection.isCollapsed() || Utils.isCodeSample(node)) {
      Dialog.open(editor);
    } else {
      editor.formatter.toggle('code');
    }
  });
};

export default {
  register
};