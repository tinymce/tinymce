/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as Dialog from './Dialog';
import Editor from 'tinymce/core/api/Editor';
import { WordCountApi } from '../api/Api';

const register = (editor: Editor, api: WordCountApi) => {
  editor.ui.registry.addButton('wordcount', {
    tooltip: 'Word count',
    icon: 'character-count',
    onAction: () => Dialog.open(editor, api)
  });

  editor.ui.registry.addMenuItem('wordcount', {
    text: 'Word count',
    icon: 'character-count',
    onAction: () => Dialog.open(editor, api)
  });
};

export {
  register
};