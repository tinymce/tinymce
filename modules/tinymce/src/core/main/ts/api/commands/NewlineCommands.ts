import { execDeleteCommand } from 'tinymce/core/delete/DeleteUtils';

import * as InsertBr from '../../newline/InsertBr';
import * as InsertNewLine from '../../newline/InsertNewLine';
import Editor from '../Editor';

export const registerCommands = (editor: Editor): void => {
  editor.editorCommands.addCommands({
    insertParagraph: () => {
      if (editor.selection.isCollapsed() === false) {
        execDeleteCommand(editor);
      }
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
