/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import * as Uploader from '../../file/Uploader';
import UploadStatus from '../../file/UploadStatus';
import Editor from '../Editor';
import * as Settings from '../Settings';
import { BlobInfo } from '../file/BlobCache';

export type UploadResult = Uploader.UploadResult;

interface ImageUploader {
  upload (blobInfos: BlobInfo[], showNotification?: boolean): Promise<UploadResult[]>;
}

/**
 * This class handles uploading images to a backend server.
 *
 * @class tinymce.util.ImageUploader
 */
const ImageUploader = (editor: Editor): ImageUploader => {
  const uploadStatus = UploadStatus();
  const uploader = Uploader.Uploader(uploadStatus, {
    url: Settings.getImageUploadUrl(editor),
    basePath: Settings.getImageUploadBasePath(editor),
    credentials: Settings.getImagesUploadCredentials(editor),
    handler: Settings.getImagesUploadHandler(editor)
  });

  const openNotification = () => editor.notificationManager.open({
    text: editor.translate('Image uploading...'),
    type: 'info',
    timeout: -1,
    progressBar: true
  });

  return {
    /**
     * Uploads images to the configured image upload url or handler.
     *
     * @method upload
     * @param {Array} blobInfos The blob info containing the image data to upload.
     * @param {boolean} showNotification Optional flag for whether to show a notification during upload.
     */
    upload: (blobInfos: BlobInfo[], showNotification: boolean = true) =>
      uploader.upload(blobInfos, showNotification ? openNotification : Fun.noop)
  };
};

export default ImageUploader;
