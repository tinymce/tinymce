import { blockbreak } from '../../newline/InsertBlock';
import { linebreak } from '../../newline/InsertBr';
import * as InsertNewLine from '../../newline/InsertNewLine';
import Editor from '../Editor';

export const registerCommands = (editor: Editor): void => {
  editor.editorCommands.addCommands({
    insertParagraph: () => {
      InsertNewLine.insertBreak(blockbreak, editor);
    },

    mceInsertNewLine: (_command, _ui, value) => {
      InsertNewLine.insert(editor, value);
    },

    InsertLineBreak: (_command, _ui, _value) => {
      InsertNewLine.insertBreak(linebreak, editor);
    }
  });
};
