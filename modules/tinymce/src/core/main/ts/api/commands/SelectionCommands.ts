/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as NodeType from '../../dom/NodeType';
import type Editor from '../Editor';

export const registerCommands = (editor: Editor) => {
  editor.editorCommands.addCommands({
    mceSelectNodeDepth: (_command, _ui, value) => {
      let counter = 0;

      editor.dom.getParent(editor.selection.getNode(), (node) => {
        if (node.nodeType === 1 && counter++ === value) {
          editor.selection.select(node);
          return false;
        }
      }, editor.getBody());
    },

    mceSelectNode: (_command, _ui, value) => {
      editor.selection.select(value);
    },

    selectAll: () => {
      const editingHost = editor.dom.getParent(editor.selection.getStart(), NodeType.isContentEditableTrue);
      if (editingHost) {
        const rng = editor.dom.createRng();
        rng.selectNodeContents(editingHost);
        editor.selection.setRng(rng);
      }
    }
  });
};
