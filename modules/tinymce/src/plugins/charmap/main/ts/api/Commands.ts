/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import * as CharMap from '../core/CharMap';
import * as Dialog from '../ui/Dialog';

type CharMap = CharMap.CharMap;

const register = (editor: Editor, charMap: CharMap[]): void => {
  editor.addCommand('mceShowCharmap', () => {
    Dialog.open(editor, charMap);
  });
};

export {
  register
};
