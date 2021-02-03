import { Waiter } from '@ephox/agar';
import { Cell } from '@ephox/katamari';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { UploadResult } from 'tinymce/core/api/EditorUpload';
import { BlobInfo } from 'tinymce/core/api/file/BlobCache';
import PromisePolyfill from 'tinymce/core/api/util/Promise';
import { UploadHandler } from 'tinymce/core/file/Uploader';

export interface StateContainer {
  readonly get: () => null | { blobInfo: BlobInfo };
  readonly handler: (url: string) => UploadHandler;
  readonly resetState: () => void;
  readonly pWaitForState: () => Promise<void>;
}

const pLoadImage = (editor: Editor, url: string, size?: { width: number; height: number }): Promise<void> =>
  new PromisePolyfill((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      editor.setContent(`<p><img src="${url}" ${size ? `width="${size.width}" height="${size.height}"` : ''} /></p>`);
      editor.focus();
      resolve();
    };

    img.onerror = (e) => reject(e);

    img.src = url;
  });

const pUploadImages = (editor: Editor): Promise<UploadResult[]> => editor.uploadImages();

const pWaitForBlobImage = (editor: Editor) =>
  Waiter.pTryUntil('Did not find a blobimage', () => {
    assert.lengthOf(editor.dom.select('img[src^=blob]'), 1, 'Should be one blob image');
  });

const createStateContainer = (): StateContainer => {
  const state = Cell(null);

  const handler = (url: string) => {
    return (blobInfo, success) => {
      state.set({
        blobInfo
      });

      success(url);
    };
  };

  const resetState = () => state.set(null);

  const pWaitForState = () => Waiter.pTryUntil('Did not get a state change', () => {
    assert.isNotNull(state.get(), 'Should have the state');
  });

  return {
    get: state.get,
    handler,
    resetState,
    pWaitForState
  };
};

export {
  pLoadImage,
  pUploadImages,
  pWaitForBlobImage,
  createStateContainer
};
