/**
 * Uploader.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { XMLHttpRequest } from '@ephox/sand';
import Promise from '../api/util/Promise';
import Tools from '../api/util/Tools';

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

export default function (uploadStatus, settings) {
  const pendingPromises = {};

  const pathJoin = function (path1, path2) {
    if (path1) {
      return path1.replace(/\/$/, '') + '/' + path2.replace(/^\//, '');
    }

    return path2;
  };

  const defaultHandler = function (blobInfo, success, failure, progress) {
    let xhr, formData;

    xhr = new XMLHttpRequest();
    xhr.open('POST', settings.url);
    xhr.withCredentials = settings.credentials;

    xhr.upload.onprogress = function (e) {
      progress(e.loaded / e.total * 100);
    };

    xhr.onerror = function () {
      failure('Image upload failed due to a XHR Transport error. Code: ' + xhr.status);
    };

    xhr.onload = function () {
      let json;

      if (xhr.status < 200 || xhr.status >= 300) {
        failure('HTTP Error: ' + xhr.status);
        return;
      }

      json = JSON.parse(xhr.responseText);

      if (!json || typeof json.location !== 'string') {
        failure('Invalid JSON: ' + xhr.responseText);
        return;
      }

      success(pathJoin(settings.basePath, json.location));
    };

    formData = new FormData(); // TODO: Stick this in sand
    formData.append('file', blobInfo.blob(), blobInfo.filename());

    xhr.send(formData);
  };

  const noUpload = function () {
    return new Promise(function (resolve) {
      resolve([]);
    });
  };

  const handlerSuccess = function (blobInfo, url) {
    return {
      url,
      blobInfo,
      status: true
    };
  };

  const handlerFailure = function (blobInfo, error) {
    return {
      url: '',
      blobInfo,
      status: false,
      error
    };
  };

  const resolvePending = function (blobUri, result) {
    Tools.each(pendingPromises[blobUri], function (resolve) {
      resolve(result);
    });

    delete pendingPromises[blobUri];
  };

  const uploadBlobInfo = function (blobInfo, handler, openNotification) {
    uploadStatus.markPending(blobInfo.blobUri());

    return new Promise(function (resolve) {
      let notification, progress;

      const noop = function () {
      };

      try {
        const closeNotification = function () {
          if (notification) {
            notification.close();
            progress = noop; // Once it's closed it's closed
          }
        };

        const success = function (url) {
          closeNotification();
          uploadStatus.markUploaded(blobInfo.blobUri(), url);
          resolvePending(blobInfo.blobUri(), handlerSuccess(blobInfo, url));
          resolve(handlerSuccess(blobInfo, url));
        };

        const failure = function (error) {
          closeNotification();
          uploadStatus.removeFailed(blobInfo.blobUri());
          resolvePending(blobInfo.blobUri(), handlerFailure(blobInfo, error));
          resolve(handlerFailure(blobInfo, error));
        };

        progress = function (percent) {
          if (percent < 0 || percent > 100) {
            return;
          }

          if (!notification) {
            notification = openNotification();
          }

          notification.progressBar.value(percent);
        };

        handler(blobInfo, success, failure, progress);
      } catch (ex) {
        resolve(handlerFailure(blobInfo, ex.message));
      }
    });
  };

  const isDefaultHandler = function (handler) {
    return handler === defaultHandler;
  };

  const pendingUploadBlobInfo = function (blobInfo) {
    const blobUri = blobInfo.blobUri();

    return new Promise(function (resolve) {
      pendingPromises[blobUri] = pendingPromises[blobUri] || [];
      pendingPromises[blobUri].push(resolve);
    });
  };

  const uploadBlobs = function (blobInfos, openNotification) {
    blobInfos = Tools.grep(blobInfos, function (blobInfo) {
      return !uploadStatus.isUploaded(blobInfo.blobUri());
    });

    return Promise.all(Tools.map(blobInfos, function (blobInfo) {
      return uploadStatus.isPending(blobInfo.blobUri()) ?
        pendingUploadBlobInfo(blobInfo) : uploadBlobInfo(blobInfo, settings.handler, openNotification);
    }));
  };

  const upload = function (blobInfos, openNotification) {
    return (!settings.url && isDefaultHandler(settings.handler)) ? noUpload() : uploadBlobs(blobInfos, openNotification);
  };

  settings = Tools.extend({
    credentials: false,
    // We are adding a notify argument to this (at the moment, until it doesn't work)
    handler: defaultHandler
  }, settings);

  return {
    upload
  };
}