/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor): void => {

  const onAction = () => editor.execCommand('mceCodeEditor');

  editor.ui.registry.addButton('code', {
    icon: 'sourcecode',
    tooltip: 'Source code',
    onAction
  });

  editor.ui.registry.addMenuItem('code', {
    icon: 'sourcecode',
    text: 'Source code',
    onAction
  });
};

export {
  register
};
