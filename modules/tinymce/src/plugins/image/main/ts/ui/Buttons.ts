/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Type } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import { isFigure, isImage } from '../core/ImageData';
import * as ImageSelection from '../core/ImageSelection';
import * as Utils from '../core/Utils';
import { Dialog } from './Dialog';

const register = (editor: Editor): void => {
  editor.ui.registry.addToggleButton('image', {
    icon: 'image',
    tooltip: 'Insert/edit image',
    onAction: Dialog(editor).open,
    onSetup: (buttonApi) => {
      // Set the initial state and then bind to selection changes to update the state when the selection changes
      buttonApi.setActive(Type.isNonNullable(ImageSelection.getSelectedImage(editor)));
      return editor.selection.selectorChangedWithUnbind('img:not([data-mce-object],[data-mce-placeholder]),figure.image', buttonApi.setActive).unbind;
    }
  });

  editor.ui.registry.addMenuItem('image', {
    icon: 'image',
    text: 'Image...',
    onAction: Dialog(editor).open
  });

  editor.ui.registry.addContextMenu('image', {
    update: (element): string[] => isFigure(element) || (isImage(element) && !Utils.isPlaceholderImage(element)) ? [ 'image' ] : []
  });

};

export {
  register
};
