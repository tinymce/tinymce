/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import * as Dialog from './Dialog';

const register = (editor: Editor) => {
  editor.ui.registry.addButton('code', {
    icon: 'sourcecode',
    tooltip: 'Source code',
    onAction: () => Dialog.open(editor)
  });

  editor.ui.registry.addMenuItem('code', {
    icon: 'sourcecode',
    text: 'Source code',
    onAction: () => Dialog.open(editor)
  });
};

export {
  register
};
