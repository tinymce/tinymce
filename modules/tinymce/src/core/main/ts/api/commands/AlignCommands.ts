import { Arr, Type } from '@ephox/katamari';

import { FormatVars } from '../../fmt/FormatTypes';
import Editor from '../Editor';

const registerExecCommands = (editor: Editor): void => {
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

const registerQueryStateCommands = (editor: Editor): void => {
  const alignStates = (name: string) => () => {
    const selection = editor.selection;
    const nodes: Array<Element | null> = selection.isCollapsed() ? [ editor.dom.getParent(selection.getNode(), editor.dom.isBlock) ] : selection.getSelectedBlocks();
    return Arr.exists(nodes, (node) => Type.isNonNullable(editor.formatter.matchNode(node, name)));
  };

  editor.editorCommands.addCommands({
    JustifyLeft: alignStates('alignleft'),
    JustifyCenter: alignStates('aligncenter'),
    JustifyRight: alignStates('alignright'),
    JustifyFull: alignStates('alignjustify')
  }, 'state');
};

export const registerCommands = (editor: Editor): void => {
  registerExecCommands(editor);
  registerQueryStateCommands(editor);
};
