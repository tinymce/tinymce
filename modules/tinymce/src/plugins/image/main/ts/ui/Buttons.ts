import { Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Menu, Toolbar } from 'tinymce/core/api/ui/Ui';

import { isFigure, isImage } from '../core/ImageData';
import * as ImageSelection from '../core/ImageSelection';
import * as Utils from '../core/Utils';
import { Dialog } from './Dialog';

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
  editor.ui.registry.addToggleButton('image', {
    icon: 'image',
    tooltip: 'Insert/edit image',
    onAction: Dialog(editor).open,
    onSetup: (buttonApi) => {
      // Set the initial state and then bind to selection changes to update the state when the selection changes
      buttonApi.setActive(Type.isNonNullable(ImageSelection.getSelectedImage(editor)));
      const unbindSelectorChanged = editor.selection.selectorChangedWithUnbind('img:not([data-mce-object]):not([data-mce-placeholder]),figure.image', buttonApi.setActive).unbind;
      const unbindEditable = onSetupEditable(editor)(buttonApi);
      return () => {
        unbindSelectorChanged();
        unbindEditable();
      };
    }
  });

  editor.ui.registry.addMenuItem('image', {
    icon: 'image',
    text: 'Image...',
    onAction: Dialog(editor).open,
    onSetup: onSetupEditable(editor)
  });

  editor.ui.registry.addContextMenu('image', {
    update: (element): string[] => editor.selection.isEditable() && (isFigure(element) || (isImage(element) && !Utils.isPlaceholderImage(element))) ? [ 'image' ] : []
  });

};

export {
  register
};
