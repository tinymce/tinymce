/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

function getImageSize(img) {
  let width, height;

  function isPxValue(value) {
    return /^[0-9\.]+px$/.test(value);
  }

  width = img.style.width;
  height = img.style.height;
  if (width || height) {
    if (isPxValue(width) && isPxValue(height)) {
      return {
        w: parseInt(width, 10),
        h: parseInt(height, 10)
      };
    }

    return null;
  }

  width = img.width;
  height = img.height;

  if (width && height) {
    return {
      w: parseInt(width, 10),
      h: parseInt(height, 10)
    };
  }

  return null;
}

function setImageSize(img, size) {
  let width, height;

  if (size) {
    width = img.style.width;
    height = img.style.height;

    if (width || height) {
      img.style.width = size.w + 'px';
      img.style.height = size.h + 'px';
      img.removeAttribute('data-mce-style');
    }

    width = img.width;
    height = img.height;

    if (width || height) {
      img.setAttribute('width', size.w);
      img.setAttribute('height', size.h);
    }
  }
}

function getNaturalImageSize(img) {
  return {
    w: img.naturalWidth,
    h: img.naturalHeight
  };
}

export default {
  getImageSize,
  setImageSize,
  getNaturalImageSize
};