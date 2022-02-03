/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as InsertBr from '../../newline/InsertBr';
import * as InsertNewLine from '../../newline/InsertNewLine';
import Editor from '../Editor';

export const registerCommands = (editor: Editor): void => {
  editor.editorCommands.addCommands({
    insertParagraph: () => {
      InsertNewLine.insert(editor);
    },

    mceInsertNewLine: (_command, _ui, value) => {
      InsertNewLine.insert(editor, value);
    },

    InsertLineBreak: (_command, _ui, value) => {
      InsertBr.insert(editor, value);
    }
  });
};
