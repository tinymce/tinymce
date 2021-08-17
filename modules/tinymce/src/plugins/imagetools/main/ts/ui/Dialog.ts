/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell, Fun } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import * as Actions from '../core/Actions';
import * as ImageSize from '../core/ImageSize';
import * as ImageToolsEvents from './ImageToolsEvents';

interface ImageToolsState {
  readonly blob: Blob;
  readonly url: string;
}

const createState = (blob: Blob): ImageToolsState => ({
  blob,
  url: URL.createObjectURL(blob)
});

const makeOpen = (editor: Editor, imageUploadTimerState: Cell<number>) => (): void => {
  const getLoadedSpec = (currentState: ImageToolsState): Dialog.DialogSpec<{ imagetools: ImageToolsState }> => ({
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
          Actions.handleDialogBlob(editor, imageUploadTimerState, originalImg.dom, originalSize, blob);
        });
      });
      api.close();
    },
    onCancel: Fun.noop, // TODO: reimplement me
    onAction: (api, details) => {
      switch (details.name) {
        case ImageToolsEvents.saveState:
          if (details.value) {
            api.enable('save');
          } else {
            api.disable('save');
          }
          break;
        case ImageToolsEvents.disable:
          api.disable('save');
          api.disable('cancel');
          break;
        case ImageToolsEvents.enable:
          api.enable('cancel');
          break;
      }
    }
  });

  const originalImgOpt = Actions.getSelectedImage(editor);
  const originalSizeOpt = originalImgOpt.map((origImg) => ImageSize.getNaturalImageSize(origImg.dom));

  originalImgOpt.each((img) => {
    Actions.getEditableImage(editor, img.dom).each((_) => {
      Actions.findBlob(editor, img.dom).then((blob) => {
        const state = createState(blob);
        editor.windowManager.open(getLoadedSpec(state));
      });
    });
  });
};

export {
  makeOpen
};
