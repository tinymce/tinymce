/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as InsertContent from '../../content/InsertContent';
import Editor from '../Editor';

export const registerCommands = (editor: Editor) => {
  editor.editorCommands.addCommands({
    mceCleanup: () => {
      const bm = editor.selection.getBookmark();
      editor.setContent(editor.getContent());
      editor.selection.moveToBookmark(bm);
    },

    insertHTML: (_command, _ui, value) => {
      InsertContent.insertAtCaret(editor, value);
    },

    mceInsertContent: (_command, _ui, value) => {
      InsertContent.insertAtCaret(editor, value);
    },

    mceSetContent: (_command, _ui, value) => {
      editor.setContent(value);
    },

    mceReplaceContent: (_command, _ui, value) => {
      editor.execCommand('mceInsertContent', false, value.replace(/\{\$selection\}/g, editor.selection.getContent({ format: 'text' })));
    },

    mceNewDocument: () => {
      editor.setContent('');
    },

    InsertHorizontalRule: () => {
      editor.execCommand('mceInsertContent', false, '<hr />');
    }
  });
};
