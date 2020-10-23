/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const register = function (editor: Editor) {
  editor.ui.registry.addButton('pagebreak', {
    icon: 'page-break',
    tooltip: 'Page break',
    onAction: () => editor.execCommand('mcePageBreak')
  });

  editor.ui.registry.addMenuItem('pagebreak', {
    text: 'Page break',
    icon: 'page-break',
    onAction: () => editor.execCommand('mcePageBreak')
  });
};

export {
  register
};
