import * as IndentOutdent from '../../commands/IndentOutdent';
import Editor from '../Editor';

export const registerCommands = (editor: Editor): void => {
  editor.editorCommands.addCommands({
    Indent: () => {
      IndentOutdent.indent(editor);
    },

    Outdent: () => {
      IndentOutdent.outdent(editor);
    },
  });

  editor.editorCommands.addCommands({
    Outdent: () => IndentOutdent.canOutdent(editor),
  }, 'state');
};
