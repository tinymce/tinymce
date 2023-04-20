import { Arr, Fun, Obj, Strings, Type } from '@ephox/katamari';

import Env from '../api/Env';
import { BlobCache, BlobInfo } from '../api/file/BlobCache';
import { imageToBlobInfo } from './BlobCacheUtils';
import { UploadStatus } from './UploadStatus';

export interface BlobInfoImagePair {
  image: HTMLImageElement;
  blobInfo: BlobInfo;
}

export interface BlobUriError {
  uriType: 'blob';
  message: string;
}

export interface ImageScanner {
  findAll: (elm: HTMLElement, predicate?: (img: HTMLImageElement) => boolean) => Promise<Array<BlobInfoImagePair | string | BlobUriError>>;
}

/**
 * Finds images with data uris or blob uris. If data uris are found it will convert them into blob uris.
 *
 * @private
 * @class tinymce.file.ImageScanner
 */

const getAllImages = (elm: HTMLElement): HTMLImageElement[] => {
  return elm ? Arr.from(elm.getElementsByTagName('img')) : [];
};

export const ImageScanner = (uploadStatus: UploadStatus, blobCache: BlobCache): ImageScanner => {
  const cachedPromises: Record<string, Promise<BlobInfoImagePair>> = {};

  const findAll = (elm: HTMLElement, predicate: (img: HTMLImageElement) => boolean = Fun.always) => {
    const images = Arr.filter(getAllImages(elm), (img) => {
      const src = img.src;

      if (img.hasAttribute('data-mce-bogus')) {
        return false;
      }

      if (img.hasAttribute('data-mce-placeholder')) {
        return false;
      }

      if (!src || src === Env.transparentSrc) {
        return false;
      }

      if (Strings.startsWith(src, 'blob:')) {
        return !uploadStatus.isUploaded(src) && predicate(img);
      }

      if (Strings.startsWith(src, 'data:')) {
        return predicate(img);
      }

      return false;
    });

    const promises = Arr.map(images, (img): Promise<BlobInfoImagePair> => {
      const imageSrc = img.src;

      if (Obj.has(cachedPromises, imageSrc)) {
        // Since the cached promise will return the cached image
        // We need to wrap it and resolve with the actual image
        return cachedPromises[imageSrc].then((imageInfo) => {
          if (Type.isString(imageInfo)) { // error apparently
            return imageInfo;
          } else {
            return {
              image: img,
              blobInfo: imageInfo.blobInfo
            };
          }
        });
      } else {
        const newPromise = imageToBlobInfo(blobCache, imageSrc)
          .then((blobInfo) => {
            delete cachedPromises[imageSrc];
            return { image: img, blobInfo };
          }).catch((error) => {
            delete cachedPromises[imageSrc];
            return error;
          });

        cachedPromises[imageSrc] = newPromise;

        return newPromise;
      }
    });

    return Promise.all(promises);
  };

  return {
    findAll
  };
};
