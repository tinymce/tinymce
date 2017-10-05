/**
 * EditorUpload.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Handles image uploads, updates undo stack and patches over various internal functions.
 *
 * @private
 * @class tinymce.EditorUpload
 */
define(
  'tinymce.core.EditorUpload',
  [
    "tinymce.core.util.Arr",
    "tinymce.core.file.Uploader",
    "tinymce.core.file.ImageScanner",
    "tinymce.core.file.BlobCache",
    "tinymce.core.file.UploadStatus",
    "tinymce.core.ErrorReporter"
  ],
  function (Arr, Uploader, ImageScanner, BlobCache, UploadStatus, ErrorReporter) {
    return function (editor) {
      var blobCache = new BlobCache(), uploader, imageScanner, settings = editor.settings;
      var uploadStatus = new UploadStatus();

      var aliveGuard = function (callback) {
        return function (result) {
          if (editor.selection) {
            return callback(result);
          }

          return [];
        };
      };

      var cacheInvalidator = function () {
        return '?' + (new Date()).getTime();
      };

      // Replaces strings without regexps to avoid FF regexp to big issue
      var replaceString = function (content, search, replace) {
        var index = 0;

        do {
          index = content.indexOf(search, index);

          if (index !== -1) {
            content = content.substring(0, index) + replace + content.substr(index + search.length);
            index += replace.length - search.length + 1;
          }
        } while (index !== -1);

        return content;
      };

      var replaceImageUrl = function (content, targetUrl, replacementUrl) {
        content = replaceString(content, 'src="' + targetUrl + '"', 'src="' + replacementUrl + '"');
        content = replaceString(content, 'data-mce-src="' + targetUrl + '"', 'data-mce-src="' + replacementUrl + '"');

        return content;
      };

      var replaceUrlInUndoStack = function (targetUrl, replacementUrl) {
        Arr.each(editor.undoManager.data, function (level) {
          if (level.type === 'fragmented') {
            level.fragments = Arr.map(level.fragments, function (fragment) {
              return replaceImageUrl(fragment, targetUrl, replacementUrl);
            });
          } else {
            level.content = replaceImageUrl(level.content, targetUrl, replacementUrl);
          }
        });
      };

      var openNotification = function () {
        return editor.notificationManager.open({
          text: editor.translate('Image uploading...'),
          type: 'info',
          timeout: -1,
          progressBar: true
        });
      };

      var replaceImageUri = function (image, resultUri) {
        blobCache.removeByUri(image.src);
        replaceUrlInUndoStack(image.src, resultUri);

        editor.$(image).attr({
          src: settings.images_reuse_filename ? resultUri + cacheInvalidator() : resultUri,
          'data-mce-src': editor.convertURL(resultUri, 'src')
        });
      };

      var uploadImages = function (callback) {
        if (!uploader) {
          uploader = new Uploader(uploadStatus, {
            url: settings.images_upload_url,
            basePath: settings.images_upload_base_path,
            credentials: settings.images_upload_credentials,
            handler: settings.images_upload_handler
          });
        }

        return scanForImages().then(aliveGuard(function (imageInfos) {
          var blobInfos;

          blobInfos = Arr.map(imageInfos, function (imageInfo) {
            return imageInfo.blobInfo;
          });

          return uploader.upload(blobInfos, openNotification).then(aliveGuard(function (result) {
            var filteredResult = Arr.map(result, function (uploadInfo, index) {
              var image = imageInfos[index].image;

              if (uploadInfo.status && editor.settings.images_replace_blob_uris !== false) {
                replaceImageUri(image, uploadInfo.url);
              } else if (uploadInfo.error) {
                ErrorReporter.uploadError(editor, uploadInfo.error);
              }

              return {
                element: image,
                status: uploadInfo.status
              };
            });

            if (callback) {
              callback(filteredResult);
            }

            return filteredResult;
          }));
        }));
      };

      var uploadImagesAuto = function (callback) {
        if (settings.automatic_uploads !== false) {
          return uploadImages(callback);
        }
      };

      var isValidDataUriImage = function (imgElm) {
        return settings.images_dataimg_filter ? settings.images_dataimg_filter(imgElm) : true;
      };

      var scanForImages = function () {
        if (!imageScanner) {
          imageScanner = new ImageScanner(uploadStatus, blobCache);
        }

        return imageScanner.findAll(editor.getBody(), isValidDataUriImage).then(aliveGuard(function (result) {
          result = Arr.filter(result, function (resultItem) {
            // ImageScanner internally converts images that it finds, but it may fail to do so if image source is inaccessible.
            // In such case resultItem will contain appropriate text error message, instead of image data.
            if (typeof resultItem === 'string') {
              ErrorReporter.displayError(editor, resultItem);
              return false;
            }
            return true;
          });

          Arr.each(result, function (resultItem) {
            replaceUrlInUndoStack(resultItem.image.src, resultItem.blobInfo.blobUri());
            resultItem.image.src = resultItem.blobInfo.blobUri();
            resultItem.image.removeAttribute('data-mce-src');
          });

          return result;
        }));
      };

      var destroy = function () {
        blobCache.destroy();
        uploadStatus.destroy();
        imageScanner = uploader = null;
      };

      var replaceBlobUris = function (content) {
        return content.replace(/src="(blob:[^"]+)"/g, function (match, blobUri) {
          var resultUri = uploadStatus.getResultUri(blobUri);

          if (resultUri) {
            return 'src="' + resultUri + '"';
          }

          var blobInfo = blobCache.getByUri(blobUri);

          if (!blobInfo) {
            blobInfo = Arr.reduce(editor.editorManager.get(), function (result, editor) {
              return result || editor.editorUpload && editor.editorUpload.blobCache.getByUri(blobUri);
            }, null);
          }

          if (blobInfo) {
            return 'src="data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64() + '"';
          }

          return match;
        });
      };

      editor.on('setContent', function () {
        if (editor.settings.automatic_uploads !== false) {
          uploadImagesAuto();
        } else {
          scanForImages();
        }
      });

      editor.on('RawSaveContent', function (e) {
        e.content = replaceBlobUris(e.content);
      });

      editor.on('getContent', function (e) {
        if (e.source_view || e.format == 'raw') {
          return;
        }

        e.content = replaceBlobUris(e.content);
      });

      editor.on('PostRender', function () {
        editor.parser.addNodeFilter('img', function (images) {
          Arr.each(images, function (img) {
            var src = img.attr('src');

            if (blobCache.getByUri(src)) {
              return;
            }

            var resultUri = uploadStatus.getResultUri(src);
            if (resultUri) {
              img.attr('src', resultUri);
            }
          });
        });
      });

      return {
        blobCache: blobCache,
        uploadImages: uploadImages,
        uploadImagesAuto: uploadImagesAuto,
        scanForImages: scanForImages,
        destroy: destroy
      };
    };
  }
);