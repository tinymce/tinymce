import * as EditorFocus from '../../focus/EditorFocus';
import Editor from '../Editor';
import * as AlignCommands from './AlignCommands';
import * as ClipboardCommands from './ClipboardCommands';
import * as ContentCommands from './ContentCommands';
import * as FormatCommands from './FormatCommands';
import * as HistoryCommands from './HistoryCommands';
import * as IndentCommands from './IndentCommands';
import * as LinkCommands from './LinkCommands';
import * as ListCommands from './ListCommands';
import * as NewBlockCommands from './NewBlockCommands';
import * as NewlineCommands from './NewlineCommands';
import * as SelectionCommands from './SelectionCommands';

const registerExecCommands = (editor: Editor): void => {
  editor.editorCommands.addCommands({
    mceRemoveNode: (_command, _ui, value) => {
      const node = value ?? editor.selection.getNode();

      // Make sure that the body node isn't removed
      if (node !== editor.getBody()) {
        const bm = editor.selection.getBookmark();
        editor.dom.remove(node, true);
        editor.selection.moveToBookmark(bm);
      }
    },

    mcePrint: () => {
      editor.getWin().print();
    },

    mceFocus: (_command, _ui, value?: boolean) => {
      EditorFocus.focus(editor, value === true);
    },

    mceToggleVisualAid: () => {
      editor.hasVisual = !editor.hasVisual;
      editor.addVisual();
    }
  });
};

export const registerCommands = (editor: Editor): void => {
  AlignCommands.registerCommands(editor);
  ClipboardCommands.registerCommands(editor);
  HistoryCommands.registerCommands(editor);
  SelectionCommands.registerCommands(editor);
  ContentCommands.registerCommands(editor);
  LinkCommands.registerCommands(editor);
  IndentCommands.registerCommands(editor);
  NewBlockCommands.registerCommands(editor);
  NewlineCommands.registerCommands(editor);
  ListCommands.registerCommands(editor);
  FormatCommands.registerCommands(editor);

  registerExecCommands(editor);
};
