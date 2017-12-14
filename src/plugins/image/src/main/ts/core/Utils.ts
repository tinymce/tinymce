/**
 * Utils.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import FileReader from '@ephox/sand/lib/main/ts/ephox/sand/api/FileReader';
import Promise from 'tinymce/core/util/Promise';
import Tools from 'tinymce/core/util/Tools';
import XHR from 'tinymce/core/util/XHR';
import Settings from '../api/Settings';

/**
 * @class tinymce.image.core.Utils
 * @private
 */

var parseIntAndGetMax = function (val1, val2) {
  return Math.max(parseInt(val1, 10), parseInt(val2, 10));
};

var getImageSize = function (url, callback) {
  var img = document.createElement('img');

  function done(width, height) {
    if (img.parentNode) {
      img.parentNode.removeChild(img);
    }

    callback({ width: width, height: height });
  }

  img.onload = function () {
    var width = parseIntAndGetMax(img.width, img.clientWidth);
    var height = parseIntAndGetMax(img.height, img.clientHeight);
    done(width, height);
  };

  img.onerror = function () {
    done(0, 0);
  };

  var style = img.style;
  style.visibility = 'hidden';
  style.position = 'fixed';
  style.bottom = style.left = '0px';
  style.width = style.height = 'auto';

  document.body.appendChild(img);
  img.src = url;
};


var buildListItems = function (inputList, itemCallback, startItems) {
  function appendItems(values, output?) {
    output = output || [];

    Tools.each(values, function (item) {
      var menuItem: any = { text: item.text || item.title };

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

var removePixelSuffix = function (value) {
  if (value) {
    value = value.replace(/px$/, '');
  }
  return value;
};

var addPixelSuffix = function (value) {
  if (value.length > 0 && /^[0-9]+$/.test(value)) {
    value += 'px';
  }
  return value;
};

var mergeMargins = function (css) {
  if (css.margin) {

    var splitMargin = css.margin.split(" ");

    switch (splitMargin.length) {
      case 1: //margin: toprightbottomleft;
        css['margin-top'] = css['margin-top'] || splitMargin[0];
        css['margin-right'] = css['margin-right'] || splitMargin[0];
        css['margin-bottom'] = css['margin-bottom'] || splitMargin[0];
        css['margin-left'] = css['margin-left'] || splitMargin[0];
        break;
      case 2: //margin: topbottom rightleft;
        css['margin-top'] = css['margin-top'] || splitMargin[0];
        css['margin-right'] = css['margin-right'] || splitMargin[1];
        css['margin-bottom'] = css['margin-bottom'] || splitMargin[0];
        css['margin-left'] = css['margin-left'] || splitMargin[1];
        break;
      case 3: //margin: top rightleft bottom;
        css['margin-top'] = css['margin-top'] || splitMargin[0];
        css['margin-right'] = css['margin-right'] || splitMargin[1];
        css['margin-bottom'] = css['margin-bottom'] || splitMargin[2];
        css['margin-left'] = css['margin-left'] || splitMargin[1];
        break;
      case 4: //margin: top right bottom left;
        css['margin-top'] = css['margin-top'] || splitMargin[0];
        css['margin-right'] = css['margin-right'] || splitMargin[1];
        css['margin-bottom'] = css['margin-bottom'] || splitMargin[2];
        css['margin-left'] = css['margin-left'] || splitMargin[3];
    }
    delete css.margin;
  }
  return css;
};

var createImageList = function (editor, callback) {
  var imageList = Settings.getImageList(editor);

  if (typeof imageList === "string") {
    XHR.send({
      url: imageList,
      success: function (text) {
        callback(JSON.parse(text));
      }
    });
  } else if (typeof imageList === "function") {
    imageList(callback);
  } else {
    callback(imageList);
  }
};

var waitLoadImage = function (editor, data, imgElm) {
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

var blobToDataUri = function (blob) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function () {
      resolve(reader.result);
    };
    reader.onerror = function () {
      reject(FileReader.error.message);
    };
    reader.readAsDataURL(blob);
  });
};

export default <any> {
  getImageSize: getImageSize,
  buildListItems: buildListItems,
  removePixelSuffix: removePixelSuffix,
  addPixelSuffix: addPixelSuffix,
  mergeMargins: mergeMargins,
  createImageList: createImageList,
  waitLoadImage: waitLoadImage,
  blobToDataUri: blobToDataUri
};