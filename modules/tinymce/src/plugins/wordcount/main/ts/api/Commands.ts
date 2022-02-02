/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import { WordCountApi } from '../api/Api';
import * as Dialog from '../ui/Dialog';

const register = (editor: Editor, api: WordCountApi): void => {
  editor.addCommand('mceWordCount', () => Dialog.open(editor, api));
};

export {
  register
};
