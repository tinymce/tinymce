import * as MoveBlock from '../../MoveBlocks';
import Editor from '../Editor';

export const registerCommands = (editor: Editor): void => {
  editor.editorCommands.addCommands({
    MoveBlockUp: () => {
      MoveBlock.moveBlockUp(editor);
    },
    MoveBlockDown: () => {
      MoveBlock.moveBlockDown(editor);
    },
  });
};

