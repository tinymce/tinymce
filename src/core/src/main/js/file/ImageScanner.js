/**
 * ImageScanner.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Finds images with data uris or blob uris. If data uris are found it will convert them into blob uris.
 *
 * @private
 * @class tinymce.file.ImageScanner
 */
define(
  'tinymce.core.file.ImageScanner',
  [
    "tinymce.core.util.Promise",
    "tinymce.core.util.Arr",
    "tinymce.core.util.Fun",
    "tinymce.core.file.Conversions",
    "tinymce.core.Env"
  ],
  function (Promise, Arr, Fun, Conversions, Env) {
    var count = 0;

    var uniqueId = function (prefix) {
      return (prefix || 'blobid') + (count++);
    };

    var imageToBlobInfo = function (blobCache, img, resolve, reject) {
      var base64, blobInfo;

      if (img.src.indexOf('blob:') === 0) {
        blobInfo = blobCache.getByUri(img.src);

        if (blobInfo) {
          resolve({
            image: img,
            blobInfo: blobInfo
          });
        } else {
          Conversions.uriToBlob(img.src).then(function (blob) {
            Conversions.blobToDataUri(blob).then(function (dataUri) {
              base64 = Conversions.parseDataUri(dataUri).data;
              blobInfo = blobCache.create(uniqueId(), blob, base64);
              blobCache.add(blobInfo);

              resolve({
                image: img,
                blobInfo: blobInfo
              });
            });
          }, function (err) {
            reject(err);
          });
        }

        return;
      }

      base64 = Conversions.parseDataUri(img.src).data;
      blobInfo = blobCache.findFirst(function (cachedBlobInfo) {
        return cachedBlobInfo.base64() === base64;
      });

      if (blobInfo) {
        resolve({
          image: img,
          blobInfo: blobInfo
        });
      } else {
        Conversions.uriToBlob(img.src).then(function (blob) {
          blobInfo = blobCache.create(uniqueId(), blob, base64);
          blobCache.add(blobInfo);

          resolve({
            image: img,
            blobInfo: blobInfo
          });
        }, function (err) {
          reject(err);
        });
      }
    };

    var getAllImages = function (elm) {
      return elm ? elm.getElementsByTagName('img') : [];
    };

    return function (uploadStatus, blobCache) {
      var cachedPromises = {};

      var findAll = function (elm, predicate) {
        var images, promises;

        if (!predicate) {
          predicate = Fun.constant(true);
        }

        images = Arr.filter(getAllImages(elm), function (img) {
          var src = img.src;

          if (!Env.fileApi) {
            return false;
          }

          if (img.hasAttribute('data-mce-bogus')) {
            return false;
          }

          if (img.hasAttribute('data-mce-placeholder')) {
            return false;
          }

          if (!src || src == Env.transparentSrc) {
            return false;
          }

          if (src.indexOf('blob:') === 0) {
            return !uploadStatus.isUploaded(src);
          }

          if (src.indexOf('data:') === 0) {
            return predicate(img);
          }

          return false;
        });

        promises = Arr.map(images, function (img) {
          var newPromise;

          if (cachedPromises[img.src]) {
            // Since the cached promise will return the cached image
            // We need to wrap it and resolve with the actual image
            return new Promise(function (resolve) {
              cachedPromises[img.src].then(function (imageInfo) {
                if (typeof imageInfo === 'string') { // error apparently
                  return imageInfo;
                }
                resolve({
                  image: img,
                  blobInfo: imageInfo.blobInfo
                });
              });
            });
          }

          newPromise = new Promise(function (resolve, reject) {
            imageToBlobInfo(blobCache, img, resolve, reject);
          }).then(function (result) {
            delete cachedPromises[result.image.src];
            return result;
          })['catch'](function (error) {
            delete cachedPromises[img.src];
            return error;
          });

          cachedPromises[img.src] = newPromise;

          return newPromise;
        });

        return Promise.all(promises);
      };

      return {
        findAll: findAll
      };
    };
  }
);