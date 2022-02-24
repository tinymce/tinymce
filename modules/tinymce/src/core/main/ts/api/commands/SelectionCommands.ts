import * as NodeType from '../../dom/NodeType';
import Editor from '../Editor';

export const registerCommands = (editor: Editor): void => {
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
