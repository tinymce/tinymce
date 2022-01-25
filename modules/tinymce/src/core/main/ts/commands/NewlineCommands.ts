/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import type Editor from '../api/Editor';
import * as InsertBr from '../newline/InsertBr';
import * as InsertNewLine from '../newline/InsertNewLine';

export const registerCommands = (editor: Editor) => {
  editor.editorCommands.addCommands({
    mceInsertNewLine: (_command, _ui, value) => {
      InsertNewLine.insert(editor, value);
    },

    InsertLineBreak: (_command, _ui, value) => {
      InsertBr.insert(editor, value);
    }
  });
};
