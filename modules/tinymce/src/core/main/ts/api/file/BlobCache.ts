/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { URL } from '@ephox/sand';
import Uuid from '../../util/Uuid';
import { Blob } from '@ephox/dom-globals';
import { Type, Fun, Arr } from '@ephox/katamari';

export interface BlobCache {
  create: (o: string | BlobInfoData, blob?: Blob, base64?: string, filename?: string) => BlobInfo;
  add: (blobInfo: BlobInfo) => void;
  get: (id: string) => BlobInfo;
  getByUri: (blobUri: string) => BlobInfo;
  findFirst: (predicate: (blobInfo: BlobInfo) => boolean) => any;
  removeByUri: (blobUri: string) => void;
  destroy: () => void;
}

export interface BlobInfoData {
  id?: string;
  name?: string;
  blob: Blob;
  base64: string;
  blobUri?: string;
  uri?: string;
}

export interface BlobInfo {
  id: () => string;
  name: () => string;
  filename: () => string;
  blob: () => Blob;
  base64: () => string;
  blobUri: () => string;
  uri: () => string;
}

export const BlobCache = function (): BlobCache {
  let cache: BlobInfo[] = [];

  const mimeToExt = function (mime) {
    const mimes = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/gif': 'gif',
      'image/png': 'png'
    };

    return mimes[mime.toLowerCase()] || 'dat';
  };

  const create = function (o: BlobInfoData | string, blob?: Blob, base64?: string, filename?: string): BlobInfo {
    if (Type.isString(o)) {
      const id = o as string;

      return toBlobInfo({
        id,
        name: filename,
        blob,
        base64
      });
    } else if (Type.isObject(o)) {
      return toBlobInfo(o);
    } else {
      throw new Error('Unknown input type');
    }
  };

  const toBlobInfo = function (o: BlobInfoData): BlobInfo {
    let id, name;

    if (!o.blob || !o.base64) {
      throw new Error('blob and base64 representations of the image are required for BlobInfo to be created');
    }

    id = o.id || Uuid.uuid('blobid');
    name = o.name || id;

    return {
      id: Fun.constant(id),
      name: Fun.constant(name),
      filename: Fun.constant(name + '.' + mimeToExt(o.blob.type)),
      blob: Fun.constant(o.blob),
      base64: Fun.constant(o.base64),
      blobUri: Fun.constant(o.blobUri || URL.createObjectURL(o.blob)),
      uri: Fun.constant(o.uri)
    };
  };

  const add = function (blobInfo: BlobInfo) {
    if (!get(blobInfo.id())) {
      cache.push(blobInfo);
    }
  };

  const get = function (id: string): BlobInfo {
    return findFirst(function (cachedBlobInfo) {
      return cachedBlobInfo.id() === id;
    });
  };

  const findFirst = function (predicate: (blobInfo: BlobInfo) => boolean) {
    return Arr.filter(cache, predicate)[0];
  };

  const getByUri = function (blobUri: string): BlobInfo {
    return findFirst(function (blobInfo) {
      return blobInfo.blobUri() === blobUri;
    });
  };

  const removeByUri = function (blobUri: string) {
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
};