import * as InsertBr from '../../newline/InsertBr';
import * as InsertNewLine from '../../newline/InsertNewLine';
import Editor from '../Editor';

export const registerCommands = (editor: Editor): void => {
  editor.editorCommands.addCommands({
    insertParagraph: () => {
      // eslint-disable-next-line no-console
      console.log('editor.selection: ', editor.selection);
      // eslint-disable-next-line no-console
      console.log('editor.selection.destroy: ', editor.selection.destroy);
      // editor.selection.destroy();
      editor.selection.setContent('');
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
