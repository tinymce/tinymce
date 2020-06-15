/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Blob, URL } from '@ephox/dom-globals';
import { Arr, Fun, Type } from '@ephox/katamari';
import * as Uuid from '../../util/Uuid';

export interface BlobCache {
  create: (o: string | BlobInfoData, blob?: Blob, base64?: string, filename?: string) => BlobInfo;
  add: (blobInfo: BlobInfo) => void;
  get: (id: string) => BlobInfo | undefined;
  getByUri: (blobUri: string) => BlobInfo | undefined;
  getByData: (base64: string, type: string) => BlobInfo | undefined;
  findFirst: (predicate: (blobInfo: BlobInfo) => boolean) => BlobInfo | undefined;
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

export const BlobCache = (): BlobCache => {
  let cache: BlobInfo[] = [];

  const mimeToExt = (mime: string) => {
    const mimes = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/gif': 'gif',
      'image/png': 'png'
    };

    return mimes[mime.toLowerCase()] || 'dat';
  };

  const create = (o: BlobInfoData | string, blob?: Blob, base64?: string, filename?: string): BlobInfo => {
    if (Type.isString(o)) {
      const id = o;

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

  const toBlobInfo = (o: BlobInfoData): BlobInfo => {
    if (!o.blob || !o.base64) {
      throw new Error('blob and base64 representations of the image are required for BlobInfo to be created');
    }

    const id = o.id || Uuid.uuid('blobid');
    const name = o.name || id;

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

  const add = (blobInfo: BlobInfo) => {
    if (!get(blobInfo.id())) {
      cache.push(blobInfo);
    }
  };

  const findFirst = (predicate: (blobInfo: BlobInfo) => boolean) => Arr.find(cache, predicate).getOrUndefined();

  const get = (id: string) =>
    findFirst((cachedBlobInfo) => cachedBlobInfo.id() === id);

  const getByUri = (blobUri: string) =>
    findFirst((blobInfo) => blobInfo.blobUri() === blobUri);

  const getByData = (base64: string, type: string) =>
    findFirst((blobInfo) => blobInfo.base64() === base64 && blobInfo.blob().type === type);

  const removeByUri = (blobUri: string) => {
    cache = Arr.filter(cache, (blobInfo) => {
      if (blobInfo.blobUri() === blobUri) {
        URL.revokeObjectURL(blobInfo.blobUri());
        return false;
      }

      return true;
    });
  };

  const destroy = () => {
    Arr.each(cache, (cachedBlobInfo) => {
      URL.revokeObjectURL(cachedBlobInfo.blobUri());
    });

    cache = [];
  };

  return {
    create,
    add,
    get,
    getByUri,
    getByData,
    findFirst,
    removeByUri,
    destroy
  };
};
