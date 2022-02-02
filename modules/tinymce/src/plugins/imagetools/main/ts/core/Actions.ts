/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { BlobConversions, ImageResult, ImageTransformations, Proxy, ResultConversions } from '@ephox/imagetools';
import { Cell, Optional, Type } from '@ephox/katamari';
import { SelectorFind, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { BlobInfo } from 'tinymce/core/api/file/BlobCache';
import Delay from 'tinymce/core/api/util/Delay';
import Promise from 'tinymce/core/api/util/Promise';
import Tools from 'tinymce/core/api/util/Tools';
import URI from 'tinymce/core/api/util/URI';

import * as Settings from '../api/Settings';
import * as ImageSize from './ImageSize';

let count = 0;

const enum FileExtractType {
  Name = 2,
  NameExt = 1
}

const getFigureImg = (elem: HTMLElement): Optional<SugarElement<HTMLImageElement>> =>
  SelectorFind.child<HTMLImageElement>(SugarElement.fromDom(elem), 'img');

const isFigure = (editor: Editor, elem: Node): elem is HTMLElement =>
  editor.dom.is(elem, 'figure');

const isImage = (editor: Editor, imgNode: Node): imgNode is HTMLImageElement =>
  editor.dom.is(imgNode, 'img:not([data-mce-object],[data-mce-placeholder])');

const getEditableImage = (editor: Editor, node: Node): Optional<HTMLImageElement> => {
  const isEditable = (imgNode: Node): imgNode is HTMLImageElement =>
    isImage(editor, imgNode) && (isLocalImage(editor, imgNode) || isCorsImage(editor, imgNode) || Type.isNonNullable(Settings.getProxyUrl(editor)));

  if (isFigure(editor, node)) {
    return getFigureImg(node).bind((img) => {
      return isEditable(img.dom) ? Optional.some(img.dom) : Optional.none();
    });
  } else {
    return isEditable(node) ? Optional.some(node) : Optional.none();
  }
};

const displayError = (editor: Editor, error: string): void => {
  editor.notificationManager.open({
    text: error,
    type: 'error'
  });
};

const getSelectedImage = (editor: Editor): Optional<SugarElement<HTMLImageElement>> => {
  const elem = editor.selection.getNode();
  const figureElm = editor.dom.getParent(elem, 'figure.image');
  if (figureElm !== null && isFigure(editor, figureElm)) {
    return getFigureImg(figureElm);
  } else if (isImage(editor, elem)) {
    return Optional.some(SugarElement.fromDom(elem));
  } else {
    return Optional.none();
  }
};

const extractFilename = (editor: Editor, url: string, group: FileExtractType): string | null => {
  const m = url.match(/(?:\/|^)(([^\/\?]+)\.(?:[a-z0-9.]+))(?:\?|$)/i);
  return Type.isNonNullable(m) ? editor.dom.encode(m[group]) : null;
};

const createId = (): string =>
  'imagetools' + count++;

const isLocalImage = (editor: Editor, img: HTMLImageElement): boolean => {
  const url = img.src;
  return url.indexOf('data:') === 0 || url.indexOf('blob:') === 0 || new URI(url).host === editor.documentBaseURI.host;
};

const isCorsImage = (editor: Editor, img: HTMLImageElement): boolean =>
  Tools.inArray(Settings.getCorsHosts(editor), new URI(img.src).host) !== -1;

const isCorsWithCredentialsImage = (editor: Editor, img: HTMLImageElement): boolean =>
  Tools.inArray(Settings.getCredentialsHosts(editor), new URI(img.src).host) !== -1;

const defaultFetchImage = (editor: Editor, img: HTMLImageElement): Promise<Blob> => {
  if (isCorsImage(editor, img)) {
    return Proxy.getUrl(img.src, null, isCorsWithCredentialsImage(editor, img));
  }

  if (!isLocalImage(editor, img)) {
    const proxyUrl = Settings.getProxyUrl(editor);
    const src = proxyUrl + (proxyUrl.indexOf('?') === -1 ? '?' : '&') + 'url=' + encodeURIComponent(img.src);
    const apiKey = Settings.getApiKey(editor);
    return Proxy.getUrl(src, apiKey, false);
  }

  return BlobConversions.imageToBlob(img);
};

const imageToBlob = (editor: Editor, img: HTMLImageElement): Promise<Blob> =>
  Settings.getFetchImage(editor).fold(
    () => defaultFetchImage(editor, img),
    (customFetchImage) => customFetchImage(img)
  );

const findBlob = (editor: Editor, img: HTMLImageElement): Promise<Blob> => {
  const blobInfo = editor.editorUpload.blobCache.getByUri(img.src);
  if (blobInfo) {
    return Promise.resolve(blobInfo.blob());
  }

  return imageToBlob(editor, img);
};

const startTimedUpload = (editor: Editor, imageUploadTimerState: Cell<number>): void => {
  const imageUploadTimer = Delay.setEditorTimeout(editor, () => {
    editor.editorUpload.uploadImagesAuto();
  }, Settings.getUploadTimeout(editor));

  imageUploadTimerState.set(imageUploadTimer);
};

const cancelTimedUpload = (imageUploadTimerState: Cell<number>): void => {
  Delay.clearTimeout(imageUploadTimerState.get());
};

const updateSelectedImage = (editor: Editor, origBlob: Blob, ir: ImageResult, uploadImmediately: boolean, imageUploadTimerState: Cell<number>,
                             selectedImage: HTMLImageElement, size?: ImageSize.ImageSize | null): Promise<BlobInfo> => {
  return ir.toBlob().then((blob) => {
    let uri: string, name: string, filename: string, blobInfo: BlobInfo;

    const blobCache = editor.editorUpload.blobCache;
    uri = selectedImage.src;

    // Only reuse the full filename if the mime type hasn't changed. This is needed as browsers may not support manipulating the original format.
    // When that happens, the browser will convert to PNG. See https://html.spec.whatwg.org/multipage/canvas.html#serialising-bitmaps-to-a-file
    const useFilename = origBlob.type === blob.type;

    if (Settings.shouldReuseFilename(editor)) {
      blobInfo = blobCache.getByUri(uri);
      if (Type.isNonNullable(blobInfo)) {
        uri = blobInfo.uri();
        name = blobInfo.name();
        filename = blobInfo.filename();
      } else {
        name = extractFilename(editor, uri, FileExtractType.Name);
        filename = extractFilename(editor, uri, FileExtractType.NameExt);
      }
    }

    blobInfo = blobCache.create({
      id: createId(),
      blob,
      base64: ir.toBase64(),
      uri,
      name,
      filename: useFilename ? filename : undefined
    });

    blobCache.add(blobInfo);

    editor.undoManager.transact(() => {
      const imageLoadedHandler = () => {
        editor.$(selectedImage).off('load', imageLoadedHandler);
        editor.nodeChanged();

        if (uploadImmediately) {
          editor.editorUpload.uploadImagesAuto();
        } else {
          cancelTimedUpload(imageUploadTimerState);
          startTimedUpload(editor, imageUploadTimerState);
        }
      };

      editor.$(selectedImage).on('load', imageLoadedHandler);
      if (size) {
        editor.$(selectedImage).attr({
          width: size.w,
          height: size.h
        });
      }

      editor.$(selectedImage).attr({
        src: blobInfo.blobUri()
      }).removeAttr('data-mce-src');
    });

    return blobInfo;
  });
};

const selectedImageOperation = (editor: Editor, imageUploadTimerState: Cell<number>, fn: (ir: ImageResult) => Promise<ImageResult>, size?: ImageSize.ImageSize | null) => (): void => {
  const imgOpt = getSelectedImage(editor);
  return imgOpt.fold(() => {
    displayError(editor, 'Could not find selected image');
  }, (img) => editor._scanForImages()
    .then(() => findBlob(editor, img.dom))
    .then((blob) => {
      return ResultConversions.blobToImageResult(blob)
        .then(fn)
        .then((imageResult) => updateSelectedImage(editor, blob, imageResult, false, imageUploadTimerState, img.dom, size));
    })
    .catch((error) => {
      displayError(editor, error);
    })
  );
};

const rotate = (editor: Editor, imageUploadTimerState: Cell<number>, angle: number) => (): void => {
  const imgOpt = getSelectedImage(editor);
  const flippedSize = imgOpt.map((img) => {
    const size = ImageSize.getImageSize(img.dom);
    return size ? { w: size.h, h: size.w } : null;
  }).getOrNull();

  return selectedImageOperation(editor, imageUploadTimerState, (imageResult) => {
    return ImageTransformations.rotate(imageResult, angle);
  }, flippedSize)();
};

const flip = (editor: Editor, imageUploadTimerState: Cell<number>, axis: 'v' | 'h') => (): void => {
  return selectedImageOperation(editor, imageUploadTimerState, (imageResult) => {
    return ImageTransformations.flip(imageResult, axis);
  })();
};

const handleDialogBlob = (editor: Editor, imageUploadTimerState: Cell<number>, img: HTMLImageElement, originalSize: ImageSize.ImageSize, blob: Blob): Promise<BlobInfo> => {
  return BlobConversions.blobToImage(blob)
    .then((newImage) => {
      const newSize = ImageSize.getNaturalImageSize(newImage);

      if (originalSize.w !== newSize.w || originalSize.h !== newSize.h) {
        if (ImageSize.getImageSize(img)) {
          ImageSize.setImageSize(img, newSize);
        }
      }

      URL.revokeObjectURL(newImage.src);
      return blob;
    })
    .then(ResultConversions.blobToImageResult)
    .then((imageResult) => updateSelectedImage(editor, blob, imageResult, true, imageUploadTimerState, img));
};

export {
  rotate,
  flip,
  getEditableImage,
  cancelTimedUpload,
  findBlob,
  getSelectedImage,
  handleDialogBlob
};
