/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor): void => {
  const onAction = () => editor.execCommand('InsertHorizontalRule');

  editor.ui.registry.addButton('hr', {
    icon: 'horizontal-rule',
    tooltip: 'Horizontal line',
    onAction
  });

  editor.ui.registry.addMenuItem('hr', {
    icon: 'horizontal-rule',
    text: 'Horizontal line',
    onAction
  });
};

export {
  register
};
