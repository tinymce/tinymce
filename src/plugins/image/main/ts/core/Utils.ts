/**
 * Utils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { FileReader } from '@ephox/sand';
import Promise from 'tinymce/core/api/util/Promise';
import Tools from 'tinymce/core/api/util/Tools';
import XHR from 'tinymce/core/api/util/XHR';
import Settings from '../api/Settings';
import { document } from '@ephox/dom-globals';

/**
 * @class tinymce.image.core.Utils
 * @private
 */

const parseIntAndGetMax = function (val1, val2) {
  return Math.max(parseInt(val1, 10), parseInt(val2, 10));
};

const getImageSize = function (url, callback) {
  const img = document.createElement('img');

  function done(width, height) {
    if (img.parentNode) {
      img.parentNode.removeChild(img);
    }

    callback({ width, height });
  }

  img.onload = function () {
    const width = parseIntAndGetMax(img.width, img.clientWidth);
    const height = parseIntAndGetMax(img.height, img.clientHeight);
    done(width, height);
  };

  img.onerror = function () {
    done(0, 0);
  };

  const style = img.style;
  style.visibility = 'hidden';
  style.position = 'fixed';
  style.bottom = style.left = '0px';
  style.width = style.height = 'auto';

  document.body.appendChild(img);
  img.src = url;
};

const buildListItems = function (inputList, itemCallback, startItems?) {
  function appendItems(values, output?) {
    output = output || [];

    Tools.each(values, function (item) {
      const menuItem: any = { text: item.text || item.title };

      if (item.menu) {
        menuItem.menu = appendItems(item.menu);
      } else {
        menuItem.value = item.value;
        itemCallback(menuItem);
      }

      output.push(menuItem);
    });

    return output;
  }

  return appendItems(inputList, startItems || []);
};

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

const mergeMargins = function (css) {
  if (css.margin) {

    const splitMargin = css.margin.split(' ');

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

const createImageList = function (editor, callback) {
  const imageList = Settings.getImageList(editor);

  if (typeof imageList === 'string') {
    XHR.send({
      url: imageList,
      success (text) {
        callback(JSON.parse(text));
      }
    });
  } else if (typeof imageList === 'function') {
    imageList(callback);
  } else {
    callback(imageList);
  }
};

const waitLoadImage = function (editor, data, imgElm) {
  function selectImage() {
    imgElm.onload = imgElm.onerror = null;

    if (editor.selection) {
      editor.selection.select(imgElm);
      editor.nodeChanged();
    }
  }

  imgElm.onload = function () {
    if (!data.width && !data.height && Settings.hasDimensions(editor)) {
      editor.dom.setAttribs(imgElm, {
        width: imgElm.clientWidth,
        height: imgElm.clientHeight
      });
    }

    selectImage();
  };

  imgElm.onerror = selectImage;
};

const blobToDataUri = function (blob) {
  return new Promise<string>(function (resolve, reject) {
    const reader = new FileReader();
    reader.onload = function () {
      resolve(reader.result);
    };
    reader.onerror = function () {
      reject(FileReader.error.message);
    };
    reader.readAsDataURL(blob);
  });
};

const setImageToPreview = function (editor, srcString) {
  const params = Settings.getPreview(editor);
  const preview = document.getElementById(params.id);
  const noImgSrc = 'data:image/jpeg;base64,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';
  if (srcString) {
    preview.innerHTML = `<img src="${srcString}" style="height: 100%;">`;
  }
  else {
    preview.innerHTML = `<img src="${noImgSrc}" style="height: 100%;">`;
  }
}

export default {
  getImageSize,
  buildListItems,
  removePixelSuffix,
  addPixelSuffix,
  mergeMargins,
  createImageList,
  waitLoadImage,
  blobToDataUri,
  setImageToPreview
};