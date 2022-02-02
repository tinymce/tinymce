/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Actions from '../core/Actions';

const register = (editor: Editor, toggleState: Cell<boolean>): void => {
  editor.addCommand('mceVisualChars', () => {
    Actions.toggleVisualChars(editor, toggleState);
  });
};

export {
  register
};
