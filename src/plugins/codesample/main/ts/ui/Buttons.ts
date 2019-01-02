/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Dialog from './Dialog';
import { Editor } from 'tinymce/core/api/Editor';

const register = function (editor: Editor) {
  editor.ui.registry.addButton('codesample', {
    icon: 'code-sample',
    tooltip: 'Insert/edit code sample',
    onAction: () => Dialog.open(editor)
  });

  editor.ui.registry.addMenuItem('codesample', {
    text: 'Code sample...',
    icon: 'code-sample',
    onAction: () => Dialog.open(editor)
  });
};

export default {
  register
};