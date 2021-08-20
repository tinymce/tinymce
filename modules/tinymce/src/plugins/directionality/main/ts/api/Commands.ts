/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import * as Direction from '../core/Direction';

const register = (editor: Editor): void => {
  editor.addCommand('mceDirectionLTR', () => {
    Direction.setDir(editor, 'ltr');
  });

  editor.addCommand('mceDirectionRTL', () => {
    Direction.setDir(editor, 'rtl');
  });
};

export {
  register
};
