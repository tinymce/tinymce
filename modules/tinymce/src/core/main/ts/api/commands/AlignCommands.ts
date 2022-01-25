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

  // Add execCommand overrides
  editor.editorCommands.addCommands({
    'JustifyLeft,JustifyCenter,JustifyRight,JustifyFull,JustifyNone': (command) => {
      let align = command.substring(7);

      if (align === 'full') {
        align = 'justify';
      }

      // Remove all other alignments first
      Arr.each('left,center,right,justify'.split(','), (name) => {
        if (align !== name) {
          editor.formatter.remove('align' + name);
        }
      });

      if (align !== 'none') {
        toggleFormat('align' + align);
      }
    }
  });
};

const registerStateCommands = (editor: Editor) => {
  const alignStates = (name: string) => () => {
    const selection = editor.selection;
    const nodes = selection.isCollapsed() ? [ editor.dom.getParent(selection.getNode(), editor.dom.isBlock) ] : selection.getSelectedBlocks();
    const matches = Arr.map(nodes, (node) => Type.isNonNullable(editor.formatter.matchNode(node, name)));
    return Arr.contains(matches, true);
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
