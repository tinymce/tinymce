import Settings from '../api/Settings';

const addToEditor = (editor) => {
  editor.ui.registry.addContextToolbar('textselection', {
    type: 'contexttoolbar',
    predicate: (node) => {
      return !editor.selection.isCollapsed();
    },
    items:  Settings.getTextSelectionToolbarItems(editor),
    position: 'selection'
  });
};

export default {
  addToEditor
};