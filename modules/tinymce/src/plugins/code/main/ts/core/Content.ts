/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const setContent = (editor: Editor, html: string): void => {
  // We get a lovely "Wrong document" error in IE 11 if we
  // don't move the focus to the editor before creating an undo
  // transaction since it tries to make a bookmark for the current selection
  editor.focus();

  editor.undoManager.transact(() => {
    editor.setContent(html);
  });

  editor.selection.setCursorLocation();
  editor.nodeChanged();
};

const getContent = (editor: Editor): string => {
  return editor.getContent({ source_view: true });
};

export {
  setContent,
  getContent
};
