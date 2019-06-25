/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from './Dialog';
import { isFigure, isImage } from '../core/ImageData';
import Utils from '../core/Utils';

const register = (editor: Editor) => {
  editor.ui.registry.addToggleButton('image', {
    icon: 'image',
    tooltip: 'Insert/edit image',
    onAction: Dialog(editor).open,
    onSetup: (buttonApi) => editor.selection.selectorChangedWithUnbind('img:not([data-mce-object],[data-mce-placeholder]),figure.image', buttonApi.setActive).unbind
  });

  editor.ui.registry.addMenuItem('image', {
    icon: 'image',
    text: 'Image...',
    onAction: Dialog(editor).open
  });

  editor.ui.registry.addContextMenu('image', {
    update: (element): string[] => {
      return isFigure(element) || (isImage(element) && !Utils.isPlaceholderImage(element)) ? ['image'] : [];
    }
  });

};

export default {
  register
};
