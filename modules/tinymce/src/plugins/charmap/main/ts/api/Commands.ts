/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import * as Dialog from '../ui/Dialog';
import * as CharMap from '../core/CharMap';

type CharMap = CharMap.CharMap;

const register = function (editor: Editor, charMap: CharMap[]) {
  editor.addCommand('mceShowCharmap', function () {
    Dialog.open(editor, charMap);
  });
};

export {
  register
};
