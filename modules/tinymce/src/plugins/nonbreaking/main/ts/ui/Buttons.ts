/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const register = function (editor: Editor) {
  editor.ui.registry.addButton('nonbreaking', {
    icon: 'non-breaking',
    tooltip: 'Nonbreaking space',
    onAction: () => editor.execCommand('mceNonBreaking')
  });

  editor.ui.registry.addMenuItem('nonbreaking', {
    icon: 'non-breaking',
    text: 'Nonbreaking space',
    onAction: () => editor.execCommand('mceNonBreaking')
  });
};

export {
  register
};
