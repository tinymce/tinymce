/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const register = function (editor: Editor) {
  editor.ui.registry.addButton('print', {
    icon: 'print',
    tooltip: 'Print',
    onAction: () => editor.execCommand('mcePrint')
  });

  editor.ui.registry.addMenuItem('print', {
    text: 'Print...',
    icon: 'print',
    onAction: () => editor.execCommand('mcePrint')
  });
};

export {
  register
};
