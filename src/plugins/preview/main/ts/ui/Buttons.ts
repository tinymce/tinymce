/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const register = function (editor: Editor) {
  editor.ui.registry.addButton('preview', {
    icon: 'preview',
    tooltip: 'Preview',
    onAction: () => editor.execCommand('mcePreview')
  });

  editor.ui.registry.addMenuItem('preview', {
    icon: 'preview',
    text: 'Preview',
    onAction: () => editor.execCommand('mcePreview'),
  });
};

export default {
  register
};