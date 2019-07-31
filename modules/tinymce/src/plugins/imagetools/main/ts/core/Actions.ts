/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { BlobConversions, ImageTransformations, ResultConversions } from '@ephox/imagetools';
import { Option } from '@ephox/katamari';

import Delay from 'tinymce/core/api/util/Delay';
import Promise from 'tinymce/core/api/util/Promise';
import Tools from 'tinymce/core/api/util/Tools';
import URI from 'tinymce/core/api/util/URI';

import * as Settings from '../api/Settings';
import ImageSize from './ImageSize';
import * as Proxy from './Proxy';
import Editor from 'tinymce/core/api/Editor';
import { HTMLImageElement, Blob, URL } from '@ephox/dom-globals';
import { SelectorFind, Element } from '@ephox/sugar';

let count = 0;

const getFigureImg = (elem) => {
  return SelectorFind.child(Element.fromDom(elem), 'img');
};

const isFigure = (editor: Editor, elem) => {
  return editor.dom.is(elem, 'figure');
};

const getEditableImage = function (editor: Editor, elem) {
  const isImage = (imgNode) => editor.dom.is(imgNode, 'img:not([data-mce-object],[data-mce-placeholder])');
  const isEditable = (imgNode) => isImage(imgNode) && (isLocalImage(editor, imgNode) || isCorsImage(editor, imgNode) || editor.settings.imagetools_proxy);

  if (isFigure(editor, elem)) {
    const imgOpt = getFigureImg(elem);
    return imgOpt.map((img) => {
      return isEditable(img.dom()) ? Option.some(img.dom()) : Option.none();
    });
  }
  return isEditable(elem) ? Option.some(elem) : Option.none();
};

const displayError = function (editor: Editor, error) {
  editor.notificationManager.open({
    text: error,
    type: 'error'
  });
};

const getSelectedImage = (editor: Editor): Option<Element> => {
  const elem = editor.selection.getNode();
  if (isFigure(editor, elem)) {
    return getFigureImg(elem);
  } else {
    return Option.some(Element.fromDom(elem));
  }
};

const extractFilename = function (editor: Editor, url) {
  const m = url.match(/\/([^\/\?]+)?\.(?:jpeg|jpg|png|gif)(?:\?|$)/i);
  if (m) {
    return editor.dom.encode(m[1]);
  }
  return null;
};

const createId = function () {
  return 'imagetools' + count++;
};

const isLocalImage = function (editor: Editor, img) {
  const url = img.src;

  return url.indexOf('data:') === 0 || url.indexOf('blob:') === 0 || new URI(url).host === editor.documentBaseURI.host;
};

const isCorsImage = function (editor: Editor, img) {
  return Tools.inArray(Settings.getCorsHosts(editor), new URI(img.src).host) !== -1;
};

const isCorsWithCredentialsImage = function (editor: Editor, img) {
  return Tools.inArray(Settings.getCredentialsHosts(editor), new URI(img.src).host) !== -1;
};

const defaultFetchImage = (editor: Editor, img: HTMLImageElement) => {
  let src = img.src, apiKey;

  if (isCorsImage(editor, img)) {
    return Proxy.getUrl(img.src, null, isCorsWithCredentialsImage(editor, img));
  }

  if (!isLocalImage(editor, img)) {
    src = Settings.getProxyUrl(editor);
    src += (src.indexOf('?') === -1 ? '?' : '&') + 'url=' + encodeURIComponent(img.src);
    apiKey = Settings.getApiKey(editor);
    return Proxy.getUrl(src, apiKey, false);
  }

  return BlobConversions.imageToBlob(img);
};

const imageToBlob = (editor: Editor, img: HTMLImageElement): Promise<Blob> => {
  return Settings.getFetchImage(editor).fold(
    () => defaultFetchImage(editor, img),
    (customFetchImage) => customFetchImage(img)
  );
};

const findBlob = function (editor: Editor, img) {
  let blobInfo;
  blobInfo = editor.editorUpload.blobCache.getByUri(img.src);
  if (blobInfo) {
    return Promise.resolve(blobInfo.blob());
  }

  return imageToBlob(editor, img);
};

