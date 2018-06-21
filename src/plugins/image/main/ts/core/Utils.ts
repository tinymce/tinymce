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

export default {
  getImageSize,
  buildListItems,
  removePixelSuffix,
  addPixelSuffix,
  mergeMargins,
  createImageList,
  waitLoadImage,
  blobToDataUri
};