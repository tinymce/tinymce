/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Actions from '../core/Actions';
import Editor from 'tinymce/core/api/Editor';

const register = function (editor: Editor) {
  const cmd = (command: string) => () => editor.execCommand(command);

  editor.ui.registry.addButton('rotateleft', {
    tooltip: 'Rotate counterclockwise',
    icon: 'rotate-left',
    onAction: cmd('mceImageRotateLeft')
  });

  editor.ui.registry.addButton('rotateright', {
    tooltip: 'Rotate clockwise',
    icon: 'rotate-right',
    onAction: cmd('mceImageRotateRight')
  });

  editor.ui.registry.addButton('flipv', {
    tooltip: 'Flip vertically',
    icon: 'flip-vertically',
    onAction: cmd('mceImageFlipVertical')
  });

  editor.ui.registry.addButton('fliph', {
    tooltip: 'Flip horizontally',
    icon: 'flip-horizontally',
    onAction: cmd('mceImageFlipHorizontal')
  });

  editor.ui.registry.addButton('editimage', {
    tooltip: 'Edit image',
    icon: 'edit-image',
    onAction: cmd('mceEditImage'),
    onSetup: (buttonApi) => {
      const setDisabled = () => {
        const elementOpt = Actions.getSelectedImage(editor);
        elementOpt.each((element) => {
          const disabled = Actions.getEditableImage(editor, element.dom()).isNone();
          buttonApi.setDisabled(disabled);
        });
      };

      editor.on('NodeChange', setDisabled);

      return () => {
        editor.off('NodeChange', setDisabled);
      };
    }
  });

  editor.ui.registry.addButton('imageoptions', {
    tooltip: 'Image options',
    icon: 'image-options',
    onAction: cmd('mceImage')
  });

  editor.ui.registry.addContextMenu('imagetools', {
    update: (element) => {
      // since there's no menu item available, this has to be it's own thing
      return Actions.getEditableImage(editor, element).fold(() => [], (_) => {
        return [{
          text: 'Edit image',
          icon: 'edit-image',
          onAction: cmd('mceEditImage')
        }];
      });
    }
  });
};

export default {
  register
};