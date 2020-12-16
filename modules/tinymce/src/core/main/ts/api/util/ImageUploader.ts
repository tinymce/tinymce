/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as Uploader from '../../file/Uploader';
import { UploadStatus } from '../../file/UploadStatus';
import Editor from '../Editor';
import { BlobInfo } from '../file/BlobCache';
import { NotificationApi } from '../NotificationManager';
import * as Settings from '../Settings';

export type UploadResult = Uploader.UploadResult;

interface ImageUploader {
  upload: (blobInfos: BlobInfo[], showNotification?: boolean) => Promise<UploadResult[]>;
}

export const openNotification = (editor: Editor) => (): NotificationApi => editor.notificationManager.open({
  text: editor.translate('Image uploading...'),
  type: 'info',
  timeout: -1,
  progressBar: true
});

export const createUploader = (editor: Editor, uploadStatus: UploadStatus) =>
  Uploader.Uploader(uploadStatus, {
    url: Settings.getImageUploadUrl(editor),
    basePath: Settings.getImageUploadBasePath(editor),
    credentials: Settings.getImagesUploadCredentials(editor),
    handler: Settings.getImagesUploadHandler(editor)
  });

/**
 * This class handles uploading images to a back-end server.
 *
 * @summary <strong>Added in TinyMCE 5.7.</strong>
 *
 * @class tinymce.util.ImageUploader
 */
const ImageUploader = (editor: Editor): ImageUploader => {
  const uploadStatus = UploadStatus();
  const uploader = createUploader(editor, uploadStatus);

  return {
    /**
     * Uploads images to the configured image upload URL (`images_upload_url`) or passes the images to the defined image upload handler function (`images_upload_handler`).
     *
     * @method upload
     * @param {Array} blobInfos  A BlobInfo array containing the image data to upload. A BlobInfo can be created by calling `editor.editorUpload.blobCache.create()`.
     * @param {boolean} showNotification (Optional) When set to true, a notification with a progress bar will be shown during image uploads.
     */
    upload: (blobInfos: BlobInfo[], showNotification: boolean = true) =>
      uploader.upload(blobInfos, showNotification ? openNotification(editor) : undefined)
  };
};

export default ImageUploader;
