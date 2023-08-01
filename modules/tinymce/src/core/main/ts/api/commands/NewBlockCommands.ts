import * as NewBlock from '../../newline/NewBlock';
import Editor from '../Editor';

export const registerCommands = (editor: Editor): void => {
  editor.editorCommands.addCommands({
    InsertNewBlockBefore: () => {
      NewBlock.insertBefore(editor);
    },
    InsertNewBlockAfter: () => {
      NewBlock.insertAfter(editor);
    },
  });
};

