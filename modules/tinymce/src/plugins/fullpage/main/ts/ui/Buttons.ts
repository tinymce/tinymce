/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const register = function (editor: Editor) {
  editor.ui.registry.addButton('fullpage', {
    // TODO: This should be title or text, with no icon?
    tooltip: 'Metadata and document properties',
    icon: 'document-properties',
    onAction: () => {
      editor.execCommand('mceFullPageProperties');
    }
  });

  editor.ui.registry.addMenuItem('fullpage', {
    text: 'Metadata and document properties',
    icon: 'document-properties',
    onAction: () => {
      editor.execCommand('mceFullPageProperties');
    }
  });
};

export {
  register
};
