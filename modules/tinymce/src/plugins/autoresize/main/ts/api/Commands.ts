/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import * as Resize from '../core/Resize';

const register = (editor: Editor, oldSize: Cell<number>) => {
  editor.addCommand('mceAutoResize', () => {
    Resize.resize(editor, oldSize);
  });
};

export {
  register
};
