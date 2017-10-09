/**
 * Uploader.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

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
define(
  'tinymce.core.file.Uploader',
  [
    'ephox.sand.api.XMLHttpRequest',
    'global!window',
    'tinymce.core.util.Fun',
    'tinymce.core.util.Promise',
    'tinymce.core.util.Tools'
  ],
  function (XMLHttpRequest, window, Fun, Promise, Tools) {
    return function (uploadStatus, settings) {
      var pendingPromises = {};

      var pathJoin = function (path1, path2) {
        if (path1) {
          return path1.replace(/\/$/, '') + '/' + path2.replace(/^\//, '');
        }

        return path2;
      };

      var defaultHandler = function (blobInfo, success, failure, progress) {
        var xhr, formData;

        xhr = new XMLHttpRequest();
        xhr.open('POST', settings.url);
        xhr.withCredentials = settings.credentials;

        xhr.upload.onprogress = function (e) {
          progress(e.loaded / e.total * 100);
        };

        xhr.onerror = function () {
          failure("Image upload failed due to a XHR Transport error. Code: " + xhr.status);
        };

        xhr.onload = function () {
          var json;

          if (xhr.status < 200 || xhr.status >= 300) {
            failure("HTTP Error: " + xhr.status);
            return;
          }

          json = JSON.parse(xhr.responseText);

          if (!json || typeof json.location != "string") {
            failure("Invalid JSON: " + xhr.responseText);
            return;
          }

          success(pathJoin(settings.basePath, json.location));
        };

        formData = new window.FormData(); // TODO: Stick this in sand
        formData.append('file', blobInfo.blob(), blobInfo.filename());

        xhr.send(formData);
      };

      var noUpload = function () {
        return new Promise(function (resolve) {
          resolve([]);
        });
      };

      var handlerSuccess = function (blobInfo, url) {
        return {
          url: url,
          blobInfo: blobInfo,
          status: true
        };
      };

      var handlerFailure = function (blobInfo, error) {
        return {
          url: '',
          blobInfo: blobInfo,
          status: false,
          error: error
        };
      };

      var resolvePending = function (blobUri, result) {
        Tools.each(pendingPromises[blobUri], function (resolve) {
          resolve(result);
        });

        delete pendingPromises[blobUri];
      };

      var uploadBlobInfo = function (blobInfo, handler, openNotification) {
        uploadStatus.markPending(blobInfo.blobUri());

        return new Promise(function (resolve) {
          var notification, progress;

          var noop = function () {
          };

          try {
            var closeNotification = function () {
              if (notification) {
                notification.close();
                progress = noop; // Once it's closed it's closed
              }
            };

            var success = function (url) {
              closeNotification();
              uploadStatus.markUploaded(blobInfo.blobUri(), url);
              resolvePending(blobInfo.blobUri(), handlerSuccess(blobInfo, url));
              resolve(handlerSuccess(blobInfo, url));
            };

            var failure = function (error) {
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

      var isDefaultHandler = function (handler) {
        return handler === defaultHandler;
      };

      var pendingUploadBlobInfo = function (blobInfo) {
        var blobUri = blobInfo.blobUri();

        return new Promise(function (resolve) {
          pendingPromises[blobUri] = pendingPromises[blobUri] || [];
          pendingPromises[blobUri].push(resolve);
        });
      };

      var uploadBlobs = function (blobInfos, openNotification) {
        blobInfos = Tools.grep(blobInfos, function (blobInfo) {
          return !uploadStatus.isUploaded(blobInfo.blobUri());
        });

        return Promise.all(Tools.map(blobInfos, function (blobInfo) {
          return uploadStatus.isPending(blobInfo.blobUri()) ?
            pendingUploadBlobInfo(blobInfo) : uploadBlobInfo(blobInfo, settings.handler, openNotification);
        }));
      };

      var upload = function (blobInfos, openNotification) {
        return (!settings.url && isDefaultHandler(settings.handler)) ? noUpload() : uploadBlobs(blobInfos, openNotification);
      };

      settings = Tools.extend({
        credentials: false,
        // We are adding a notify argument to this (at the moment, until it doesn't work)
        handler: defaultHandler
      }, settings);

      return {
        upload: upload
      };
    };
  }
);