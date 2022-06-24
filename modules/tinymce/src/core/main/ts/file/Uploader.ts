import { Fun, Optional, Type } from '@ephox/katamari';

import { BlobInfo } from '../api/file/BlobCache';
import { NotificationApi } from '../api/NotificationManager';
import Tools from '../api/util/Tools';
import { UploadStatus } from './UploadStatus';

/**
 * Upload blobs or blob infos to the specified URL or handler.
 *
 * @private
 * @class tinymce.file.Uploader
 * @example
 * const uploader = new Uploader({
 *   url: '/upload.php',
 *   basePath: '/base/path',
 *   credentials: true,
 *   handler: (data, success, failure) => {
 *     ...
 *   }
 * });
 *
 * uploader.upload(blobInfos).then((result) => {
 *   ...
 * });
 */

export interface UploadFailure {
  message: string;
  remove?: boolean;
}

type ProgressFn = (percent: number) => void;
export type UploadHandler = (blobInfo: BlobInfo, progress: ProgressFn) => Promise<string>;

type ResolveFn<T> = (result: T | Promise<T>) => void;

export interface UploadResult {
  url: string;
  blobInfo: BlobInfo;
  status: boolean;
  error?: UploadFailure;
}

export interface UploaderSettings {
  url: string;
  basePath: string;
  credentials: boolean;
  handler?: UploadHandler;
}

export interface Uploader {
  upload (blobInfos: BlobInfo[], openNotification?: () => NotificationApi): Promise<UploadResult[]>;
}

export const Uploader = (uploadStatus: UploadStatus, settings: UploaderSettings): Uploader => {
  const pendingPromises: Record<string, ResolveFn<UploadResult>[]> = {};

  const pathJoin = (path1: string | undefined, path2: string) => {
    if (path1) {
      return path1.replace(/\/$/, '') + '/' + path2.replace(/^\//, '');
    }

    return path2;
  };

  const defaultHandler: UploadHandler = (blobInfo, progress) =>
    new Promise((success, failure) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', settings.url);
      xhr.withCredentials = settings.credentials;

      xhr.upload.onprogress = (e) => {
        progress(e.loaded / e.total * 100);
      };

      xhr.onerror = () => {
        failure('Image upload failed due to a XHR Transport error. Code: ' + xhr.status);
      };

      xhr.onload = () => {
        if (xhr.status < 200 || xhr.status >= 300) {
          failure('HTTP Error: ' + xhr.status);
          return;
        }

        const json = JSON.parse(xhr.responseText);

        if (!json || !Type.isString(json.location)) {
          failure('Invalid JSON: ' + xhr.responseText);
          return;
        }

        success(pathJoin(settings.basePath, json.location));
      };

      const formData = new FormData();
      formData.append('file', blobInfo.blob(), blobInfo.filename());

      xhr.send(formData);
    });

  const uploadHandler = Type.isFunction(settings.handler) ? settings.handler : defaultHandler;

  const noUpload = (): Promise<UploadResult[]> =>
    new Promise((resolve) => {
      resolve([]);
    });

  const handlerSuccess = (blobInfo: BlobInfo, url: string): UploadResult => ({
    url,
    blobInfo,
    status: true
  });

  const handlerFailure = (blobInfo: BlobInfo, error: UploadFailure): UploadResult => ({
    url: '',
    blobInfo,
    status: false,
    error
  });

  const resolvePending = (blobUri: string, result: UploadResult) => {
    Tools.each(pendingPromises[blobUri], (resolve) => {
      resolve(result);
    });

    delete pendingPromises[blobUri];
  };

  const uploadBlobInfo = (blobInfo: BlobInfo, handler: UploadHandler, openNotification?: () => NotificationApi): Promise<UploadResult> => {
    uploadStatus.markPending(blobInfo.blobUri());

    return new Promise((resolve) => {
      let notification: NotificationApi;
      let progress: ProgressFn;

      try {
        const closeNotification = () => {
          if (notification) {
            notification.close();
            progress = Fun.noop; // Once it's closed it's closed
          }
        };

        const success = (url: string) => {
          closeNotification();
          uploadStatus.markUploaded(blobInfo.blobUri(), url);
          resolvePending(blobInfo.blobUri(), handlerSuccess(blobInfo, url));
          resolve(handlerSuccess(blobInfo, url));
        };

        const failure = (error: UploadFailure): void => {
          closeNotification();
          uploadStatus.removeFailed(blobInfo.blobUri());
          resolvePending(blobInfo.blobUri(), handlerFailure(blobInfo, error));
          resolve(handlerFailure(blobInfo, error));
        };

        progress = (percent: number) => {
          if (percent < 0 || percent > 100) {
            return;
          }

          Optional.from(notification)
            .orThunk(() => Optional.from(openNotification).map(Fun.apply))
            .each((n) => {
              notification = n;
              n.progressBar.value(percent);
            });
        };

        handler(blobInfo, progress).then(success, (err) => {
          failure(Type.isString(err) ? { message: err } : err);
        });
      } catch (ex) {
        resolve(handlerFailure(blobInfo, ex as Error));
      }
    });
  };

  const isDefaultHandler = (handler: UploadHandler) =>
    handler === defaultHandler;

  const pendingUploadBlobInfo = (blobInfo: BlobInfo): Promise<UploadResult> => {
    const blobUri = blobInfo.blobUri();

    return new Promise((resolve) => {
      pendingPromises[blobUri] = pendingPromises[blobUri] || [];
      pendingPromises[blobUri].push(resolve);
    });
  };

  const uploadBlobs = (blobInfos: BlobInfo[], openNotification?: () => NotificationApi): Promise<UploadResult[]> => {
    blobInfos = Tools.grep(blobInfos, (blobInfo) =>
      !uploadStatus.isUploaded(blobInfo.blobUri())
    );

    return Promise.all(Tools.map(blobInfos, (blobInfo: BlobInfo) =>
      uploadStatus.isPending(blobInfo.blobUri()) ?
        pendingUploadBlobInfo(blobInfo) : uploadBlobInfo(blobInfo, uploadHandler, openNotification)
    ));
  };

  const upload = (blobInfos: BlobInfo[], openNotification?: () => NotificationApi) =>
    (!settings.url && isDefaultHandler(uploadHandler)) ? noUpload() : uploadBlobs(blobInfos, openNotification);

  return {
    upload
  };
};
