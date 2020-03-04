/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as Dialog from './Dialog';
import Editor from 'tinymce/core/api/Editor';
import { EmojiDatabase } from '../core/EmojiDatabase';

const register = function (editor: Editor, database: EmojiDatabase): void {
  const onAction = () => Dialog.open(editor, database);

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
