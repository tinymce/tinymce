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
  const onAction = () => editor.execCommand('mceShowCharmap');

  editor.ui.registry.addButton('charmap', {
    icon: 'insert-character',
    tooltip: 'Special character',
    onAction,
    onSetup: onSetupEditable(editor)
  });

  editor.ui.registry.addMenuItem('charmap', {
    icon: 'insert-character',
    text: 'Special character...',
    onAction,
    onSetup: onSetupEditable(editor)
  });
};

export {
  register
};
