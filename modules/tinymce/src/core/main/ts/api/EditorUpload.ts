import { Arr, Strings, Type } from '@ephox/katamari';
import { Attribute, Insert, Remove, SugarElement, SugarElements, SugarNode, Traverse } from '@ephox/sugar';

import * as ErrorReporter from '../ErrorReporter';
import { BlobInfoImagePair, BlobUriError, ImageScanner } from '../file/ImageScanner';
import { Uploader } from '../file/Uploader';
import { UploadStatus } from '../file/UploadStatus';
import * as Rtc from '../Rtc';
import Editor from './Editor';
import Env from './Env';
import { BlobCache, BlobInfo } from './file/BlobCache';
import * as Options from './Options';
import { createUploader, openNotification } from './util/ImageUploader';

/**
 * TinyMCE Editor Upload API
 * Handles image uploads, updates undo stack and patches over various internal functions.
 *
 * @class tinymce.EditorUpload
 * @example
 * // Apply a new filter within the image scan.
 * tinymce.activeEditor.EditorUpload.addFilter((image) => {
 *   const maxSize = 1920 * 1080;
 *   const imageSize = image.width * image.height;
 *   return imageSize < maxSize;
 * });
 *
 * // Upload all valid images in the editor
 * tinymce.activeEditor.EditorUpload.uploadImages();
 *
 * // Scan the editor for valid images
 * tinymce.activeEditor.EditorUpload.scanForImages();
 */

export interface UploadResult {
  element: HTMLImageElement;
  status: boolean;
  blobInfo: BlobInfo;
  uploadUri: string;
  removed: boolean;
}

interface EditorUpload {
  /**
   * Cache of blob elements created in an editor instance.
   *
   * @property blobCache
   * @type Object
   */
  blobCache: BlobCache;

  /**
   * Adds a custom filter that controls the images which are included in the scan.
   * Images must return true on every added filter to be considered valid.
   *
   * @method addFilter
   * @param {Function} filter Function which filters each image upload.
   * @example
   * // Filter which images are uploaded.
   * tinymce.activeEditor.EditorUpload.addFilter((image) => {
   *   const maxSize = 1920 * 1080;
   *   const imageSize = image.width * image.height;
   *   return imageSize < maxSize;
   * });
   */
  addFilter: (filter: (img: HTMLImageElement) => boolean) => void;

  /**
   * Uploads all the data uri/blob uri images scanned from the editor content to the server.
   *
   * @method uploadImages
   * @return {Promise} Promise instance with images and status for each image.
   */
  uploadImages: () => Promise<UploadResult[]>;

  /**
   * Uploads all data uri/blob uri images to the server only when automatic uploads are enabled.
   *
   * @method uploadImagesAuto
   * @return {Promise} Promise instance with images and status for each image.
   */
  uploadImagesAuto: () => Promise<UploadResult[]>;

  /**
   * Scans the editor content for valid image elements and generates blob information for each image.
   *
   * @method scanForImages
   * @return {Promise} Promise instance with element object and blob information for each image.
   */
  scanForImages: () => Promise<BlobInfoImagePair[]>;

  /**
   * Resets the blob data and upload status of all uploaded images. Called automatically on <code>editor.remove</code>.
   * This method is not recommended for integration.
   *
   * @method destroy
   */
  destroy: () => void;
}

const isEmptyForPadding = (editor: Editor, element: SugarElement<any>) =>
  editor.dom.isEmpty(element.dom) && Type.isNonNullable(editor.schema.getTextBlockElements()[SugarNode.name(element)]);

const addPaddingToEmpty = (editor: Editor) =>
  (element: SugarElement<any>) => {
    if (isEmptyForPadding(editor, element)) {
      Insert.append(element, SugarElement.fromHtml('<br data-mce-bogus="1" />'));
    }
  };

