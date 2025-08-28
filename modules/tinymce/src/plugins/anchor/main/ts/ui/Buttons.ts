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
  const onAction = () => editor.execCommand('mceAnchor');

  editor.ui.registry.addToggleButton('anchor', {
    icon: 'bookmark',
    tooltip: 'Anchor',
    onAction,
    onSetup: (buttonApi) => {
      const unbindSelectorChanged = editor.selection.selectorChangedWithUnbind('a:not([href])', buttonApi.setActive).unbind;
      const unbindEditableChanged = onSetupEditable(editor)(buttonApi);

      return () => {
        unbindSelectorChanged();
        unbindEditableChanged();
      };
    }
  });

  editor.ui.registry.addMenuItem('anchor', {
    icon: 'bookmark',
    text: 'Anchor...',
    onAction,
    onSetup: onSetupEditable(editor)
  });
};

export {
  register
};
