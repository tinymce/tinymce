/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Optional, Type } from '@ephox/katamari';

import { BlobInfo } from '../api/file/BlobCache';
import { NotificationApi } from '../api/NotificationManager';
import Promise from '../api/util/Promise';
import Tools from '../api/util/Tools';
import { UploadStatus } from './UploadStatus';

/**
 * Upload blobs or blob infos to the specified URL or handler.
 *
 * @private
 * @class tinymce.file.Uploader
 * @example
 * var uploader = new Uploader({
 *     url: '/upload.php',
 *     basePath: '/base/path',
 *     credentials: true,
 *     handler: function(data, success, failure) {
 *         ...
 *     }
 * });
 *
 * uploader.upload(blobInfos).then(function(result) {
 *     ...
 * });
 */

export interface UploadFailureOptions {
  remove?: boolean;
}

export type UploadHandler = (blobInfo: BlobInfo, success: (url: string) => void, failure: (err: string, options?: UploadFailureOptions) => void, progress?: (percent: number) => void) => void;

type ResolveFn<T> = (result?: T | Promise<T>) => void;

export interface UploadResult {
  url: string;
  blobInfo: BlobInfo;
  status: boolean;
  error?: {
    options: UploadFailureOptions;
    message: string;
  };
}

export interface Uploader {
  upload (blobInfos: BlobInfo[], openNotification?: () => NotificationApi): Promise<UploadResult[]>;
}

export const Uploader = (uploadStatus: UploadStatus, settings): Uploader => {
  const pendingPromises: Record<string, ResolveFn<UploadResult>[]> = {};

  const pathJoin = (path1, path2) => {
    if (path1) {
      return path1.replace(/\/$/, '') + '/' + path2.replace(/^\//, '');
    }

    return path2;
  };

  const defaultHandler: UploadHandler = (blobInfo, success, failure, progress) => {
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

      if (!json || typeof json.location !== 'string') {
        failure('Invalid JSON: ' + xhr.responseText);
        return;
      }

      success(pathJoin(settings.basePath, json.location));
    };

    const formData = new FormData();
    formData.append('file', blobInfo.blob(), blobInfo.filename());

    xhr.send(formData);
  };

  const noUpload = (): Promise<UploadResult[]> =>
    new Promise((resolve) => {
      resolve([]);
    });

  const handlerSuccess = (blobInfo: BlobInfo, url: string): UploadResult => ({
    url,
    blobInfo,
    status: true
  });

  const handlerFailure = (blobInfo: BlobInfo, message: string, options: UploadFailureOptions): UploadResult => ({
    url: '',
    blobInfo,
    status: false,
    error: {
      message,
      options
    }
  });

  const resolvePending = (blobUri: string, result) => {
    Tools.each(pendingPromises[blobUri], (resolve) => {
      resolve(result);
    });

    delete pendingPromises[blobUri];
  };

  const uploadBlobInfo = (blobInfo: BlobInfo, handler: UploadHandler, openNotification?: () => NotificationApi): Promise<UploadResult> => {
    uploadStatus.markPending(blobInfo.blobUri());

    return new Promise((resolve) => {
      let notification, progress;

      try {
        const closeNotification = () => {
          if (notification) {
            notification.close();
            progress = Fun.noop; // Once it's closed it's closed
          }
        };

        const success = (url) => {
          closeNotification();
          uploadStatus.markUploaded(blobInfo.blobUri(), url);
          resolvePending(blobInfo.blobUri(), handlerSuccess(blobInfo, url));
          resolve(handlerSuccess(blobInfo, url));
        };

        const failure = (error: string, options?: UploadFailureOptions): void => {
          const failureOptions = options ? options : {};

          closeNotification();
          uploadStatus.removeFailed(blobInfo.blobUri());
          resolvePending(blobInfo.blobUri(), handlerFailure(blobInfo, error, failureOptions));
          resolve(handlerFailure(blobInfo, error, failureOptions));
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

        handler(blobInfo, success, failure, progress);
      } catch (ex) {
        resolve(handlerFailure(blobInfo, ex.message, {}));
      }
    });
  };

  const isDefaultHandler = (handler) =>
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
        pendingUploadBlobInfo(blobInfo) : uploadBlobInfo(blobInfo, settings.handler, openNotification)
    ));
  };

  const upload = (blobInfos: BlobInfo[], openNotification?: () => NotificationApi) =>
    (!settings.url && isDefaultHandler(settings.handler)) ? noUpload() : uploadBlobs(blobInfos, openNotification);

  if (Type.isFunction(settings.handler) === false) {
    settings.handler = defaultHandler;
  }

  return {
    upload
  };
};
