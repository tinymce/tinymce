/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Obj } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Toolbar } from 'tinymce/core/api/ui/Ui';

import * as Actions from '../core/Actions';

type ButtonApiRecord = Record<string, Toolbar.ToolbarButtonInstanceApi>;

const register = (editor: Editor) => {

  const buttonApiRecord: ButtonApiRecord = {};

  const cmd = (command: string) => () => editor.execCommand(command);

  const setDisabled = () => {
    const disabled = Actions.getSelectedImage(editor).forall((element) => {
      return Actions.getEditableImage(editor, element.dom).isNone();
    });

    Obj.each(buttonApiRecord, (api: Toolbar.ToolbarButtonInstanceApi) => {
      api.setDisabled(disabled);
    });
  };

  const addToButtonApiRecord = (key: string, api: Toolbar.ToolbarButtonInstanceApi) => {
    if (!Obj.has(buttonApiRecord, key)) {
      buttonApiRecord[key] = api;
    }
  };

  editor.on('NodeChange', setDisabled);

  editor.ui.registry.addButton('rotateleft', {
    tooltip: 'Rotate counterclockwise',
    icon: 'rotate-left',
    onAction: cmd('mceImageRotateLeft'),
    onSetup: (buttonApi: Toolbar.ToolbarButtonInstanceApi) => {
      addToButtonApiRecord('rotateleft', buttonApi);
      return Fun.noop;
    }
  });

  editor.ui.registry.addButton('rotateright', {
    tooltip: 'Rotate clockwise',
    icon: 'rotate-right',
    onAction: cmd('mceImageRotateRight'),
    onSetup: (buttonApi: Toolbar.ToolbarButtonInstanceApi) => {
      addToButtonApiRecord('rotateright', buttonApi);
      return Fun.noop;
    }
  });

  editor.ui.registry.addButton('flipv', {
    tooltip: 'Flip vertically',
    icon: 'flip-vertically',
    onAction: cmd('mceImageFlipVertical'),
    onSetup: (buttonApi: Toolbar.ToolbarButtonInstanceApi) => {
      addToButtonApiRecord('flipv', buttonApi);
      return Fun.noop;
    }
  });

  editor.ui.registry.addButton('fliph', {
    tooltip: 'Flip horizontally',
    icon: 'flip-horizontally',
    onAction: cmd('mceImageFlipHorizontal'),
    onSetup: (buttonApi: Toolbar.ToolbarButtonInstanceApi) => {
      addToButtonApiRecord('fliph', buttonApi);
      return Fun.noop;
    }
  });

  editor.ui.registry.addButton('editimage', {
    tooltip: 'Edit image',
    icon: 'edit-image',
    onAction: cmd('mceEditImage'),
    onSetup: (buttonApi: Toolbar.ToolbarButtonInstanceApi) => {
      addToButtonApiRecord('editimage', buttonApi);
      return Fun.noop;
    }
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
