/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Blob, document, Element, FileReader, HTMLElement } from '@ephox/dom-globals';
import Editor from 'tinymce/core/api/Editor';
import { StyleMap } from 'tinymce/core/api/html/Styles';
import Promise from 'tinymce/core/api/util/Promise';
import XHR from 'tinymce/core/api/util/XHR';
import * as Settings from '../api/Settings';
import { ImageData } from './ImageData';

export interface ImageDimensions {
  width: number;
  height: number;
}

// TODO: Figure out if these would ever be something other than numbers. This was added in: #TINY-1350
const parseIntAndGetMax = (val1: any, val2: any) => Math.max(parseInt(val1, 10), parseInt(val2, 10));

const getImageSize = (url: string): Promise<ImageDimensions> => new Promise((callback) => {
  const img = document.createElement('img');

  const done = (dimensions: Promise<ImageDimensions>) => {
    if (img.parentNode) {
      img.parentNode.removeChild(img);
    }

    callback(dimensions);
  };

  img.onload = () => {
    const width = parseIntAndGetMax(img.width, img.clientWidth);
    const height = parseIntAndGetMax(img.height, img.clientHeight);
    const dimensions = { width, height };
    done(Promise.resolve(dimensions));
  };

  img.onerror = () => {
    done(Promise.reject(`Failed to get image dimensions for: ${url}`));
  };

  const style = img.style;
  style.visibility = 'hidden';
  style.position = 'fixed';
  style.bottom = style.left = '0px';
  style.width = style.height = 'auto';

  document.body.appendChild(img);
  img.src = url;
});

const removePixelSuffix = (value: string): string => {
  if (value) {
    value = value.replace(/px$/, '');
  }
  return value;
};

const addPixelSuffix = (value: string): string => {
  if (value.length > 0 && /^[0-9]+$/.test(value)) {
    value += 'px';
  }
  return value;
};

const mergeMargins = (css: StyleMap) => {
  if (css.margin) {
    const splitMargin = String(css.margin).split(' ');

    switch (splitMargin.length) {
      case 1: // margin: toprightbottomleft;
        css['margin-top'] = css['margin-top'] || splitMargin[0];
        css['margin-right'] = css['margin-right'] || splitMargin[0];
        css['margin-bottom'] = css['margin-bottom'] || splitMargin[0];
        css['margin-left'] = css['margin-left'] || splitMargin[0];
        break;
      case 2: // margin: topbottom rightleft;
        css['margin-top'] = css['margin-top'] || splitMargin[0];
        css['margin-right'] = css['margin-right'] || splitMargin[1];
        css['margin-bottom'] = css['margin-bottom'] || splitMargin[0];
        css['margin-left'] = css['margin-left'] || splitMargin[1];
        break;
      case 3: // margin: top rightleft bottom;
        css['margin-top'] = css['margin-top'] || splitMargin[0];
        css['margin-right'] = css['margin-right'] || splitMargin[1];
        css['margin-bottom'] = css['margin-bottom'] || splitMargin[2];
        css['margin-left'] = css['margin-left'] || splitMargin[1];
        break;
      case 4: // margin: top right bottom left;
        css['margin-top'] = css['margin-top'] || splitMargin[0];
        css['margin-right'] = css['margin-right'] || splitMargin[1];
        css['margin-bottom'] = css['margin-bottom'] || splitMargin[2];
        css['margin-left'] = css['margin-left'] || splitMargin[3];
    }

    delete css.margin;
  }

  return css;
};

// TODO: Input on this callback should really be validated
const createImageList = (editor: Editor, callback: (imageList: any) => void) => {
  const imageList = Settings.getImageList(editor);

  if (typeof imageList === 'string') {
    XHR.send({
      url: imageList,
      success(text) {
        callback(JSON.parse(text));
      }
    });
  } else if (typeof imageList === 'function') {
    imageList(callback);
  } else {
    callback(imageList);
  }
};

const waitLoadImage = (editor: Editor, data: ImageData, imgElm: HTMLElement) => {
  const selectImage = () => {
    imgElm.onload = imgElm.onerror = null;

    if (editor.selection) {
      editor.selection.select(imgElm);
      editor.nodeChanged();
    }
  };

  imgElm.onload = () => {
    if (!data.width && !data.height && Settings.hasDimensions(editor)) {
      editor.dom.setAttribs(imgElm, {
        width: String(imgElm.clientWidth),
        height: String(imgElm.clientHeight)
      });
    }

    selectImage();
  };

  imgElm.onerror = selectImage;
};

const blobToDataUri = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    resolve(reader.result);
  };
  reader.onerror = () => {
    reject(reader.error.message);
  };
  reader.readAsDataURL(blob);
});

const isPlaceholderImage = (imgElm: Element): boolean => imgElm.nodeName === 'IMG' && (imgElm.hasAttribute('data-mce-object') || imgElm.hasAttribute('data-mce-placeholder'));

export {
  getImageSize,
  removePixelSuffix,
  addPixelSuffix,
  mergeMargins,
  createImageList,
  waitLoadImage,
  blobToDataUri,
  isPlaceholderImage
};
