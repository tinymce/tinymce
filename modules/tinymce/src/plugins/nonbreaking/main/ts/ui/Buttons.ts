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
  const onAction = () => editor.execCommand('mceNonBreaking');

  editor.ui.registry.addButton('nonbreaking', {
    icon: 'non-breaking',
    tooltip: 'Nonbreaking space',
    onAction,
    onSetup: onSetupEditable(editor)
  });

  editor.ui.registry.addMenuItem('nonbreaking', {
    icon: 'non-breaking',
    text: 'Nonbreaking space',
    onAction,
    onSetup: onSetupEditable(editor)
  });
};

export {
  register
};
