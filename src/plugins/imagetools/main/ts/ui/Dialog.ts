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
import Editor from 'tinymce/core/api/Editor';
import { Types } from '@ephox/bridge';
import { Blob } from '@ephox/dom-globals';

type ImageToolsState = {
  blob: Blob,
  url: string
};

const createState = (blob: Blob): ImageToolsState => {
  return {
    blob,
    url: URL.createObjectURL(blob)
  };
};

const makeOpen = (editor: Editor, imageUploadTimerState) => () => {
  const getLoadedSpec = (currentState: ImageToolsState): Types.Dialog.DialogApi<{ imagetools: ImageToolsState }> => {
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
      onSubmit: (api) => {
        const blob = api.getData().imagetools.blob;
        originalImgOpt.each((originalImg) => {
          originalSizeOpt.each((originalSize) => {
            Actions.handleDialogBlob(editor, imageUploadTimerState, originalImg.dom(), originalSize, blob);
          });
        });
        api.close();
      },
      onCancel: () => { }, // TODO: reimplement me
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
            api.disable('save');
            api.disable('cancel');
            break;
          case ImageToolsEvents.enable():
            api.enable('cancel');
            break;
        }
      }
    };
  };

  const originalImgOpt = Actions.getSelectedImage(editor);
  const originalSizeOpt = originalImgOpt.map((origImg) => {
    return ImageSize.getNaturalImageSize(origImg.dom());
  });

  const imgOpt = Actions.getSelectedImage(editor);
  imgOpt.each((img) => {
    Actions.getEditableImage(editor, img.dom()).each((_) => {
      Actions.findBlob(editor, img.dom()).then((blob) => {
        const state = createState(blob);
        editor.windowManager.open(getLoadedSpec(state));
      });
    });
  });
};

export default {
  makeOpen
};