const EditorUpload = (editor: Editor): EditorUpload => {
  const blobCache = BlobCache();
  let uploader: Uploader, imageScanner: ImageScanner;
  const uploadStatus = UploadStatus();
  const urlFilters: Array<(img: HTMLImageElement) => boolean> = [];

  const aliveGuard = <T, R> (callback: (result: T) => R) => {
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

    Attribute.setAll(SugarElement.fromDom(image), {
      'src': Options.shouldReuseFileName(editor) ? cacheInvalidator(resultUri) : resultUri,
      'data-mce-src': src
    });
  };

  const uploadImages = (): Promise<UploadResult[]> => {
    if (!uploader) {
      uploader = createUploader(editor, uploadStatus);
    }

    return scanForImages().then(aliveGuard((imageInfos) => {
      const blobInfos = Arr.map(imageInfos, (imageInfo) => imageInfo.blobInfo);

      return uploader.upload(blobInfos, openNotification(editor)).then(aliveGuard((result) => {
        const imagesToRemove: HTMLImageElement[] = [];
        let shouldDispatchChange = false;

        const filteredResult: UploadResult[] = Arr.map(result, (uploadInfo, index) => {
          const { blobInfo, image } = imageInfos[index];
          let removed = false;

          if (uploadInfo.status && Options.shouldReplaceBlobUris(editor)) {
            if (uploadInfo.url && !Strings.contains(image.src, uploadInfo.url)) {
              shouldDispatchChange = true;
            }
            blobCache.removeByUri(image.src);
            if (Rtc.isRtc(editor)) {
              // RTC handles replacing the image URL through callback events
            } else {
              replaceImageUriInView(image, uploadInfo.url);
            }
          } else if (uploadInfo.error) {
            if (uploadInfo.error.remove) {
              replaceUrlInUndoStack(image.src, Env.transparentSrc);
              imagesToRemove.push(image);
              removed = true;
            }

            ErrorReporter.uploadError(editor, uploadInfo.error.message);
          }

          return {
            element: image,
            status: uploadInfo.status,
            uploadUri: uploadInfo.url,
            blobInfo,
            removed
          };
        });

        if (imagesToRemove.length > 0 && !Rtc.isRtc(editor)) {
          editor.undoManager.transact(() => {
            Arr.each(SugarElements.fromDom(imagesToRemove), (sugarElement) => {
              const parentOpt = Traverse.parent(sugarElement);
              Remove.remove(sugarElement);
              // This needs a more editor-wide fix, see issue TINY-9802. Short version: Removing the image resulted in empty <p> elements, which confused the editor.
              parentOpt.each(addPaddingToEmpty(editor));
              blobCache.removeByUri(sugarElement.dom.src);
            });
          });
        } else if (shouldDispatchChange) {
          editor.undoManager.dispatchChange();
        }

        return filteredResult;
      }));
    }));
  };

  const uploadImagesAuto = () =>
    Options.isAutomaticUploadsEnabled(editor) ? uploadImages() : Promise.resolve([]);

  const isValidDataUriImage = (imgElm: HTMLImageElement) =>
    Arr.forall(urlFilters, (filter) => filter(imgElm));

  const addFilter = (filter: (img: HTMLImageElement) => boolean) => {
    urlFilters.push(filter);
  };

  const scanForImages = (): Promise<BlobInfoImagePair[]> => {
    if (!imageScanner) {
      imageScanner = ImageScanner(uploadStatus, blobCache);
    }

    return imageScanner.findAll(editor.getBody(), isValidDataUriImage).then(aliveGuard((result) => {
      const filteredResult = Arr.filter(result, (resultItem): resultItem is BlobInfoImagePair => {
        // ImageScanner internally converts images that it finds, but it may fail to do so if image source is inaccessible.
        // In such case resultItem will contain appropriate text error message, instead of image data.
        if (Type.isString(resultItem)) {
          ErrorReporter.displayError(editor, resultItem);
          return false;
        } else if ((resultItem as BlobUriError).uriType === 'blob') {
          return false;
        } else {
          return true;
        }
      });

      if (Rtc.isRtc(editor)) {
        // RTC is set up so that image sources are only ever blob
      } else {
        Arr.each(filteredResult, (resultItem) => {
          replaceUrlInUndoStack(resultItem.image.src, resultItem.blobInfo.blobUri());
          resultItem.image.src = resultItem.blobInfo.blobUri();
          resultItem.image.removeAttribute('data-mce-src');
        });
      }

      return filteredResult;
    }));
  };

  const destroy = () => {
    blobCache.destroy();
    uploadStatus.destroy();
    imageScanner = uploader = null as any;
  };

  const replaceBlobUris = (content: string) => {
    return content.replace(/src="(blob:[^"]+)"/g, (match, blobUri) => {
      const resultUri = uploadStatus.getResultUri(blobUri);

      if (resultUri) {
        return 'src="' + resultUri + '"';
      }

      let blobInfo = blobCache.getByUri(blobUri);

      if (!blobInfo) {
        blobInfo = Arr.foldl(editor.editorManager.get(), (result: BlobInfo | undefined, editor: Editor) => {
          return result || editor.editorUpload && editor.editorUpload.blobCache.getByUri(blobUri);
        }, undefined);
      }

      if (blobInfo) {
        const blob: Blob = blobInfo.blob();
        return 'src="data:' + blob.type + ';base64,' + blobInfo.base64() + '"';
      }

      return match;
    });
  };

  editor.on('SetContent', () => {
    if (Options.isAutomaticUploadsEnabled(editor)) {
      uploadImagesAuto();
    } else {
      scanForImages();
    }
  });

  editor.on('RawSaveContent', (e) => {
    e.content = replaceBlobUris(e.content);
  });

  editor.on('GetContent', (e) => {
    if (e.source_view || e.format === 'raw' || e.format === 'tree') {
      return;
    }

    e.content = replaceBlobUris(e.content);
  });

  editor.on('PostRender', () => {
    editor.parser.addNodeFilter('img', (images) => {
      Arr.each(images, (img) => {
        const src = img.attr('src');

        if (!src || blobCache.getByUri(src)) {
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
