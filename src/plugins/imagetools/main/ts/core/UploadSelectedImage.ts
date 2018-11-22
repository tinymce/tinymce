/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Actions from './Actions';

const setup = function (editor, imageUploadTimerState, lastSelectedImageState) {
  editor.on('NodeChange', function (e) {
    const lastSelectedImage = lastSelectedImageState.get();

    // If the last node we selected was an image
    // And had a source that doesn't match the current blob url
    // We need to attempt to upload it
    if (lastSelectedImage && lastSelectedImage.src !== e.element.src) {
      Actions.cancelTimedUpload(imageUploadTimerState);
      editor.editorUpload.uploadImagesAuto();
      lastSelectedImageState.set(null);
    }

    // Set up the lastSelectedImage
    if (Actions.isEditableImage(editor, e.element)) {
      lastSelectedImageState.set(e.element);
    }
  });
};

export default {
  setup
};