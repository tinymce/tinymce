/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const register = (editor: Editor): void => {
  const onAction = () => editor.execCommand('mceEmoticons');

  editor.ui.registry.addButton('emoticons', {
    tooltip: 'Emoticons',
    icon: 'emoji',
    onAction
  });

  editor.ui.registry.addMenuItem('emoticons', {
    text: 'Emoticons...',
    icon: 'emoji',
    onAction
  });
};

export {
  register
};
