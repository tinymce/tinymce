/**
 * BlobCache.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { URL } from '@ephox/sand';
import Arr from '../../util/Arr';
import Fun from '../../util/Fun';
import Uuid from '../../util/Uuid';

export default function () {
  let cache = [];
  const constant = Fun.constant;

  const mimeToExt = function (mime) {
    const mimes = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/gif': 'gif',
      'image/png': 'png'
    };

    return mimes[mime.toLowerCase()] || 'dat';
  };

  const create = function (o, blob?, base64?, filename?) {
    return typeof o === 'object' ? toBlobInfo(o) : toBlobInfo({
      id: o,
      name: filename,
      blob,
      base64
    });
  };

  const toBlobInfo = function (o) {
    let id, name;

    if (!o.blob || !o.base64) {
      throw new Error('blob and base64 representations of the image are required for BlobInfo to be created');
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

  const add = function (blobInfo) {
    if (!get(blobInfo.id())) {
      cache.push(blobInfo);
    }
  };

  const get = function (id) {
    return findFirst(function (cachedBlobInfo) {
      return cachedBlobInfo.id() === id;
    });
  };

  const findFirst = function (predicate) {
    return Arr.filter(cache, predicate)[0];
  };

  const getByUri = function (blobUri) {
    return findFirst(function (blobInfo) {
      return blobInfo.blobUri() === blobUri;
    });
  };

  const removeByUri = function (blobUri) {
    cache = Arr.filter(cache, function (blobInfo) {
      if (blobInfo.blobUri() === blobUri) {
        URL.revokeObjectURL(blobInfo.blobUri());
        return false;
      }

      return true;
    });
  };

  const destroy = function () {
    Arr.each(cache, function (cachedBlobInfo) {
      URL.revokeObjectURL(cachedBlobInfo.blobUri());
    });

    cache = [];
  };

  return {
    create,
    add,
    get,
    getByUri,
    findFirst,
    removeByUri,
    destroy
  };
}