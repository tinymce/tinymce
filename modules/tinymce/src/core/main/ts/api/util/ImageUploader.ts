import * as Uploader from '../../file/Uploader';
import { UploadStatus } from '../../file/UploadStatus';
import Editor from '../Editor';
import { BlobInfo } from '../file/BlobCache';
import { NotificationApi } from '../NotificationManager';
import * as Options from '../Options';

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

export const createUploader = (editor: Editor, uploadStatus: UploadStatus): Uploader.Uploader =>
  Uploader.Uploader(uploadStatus, {
    url: Options.getImageUploadUrl(editor),
    basePath: Options.getImageUploadBasePath(editor),
    credentials: Options.getImagesUploadCredentials(editor),
    handler: Options.getImagesUploadHandler(editor)
  });

/**
 * This class handles uploading images to a back-end server.
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
     * @param {Boolean} showNotification (Optional) When set to true, a notification with a progress bar will be shown during image uploads.
     */
    upload: (blobInfos: BlobInfo[], showNotification: boolean = true) =>
      uploader.upload(blobInfos, showNotification ? openNotification(editor) : undefined)
  };
};

export default ImageUploader;
