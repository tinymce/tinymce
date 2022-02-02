/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import * as Actions from './Actions';

const setup = (editor: Editor, imageUploadTimerState: Cell<number>, lastSelectedImageState: Cell<HTMLImageElement | null>): void => {
  editor.on('NodeChange', (e) => {
    const lastSelectedImage = lastSelectedImageState.get();
    const selectedImage = Actions.getEditableImage(editor, e.element);

    // If the last node we selected was an image
    // And had a source that doesn't match the current blob url
    // We need to attempt to upload it
    if (lastSelectedImage && !selectedImage.exists((img) => lastSelectedImage.src === img.src)) {
      Actions.cancelTimedUpload(imageUploadTimerState);
      editor.editorUpload.uploadImagesAuto();
      lastSelectedImageState.set(null);
    }

    // Set up the lastSelectedImage
    selectedImage.each(lastSelectedImageState.set);
  });
};

export {
  setup
};
