import Editor from 'tinymce/core/api/Editor';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';

import { isMediaElement } from '../core/Selection';

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
  const onAction = () => editor.execCommand('mceMedia');

  editor.ui.registry.addToggleButton('media', {
    tooltip: 'Insert/edit media',
    icon: 'embed',
    onAction,
    onSetup: (buttonApi) => {
      const selection = editor.selection;
      buttonApi.setActive(isMediaElement(selection.getNode()));
      const unbindSelectorChanged = selection.selectorChangedWithUnbind('img[data-mce-object],span[data-mce-object],div[data-ephox-embed-iri]', buttonApi.setActive).unbind;
      const unbindEditable = onSetupEditable(editor)(buttonApi);
      return () => {
        unbindSelectorChanged();
        unbindEditable();
      };
    }
  });

  editor.ui.registry.addMenuItem('media', {
    icon: 'embed',
    text: 'Media...',
    onAction,
    onSetup: onSetupEditable(editor)
  });
};

export {
  register
};
