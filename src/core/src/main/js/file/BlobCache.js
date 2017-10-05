/**
 * BlobCache.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Hold blob info objects where a blob has extra internal information.
 *
 * @private
 * @class tinymce.file.BlobCache
 */
define(
  'tinymce.core.file.BlobCache',
  [
    'ephox.sand.api.URL',
    'tinymce.core.util.Arr',
    'tinymce.core.util.Fun',
    'tinymce.core.util.Uuid'
  ],
  function (URL, Arr, Fun, Uuid) {
    return function () {
      var cache = [], constant = Fun.constant;

      var mimeToExt = function (mime) {
        var mimes = {
          'image/jpeg': 'jpg',
          'image/jpg': 'jpg',
          'image/gif': 'gif',
          'image/png': 'png'
        };

        return mimes[mime.toLowerCase()] || 'dat';
      };

      var create = function (o, blob, base64, filename) {
        return typeof o === 'object' ? toBlobInfo(o) : toBlobInfo({
          id: o,
          name: filename,
          blob: blob,
          base64: base64
        });
      };

      var toBlobInfo = function (o) {
        var id, name;

        if (!o.blob || !o.base64) {
          throw "blob and base64 representations of the image are required for BlobInfo to be created";
        }

        id = o.id || Uuid.uuid('blobid');
        name = o.name || id;

        return {
          id: constant(id),
          name: constant(name),
          filename: constant(name + '.' + mimeToExt(o.blob.type)),
          blob: constant(o.blob),
          base64: constant(o.base64),
          blobUri: constant(o.blobUri || URL.createObjectURL(o.blob)),
          uri: constant(o.uri)
        };
      };

      var add = function (blobInfo) {
        if (!get(blobInfo.id())) {
          cache.push(blobInfo);
        }
      };

      var get = function (id) {
        return findFirst(function (cachedBlobInfo) {
          return cachedBlobInfo.id() === id;
        });
      };

      var findFirst = function (predicate) {
        return Arr.filter(cache, predicate)[0];
      };

      var getByUri = function (blobUri) {
        return findFirst(function (blobInfo) {
          return blobInfo.blobUri() == blobUri;
        });
      };

      var removeByUri = function (blobUri) {
        cache = Arr.filter(cache, function (blobInfo) {
          if (blobInfo.blobUri() === blobUri) {
            URL.revokeObjectURL(blobInfo.blobUri());
            return false;
          }

          return true;
        });
      };

      var destroy = function () {
        Arr.each(cache, function (cachedBlobInfo) {
          URL.revokeObjectURL(cachedBlobInfo.blobUri());
        });

        cache = [];
      };

      return {
        create: create,
        add: add,
        get: get,
        getByUri: getByUri,
        findFirst: findFirst,
        removeByUri: removeByUri,
        destroy: destroy
      };
    };
  }
);