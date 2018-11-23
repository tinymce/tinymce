/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { URL } from '@ephox/sand';

import Actions from '../core/Actions';
import ImageSize from '../core/ImageSize';
import * as ImageToolsEvents from './ImageToolsEvents';
import { Editor } from 'tinymce/core/api/Editor';

const createState = (blob) => {
  return {
    blob,
    url: URL.createObjectURL(blob)
  };
};

const makeOpen = (editor: Editor, imageUploadTimerState) => () => {
  const getLoadedSpec = (currentState) => {
    return {
      title: 'Edit Image',
      size: 'large',
      body: {
        type: 'panel',
        items: [
          {
            type: 'imagetools',
            name: 'imagetools',
            label: 'Edit Image',
            currentState
          }
        ]
      },
      buttons: [
        {
          type: 'cancel',
          name: 'cancel',
          text: 'Cancel'
        },
        {
          type: 'submit',
          name: 'save',
          text: 'Save',
          primary: true,
          disabled: true
        }
      ],
      onSubmit: (api, _details) => {
        const blob = api.getData().imagetools.blob;
        Actions.handleDialogBlob(editor, imageUploadTimerState, originalImg, originalSize, blob);
        api.close();
      },
      onCancel: () => {}, // TODO: reimplement me
      onAction: (api, details) => {
        switch (details.name) {
          case ImageToolsEvents.saveState():
            if (details.value) {
              api.enable('save');
            } else {
              api.disable('save');
            }
            break;
          case ImageToolsEvents.disable():
            win.block('Updating image');
            api.disable('save');
            api.disable('cancel');
            break;
          case ImageToolsEvents.enable():
            win.unblock();
            api.enable('cancel');
            break;
        }
      }
    };
  };

  const originalImg = Actions.getSelectedImage(editor);
  const originalSize = ImageSize.getNaturalImageSize(originalImg);

  let win;

  const img = Actions.getSelectedImage(editor);
  if (Actions.isEditableImage(editor, img)) {
    Actions.findSelectedBlob(editor).then((blob) => {
      const state = createState(blob);
      win = editor.windowManager.open(getLoadedSpec(state));
    });
  }
};

export default {
  makeOpen
};