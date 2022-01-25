/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import type Editor from '../Editor';

export const registerCommands = (editor: Editor) => {
  editor.editorCommands.addCommands({
    // Override list commands to fix WebKit bug
    'InsertUnorderedList,InsertOrderedList': (command) => {
      editor.getDoc().execCommand(command, false, null);

      // WebKit produces lists within block elements so we need to split them
      // we will replace the native list creation logic to custom logic later on
      // TODO: Remove this when the list creation logic is removed
      const listElm = editor.dom.getParent(editor.selection.getNode(), 'ol,ul');
      if (listElm) {
        const listParent = listElm.parentNode;

        // If list is within a text block then split that block
        if (/^(H[1-6]|P|ADDRESS|PRE)$/.test(listParent.nodeName)) {
          const bm = editor.selection.getBookmark();
          editor.dom.split(listParent, listElm);
          editor.selection.moveToBookmark(bm);
        }
      }
    }
  });

  editor.editorCommands.addCommands({
    'InsertUnorderedList,InsertOrderedList': (command) => {
      const list = editor.dom.getParent(editor.selection.getNode(), 'ul,ol') as HTMLElement;

      return list &&
        (
          command === 'insertunorderedlist' && list.tagName === 'UL' ||
          command === 'insertorderedlist' && list.tagName === 'OL'
        );
    }
  }, 'state');
};
