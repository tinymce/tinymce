/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Toolbar } from 'tinymce/core/api/ui/Ui';

import * as Actions from '../core/Actions';

const register = (editor: Editor): void => {
  let changeHandlers: Array<(isEditableImage: boolean) => void> = [];

  const cmd = (command: string) => () => editor.execCommand(command);

  const isEditableImage = () => Actions.getSelectedImage(editor).exists((element) => {
    return Actions.getEditableImage(editor, element.dom).isSome();
  });

  const onSetup = (api: Toolbar.ToolbarButtonInstanceApi) => {
    const handler = (isEditableImage: boolean) => api.setDisabled(!isEditableImage);
    // Execute the handler to set the initial state
    handler(isEditableImage());
    // Register the handler so we can update the state when the selected node changes
    changeHandlers = changeHandlers.concat([ handler ]);
    return () => {
      changeHandlers = Arr.filter(changeHandlers, (h) => h !== handler);
    };
  };

  // Listen to NodeChange events and update button states
  editor.on('NodeChange', () => {
    const isEditable = isEditableImage();
    Arr.each(changeHandlers, (handler) => handler(isEditable));
  });

  editor.ui.registry.addButton('rotateleft', {
    tooltip: 'Rotate counterclockwise',
    icon: 'rotate-left',
    onAction: cmd('mceImageRotateLeft'),
    onSetup
  });

  editor.ui.registry.addButton('rotateright', {
    tooltip: 'Rotate clockwise',
    icon: 'rotate-right',
    onAction: cmd('mceImageRotateRight'),
    onSetup
  });

  editor.ui.registry.addButton('flipv', {
    tooltip: 'Flip vertically',
    icon: 'flip-vertically',
    onAction: cmd('mceImageFlipVertical'),
    onSetup
  });

  editor.ui.registry.addButton('fliph', {
    tooltip: 'Flip horizontally',
    icon: 'flip-horizontally',
    onAction: cmd('mceImageFlipHorizontal'),
    onSetup
  });

  editor.ui.registry.addButton('editimage', {
    tooltip: 'Edit image',
    icon: 'edit-image',
    onAction: cmd('mceEditImage'),
    onSetup
  });

  editor.ui.registry.addButton('imageoptions', {
    tooltip: 'Image options',
    icon: 'image',
    onAction: cmd('mceImage')
  });

  editor.ui.registry.addContextMenu('imagetools', {
    update: (element) =>
      // since there's no menu item available, this has to be it's own thing
      Actions.getEditableImage(editor, element).map((_) => ({
        text: 'Edit image',
        icon: 'edit-image',
        onAction: cmd('mceEditImage')
      })).toArray()
  });
};

export {
  register
};
