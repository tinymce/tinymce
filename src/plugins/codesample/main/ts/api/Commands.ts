/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Dialog from '../ui/Dialog';
import Utils from '../util/Utils';
import Editor from 'tinymce/core/api/Editor';

const register = function (editor: Editor) {
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