const startTimedUpload = function (editor: Editor, imageUploadTimerState) {
  const imageUploadTimer = Delay.setEditorTimeout(editor, function () {
    editor.editorUpload.uploadImagesAuto();
  }, Settings.getUploadTimeout(editor));

  imageUploadTimerState.set(imageUploadTimer);
};

const cancelTimedUpload = function (imageUploadTimerState) {
  Delay.clearTimeout(imageUploadTimerState.get());
};

const updateSelectedImage = function (editor: Editor, ir, uploadImmediately, imageUploadTimerState, selectedImage, size?) {
  return ir.toBlob().then(function (blob) {
    let uri, name, blobCache, blobInfo;

    blobCache = editor.editorUpload.blobCache;
    uri = selectedImage.src;

    if (Settings.shouldReuseFilename(editor)) {
      blobInfo = blobCache.getByUri(uri);
      if (blobInfo) {
        uri = blobInfo.uri();
        name = blobInfo.name();
      } else {
        name = extractFilename(editor, uri);
      }
    }

    blobInfo = blobCache.create({
      id: createId(),
      blob,
      base64: ir.toBase64(),
      uri,
      name
    });

    blobCache.add(blobInfo);

    editor.undoManager.transact(function () {
      function imageLoadedHandler() {
        editor.$(selectedImage).off('load', imageLoadedHandler);
        editor.nodeChanged();

        if (uploadImmediately) {
          editor.editorUpload.uploadImagesAuto();
        } else {
          cancelTimedUpload(imageUploadTimerState);
          startTimedUpload(editor, imageUploadTimerState);
        }
      }

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

const selectedImageOperation = function (editor: Editor, imageUploadTimerState, fn, size?) {
  return function () {
    const imgOpt = getSelectedImage(editor);
    return imgOpt.fold(() => {
      displayError(editor, 'Could not find selected image');
    }, (img) => {
      return editor._scanForImages().
        then(() => findBlob(editor, img.dom())).
        then(ResultConversions.blobToImageResult).
        then(fn).
        then(function (imageResult) {
          return updateSelectedImage(editor, imageResult, false, imageUploadTimerState, img.dom(), size);
        }, function (error) {
          displayError(editor, error);
        });
    });
  };
};

const rotate = function (editor: Editor, imageUploadTimerState, angle) {
  return function () {
    const imgOpt = getSelectedImage(editor);
    const flippedSize = imgOpt.fold(() => {
      return null;
    }, (img) => {
      const size = ImageSize.getImageSize(img.dom());
      return size ? { w: size.h, h: size.w } : null;
    });

    return selectedImageOperation(editor, imageUploadTimerState, function (imageResult) {
      return ImageTransformations.rotate(imageResult, angle);
    }, flippedSize)();
  };
};

const flip = function (editor: Editor, imageUploadTimerState, axis) {
  return function () {
    return selectedImageOperation(editor, imageUploadTimerState, function (imageResult) {
      return ImageTransformations.flip(imageResult, axis);
    })();
  };
};

const handleDialogBlob = function (editor: Editor, imageUploadTimerState, img, originalSize, blob: Blob) {
  return new Promise(function (resolve) {
    BlobConversions.blobToImage(blob).
      then(function (newImage) {
        const newSize = ImageSize.getNaturalImageSize(newImage);

        if (originalSize.w !== newSize.w || originalSize.h !== newSize.h) {
          if (ImageSize.getImageSize(img)) {
            ImageSize.setImageSize(img, newSize);
          }
        }

        URL.revokeObjectURL(newImage.src);
        return blob;
      }).
      then(ResultConversions.blobToImageResult).
      then(function (imageResult) {
        return updateSelectedImage(editor, imageResult, true, imageUploadTimerState, img);
      }, function () {
        // Close dialog
      });
  });
};

export default {
  rotate,
  flip,
  getEditableImage,
  cancelTimedUpload,
  findBlob,
  getSelectedImage,
  handleDialogBlob
};