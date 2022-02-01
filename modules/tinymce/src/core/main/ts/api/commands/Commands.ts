/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

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

    mcePrint: (_command, _ui, _value?: boolean) => {
      editor.getWin().print();
    },

    mceFocus: (_command, _ui, value?: boolean) => {
      EditorFocus.focus(editor, value);
    },

    mceToggleVisualAid: (_command, _ui, _value?: boolean) => {
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
  NewlineCommands.registerCommands(editor);
  ListCommands.registerCommands(editor);
  FormatCommands.registerCommands(editor);

  registerExecCommands(editor);
};
