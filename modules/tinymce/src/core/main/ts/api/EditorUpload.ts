/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Cell } from '@ephox/katamari';

import * as ErrorReporter from '../ErrorReporter';
import { BlobInfoImagePair, ImageScanner } from '../file/ImageScanner';
import { Uploader } from '../file/Uploader';
import { UploadStatus } from '../file/UploadStatus';
import * as Rtc from '../Rtc';
import * as Levels from '../undo/Levels';
import { UndoLevel } from '../undo/UndoManagerTypes';
import Editor from './Editor';
import Env from './Env';
import { BlobCache, BlobInfo } from './file/BlobCache';
import * as Settings from './Settings';
import { createUploader, openNotification } from './util/ImageUploader';

/**
 * Handles image uploads, updates undo stack and patches over various internal functions.
 *
 * @private
 * @class tinymce.EditorUpload
 */

export interface UploadResult {
  element: HTMLImageElement;
  status: boolean;
  blobInfo: BlobInfo;
  uploadUri: string;
}

export type UploadCallback = (results: UploadResult[]) => void;

interface EditorUpload {
  blobCache: BlobCache;
  addFilter: (filter: (img: HTMLImageElement) => boolean) => void;
  uploadImages: (callback?: UploadCallback) => Promise<UploadResult[]>;
  uploadImagesAuto: (callback?: UploadCallback) => void | Promise<UploadResult[]>;
  scanForImages: () => Promise<BlobInfoImagePair[]>;
  destroy: () => void;
}

const UploadChangeHandler = (editor: Editor) => {
  const lastChangedLevel = Cell<UndoLevel>(null);

  editor.on('change AddUndo', (e) => {
    lastChangedLevel.set({ ...e.level });
  });

  const fireIfChanged = () => {
    const data = editor.undoManager.data;
    Arr.last(data).filter((level) => {
      return !Levels.isEq(lastChangedLevel.get(), level);
    }).each((level) => {
      editor.setDirty(true);
      editor.fire('change', {
        level,
        lastLevel: Arr.get(data, data.length - 2).getOrNull()
      });
    });
  };

  return {
    fireIfChanged
  };
};

