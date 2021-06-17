/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun } from '@ephox/katamari';

import Env from '../api/Env';
import { BlobCache, BlobInfo } from '../api/file/BlobCache';
import Promise from '../api/util/Promise';
import * as Conversions from './Conversions';
import { UploadStatus } from './UploadStatus';

export interface BlobInfoImagePair {
  image: HTMLImageElement;
  blobInfo: BlobInfo;
}

export interface ImageScanner {
  findAll: (elm: HTMLElement, predicate?: (img: HTMLImageElement) => boolean) => Promise<BlobInfoImagePair[]>;
}

/**
 * Finds images with data uris or blob uris. If data uris are found it will convert them into blob uris.
 *
 * @private
 * @class tinymce.file.ImageScanner
 */

let count = 0;

export const uniqueId = (prefix?: string): string => {
  return (prefix || 'blobid') + (count++);
};

const imageToBlobInfo = (blobCache: BlobCache, img: HTMLImageElement, resolve, reject) => {
  let base64, blobInfo;

  if (img.src.indexOf('blob:') === 0) {
    blobInfo = blobCache.getByUri(img.src);

    if (blobInfo) {
      resolve({
        image: img,
        blobInfo
      });
    } else {
      Conversions.uriToBlob(img.src).then((blob) => {
        Conversions.blobToDataUri(blob).then((dataUri) => {
          base64 = Conversions.parseDataUri(dataUri).data;
          blobInfo = blobCache.create(uniqueId(), blob, base64);
          blobCache.add(blobInfo);

          resolve({
            image: img,
            blobInfo
          });
        });
      }, (err) => {
        reject(err);
      });
    }

    return;
  }

  const { data, type } = Conversions.parseDataUri(img.src);
  base64 = data;
  blobInfo = blobCache.getByData(base64, type);

  if (blobInfo) {
    resolve({
      image: img,
      blobInfo
    });
  } else {
    Conversions.uriToBlob(img.src).then((blob) => {
      blobInfo = blobCache.create(uniqueId(), blob, base64);
      blobCache.add(blobInfo);

      resolve({
        image: img,
        blobInfo
      });
    }, (err) => {
      reject(err);
    });
  }
};

const getAllImages = (elm: HTMLElement): HTMLImageElement[] => {
  return elm ? Arr.from(elm.getElementsByTagName('img')) : [];
};

export const ImageScanner = (uploadStatus: UploadStatus, blobCache: BlobCache): ImageScanner => {
  const cachedPromises: Record<string, Promise<BlobInfoImagePair>> = {};

  const findAll = (elm: HTMLElement, predicate?: (img: HTMLImageElement) => boolean) => {
    if (!predicate) {
      predicate = Fun.always;
    }

    const images = Arr.filter(getAllImages(elm), (img) => {
      const src = img.src;

      if (!Env.fileApi) {
        return false;
      }

      if (img.hasAttribute('data-mce-bogus')) {
        return false;
      }

      if (img.hasAttribute('data-mce-placeholder')) {
        return false;
      }

      if (!src || src === Env.transparentSrc) {
        return false;
      }

      if (src.indexOf('blob:') === 0) {
        return !uploadStatus.isUploaded(src) && predicate(img);
      }

      if (src.indexOf('data:') === 0) {
        return predicate(img);
      }

      return false;
    });

    const promises = Arr.map(images, (img): Promise<BlobInfoImagePair> => {
      if (cachedPromises[img.src] !== undefined) {
        // Since the cached promise will return the cached image
        // We need to wrap it and resolve with the actual image
        return new Promise((resolve) => {
          cachedPromises[img.src].then((imageInfo) => {
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

      const newPromise = new Promise<BlobInfoImagePair>((resolve, reject) => {
        imageToBlobInfo(blobCache, img, resolve, reject);
      }).then((result) => {
        delete cachedPromises[result.image.src];
        return result;
      }).catch((error) => {
        delete cachedPromises[img.src];
        return error;
      });

      cachedPromises[img.src] = newPromise;

      return newPromise;
    });

    return Promise.all(promises);
  };

  return {
    findAll
  };
};
