/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import * as Dialog from '../ui/Dialog';
import * as Utils from '../util/Utils';

const register = (editor: Editor) => {
  editor.addCommand('codesample', () => {
    const node = editor.selection.getNode();
    if (editor.selection.isCollapsed() || Utils.isCodeSample(node)) {
      Dialog.open(editor);
    } else {
      editor.formatter.toggle('code');
    }
  });
};

export {
  register
};
