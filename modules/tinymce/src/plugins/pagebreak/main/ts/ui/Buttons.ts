import Editor from 'tinymce/core/api/Editor';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';

const onSetupEditable = (editor: Editor) => (api: Toolbar.ToolbarButtonInstanceApi | Menu.MenuItemInstanceApi): VoidFunction => {
  const nodeChanged = () => {
    api.setEnabled(editor.selection.isEditable());
  };

  editor.on('NodeChange', nodeChanged);
  nodeChanged();

  return () => {
    editor.off('NodeChange', nodeChanged);
  };
};

const register = (editor: Editor): void => {
  const onAction = () => editor.execCommand('mcePageBreak');

  editor.ui.registry.addButton('pagebreak', {
    icon: 'page-break',
    tooltip: 'Page break',
    onAction,
    onSetup: onSetupEditable(editor)
  });

  editor.ui.registry.addMenuItem('pagebreak', {
    text: 'Page break',
    icon: 'page-break',
    onAction,
    onSetup: onSetupEditable(editor)
  });
};

export {
  register
};