const EditorUpload = (editor: Editor): EditorUpload => {
  const blobCache = BlobCache();
  let uploader: Uploader, imageScanner: ImageScanner;
  const uploadStatus = UploadStatus();
  const urlFilters: Array<(img: HTMLImageElement) => boolean> = [];
  const changeHandler = UploadChangeHandler(editor);

  const aliveGuard = <T, R> (callback?: (result: T) => R) => {
    return (result: T) => {
      if (editor.selection) {
        return callback(result);
      }

      return [];
    };
  };

  const cacheInvalidator = (url: string): string => url + (url.indexOf('?') === -1 ? '?' : '&') + (new Date()).getTime();

  // Replaces strings without regexps to avoid FF regexp to big issue
  const replaceString = (content: string, search: string, replace: string): string => {
    let index = 0;

    do {
      index = content.indexOf(search, index);

      if (index !== -1) {
        content = content.substring(0, index) + replace + content.substr(index + search.length);
        index += replace.length - search.length + 1;
      }
    } while (index !== -1);

    return content;
  };

  const replaceImageUrl = (content: string, targetUrl: string, replacementUrl: string): string => {
    const replacementString = `src="${replacementUrl}"${replacementUrl === Env.transparentSrc ? ' data-mce-placeholder="1"' : ''}`;

    content = replaceString(content, `src="${targetUrl}"`, replacementString);

    content = replaceString(content, 'data-mce-src="' + targetUrl + '"', 'data-mce-src="' + replacementUrl + '"');

    return content;
  };

  const replaceUrlInUndoStack = (targetUrl: string, replacementUrl: string) => {
    Arr.each(editor.undoManager.data, (level) => {
      if (level.type === 'fragmented') {
        level.fragments = Arr.map(level.fragments, (fragment) =>
          replaceImageUrl(fragment, targetUrl, replacementUrl)
        );
      } else {
        level.content = replaceImageUrl(level.content, targetUrl, replacementUrl);
      }
    });
  };

  const replaceImageUriInView = (image: HTMLImageElement, resultUri: string) => {
    const src = editor.convertURL(resultUri, 'src');

    replaceUrlInUndoStack(image.src, resultUri);

    editor.$(image).attr({
      'src': Settings.shouldReuseFileName(editor) ? cacheInvalidator(resultUri) : resultUri,
      'data-mce-src': src
    });
  };

  const uploadImages = (callback?: UploadCallback): Promise<UploadResult[]> => {
    if (!uploader) {
      uploader = createUploader(editor, uploadStatus);
    }

    return scanForImages().then(aliveGuard((imageInfos) => {
      const blobInfos = Arr.map(imageInfos, (imageInfo) => imageInfo.blobInfo);

      return uploader.upload(blobInfos, openNotification(editor)).then(aliveGuard((result) => {
        const imagesToRemove: HTMLImageElement[] = [];

        const filteredResult: UploadResult[] = Arr.map(result, (uploadInfo, index) => {
          const blobInfo = imageInfos[index].blobInfo;
          const image = imageInfos[index].image;

          if (uploadInfo.status && Settings.shouldReplaceBlobUris(editor)) {
            blobCache.removeByUri(image.src);
            if (Rtc.isRtc(editor)) {
              // RTC handles replacing the image URL through callback events
            } else {
              replaceImageUriInView(image, uploadInfo.url);
            }
          } else if (uploadInfo.error) {
            if (uploadInfo.error.options.remove) {
              replaceUrlInUndoStack(image.getAttribute('src'), Env.transparentSrc);
              imagesToRemove.push(image);
            }

            ErrorReporter.uploadError(editor, uploadInfo.error.message);
          }

          return {
            element: image,
            status: uploadInfo.status,
            uploadUri: uploadInfo.url,
            blobInfo
          };
        });

        if (filteredResult.length > 0) {
          changeHandler.fireIfChanged();
        }

        if (imagesToRemove.length > 0) {
          if (Rtc.isRtc(editor)) {
            // TODO TINY-7735 replace with RTC API to remove images
            console.error('Removing images on failed uploads is currently unsupported for RTC'); // eslint-disable-line no-console
          } else {
            editor.undoManager.transact(() => {
              Arr.each(imagesToRemove, (element) => {
                editor.dom.remove(element);
                blobCache.removeByUri(element.src);
              });
            });
          }
        }

        if (callback) {
          callback(filteredResult);
        }

        return filteredResult;
      }));
    }));
  };

  const uploadImagesAuto = (callback?: UploadCallback) => {
    if (Settings.isAutomaticUploadsEnabled(editor)) {
      return uploadImages(callback);
    }
  };

  const isValidDataUriImage = (imgElm: HTMLImageElement) => {
    if (Arr.forall(urlFilters, (filter) => filter(imgElm)) === false) {
      return false;
    }

    if (imgElm.getAttribute('src').indexOf('data:') === 0) {
      const dataImgFilter = Settings.getImagesDataImgFilter(editor);
      return dataImgFilter(imgElm);
    }

    return true;
  };

  const addFilter = (filter: (img: HTMLImageElement) => boolean) => {
    urlFilters.push(filter);
  };

  const scanForImages = (): Promise<BlobInfoImagePair[]> => {
    if (!imageScanner) {
      imageScanner = ImageScanner(uploadStatus, blobCache);
    }

    return imageScanner.findAll(editor.getBody(), isValidDataUriImage).then(aliveGuard((result) => {
      result = Arr.filter(result, (resultItem) => {
        // ImageScanner internally converts images that it finds, but it may fail to do so if image source is inaccessible.
        // In such case resultItem will contain appropriate text error message, instead of image data.
        if (typeof resultItem === 'string') {
          ErrorReporter.displayError(editor, resultItem);
          return false;
        }
        return true;
      });

      if (Rtc.isRtc(editor)) {
        // RTC is set up so that image sources are only ever blob
      } else {
        Arr.each(result, (resultItem) => {
          replaceUrlInUndoStack(resultItem.image.src, resultItem.blobInfo.blobUri());
          resultItem.image.src = resultItem.blobInfo.blobUri();
          resultItem.image.removeAttribute('data-mce-src');
        });
      }

      return result;
    }));
  };

  const destroy = () => {
    blobCache.destroy();
    uploadStatus.destroy();
    imageScanner = uploader = null;
  };

  const replaceBlobUris = (content: string) => {
    return content.replace(/src="(blob:[^"]+)"/g, (match, blobUri) => {
      const resultUri = uploadStatus.getResultUri(blobUri);

      if (resultUri) {
        return 'src="' + resultUri + '"';
      }

      let blobInfo = blobCache.getByUri(blobUri);

      if (!blobInfo) {
        blobInfo = Arr.foldl(editor.editorManager.get(), (result, editor) => {
          return result || editor.editorUpload && editor.editorUpload.blobCache.getByUri(blobUri);
        }, null);
      }

      if (blobInfo) {
        const blob: Blob = blobInfo.blob();
        return 'src="data:' + blob.type + ';base64,' + blobInfo.base64() + '"';
      }

      return match;
    });
  };

  editor.on('SetContent', () => {
    if (Settings.isAutomaticUploadsEnabled(editor)) {
      uploadImagesAuto();
    } else {
      scanForImages();
    }
  });

  editor.on('RawSaveContent', (e) => {
    e.content = replaceBlobUris(e.content);
  });

  editor.on('GetContent', (e) => {
    // if the content is not a string, we can't process it
    if (e.source_view || e.format === 'raw' || e.format === 'tree') {
      return;
    }

    e.content = replaceBlobUris(e.content);
  });

  editor.on('PostRender', () => {
    editor.parser.addNodeFilter('img', (images) => {
      Arr.each(images, (img) => {
        const src = img.attr('src');

        if (blobCache.getByUri(src)) {
          return;
        }

        const resultUri = uploadStatus.getResultUri(src);
        if (resultUri) {
          img.attr('src', resultUri);
        }
      });
    });
  });

  return {
    blobCache,
    addFilter,
    uploadImages,
    uploadImagesAuto,
    scanForImages,
    destroy
  };
};

export default EditorUpload;
