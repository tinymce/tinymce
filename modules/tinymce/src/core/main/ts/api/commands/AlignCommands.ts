/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Type } from '@ephox/katamari';

import { FormatVars } from '../../fmt/FormatTypes';
import type Editor from '../Editor';

const registerExecCommands = (editor: Editor) => {
  const toggleFormat = (name: string, value?: FormatVars) => {
    editor.formatter.toggle(name, value);
    editor.nodeChanged();
  };

  const toggleAlign = (align: string) => () => {
    // Remove all other alignments first
    Arr.each('left,center,right,justify'.split(','), (name) => {
      if (align !== name) {
        editor.formatter.remove('align' + name);
      }
    });

    if (align !== 'none') {
      toggleFormat('align' + align);
    }
  };

  editor.editorCommands.addCommands({
    JustifyLeft: toggleAlign('left'),
    JustifyCenter: toggleAlign('center'),
    JustifyRight: toggleAlign('right'),
    JustifyFull: toggleAlign('justify'),
    JustifyNone: toggleAlign('none')
  });
};

const registerStateCommands = (editor: Editor) => {
  const alignStates = (name: string) => () => {
    const selection = editor.selection;
    const nodes = selection.isCollapsed() ? [ editor.dom.getParent(selection.getNode(), editor.dom.isBlock) ] : selection.getSelectedBlocks();
    return Arr.exists(nodes, (node) => Type.isNonNullable(editor.formatter.matchNode(node, name)));
  };

  editor.editorCommands.addCommands({
    JustifyLeft: alignStates('alignleft'),
    JustifyCenter: alignStates('aligncenter'),
    JustifyRight: alignStates('alignright'),
    JustifyFull: alignStates('alignjustify')
  }, 'state');
};

export const registerCommands = (editor: Editor) => {
  registerExecCommands(editor);
  registerStateCommands(editor);
};
