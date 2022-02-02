/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

export interface ImageSize {
  readonly w: number;
  readonly h: number;
}

const getImageSize = (img: HTMLImageElement): ImageSize | null => {
  let width, height;

  const isPxValue = (value: string) => {
    return /^[0-9\.]+px$/.test(value);
  };

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
};

const setImageSize = (img: HTMLImageElement, size: ImageSize | null): void => {
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
      img.setAttribute('width', String(size.w));
      img.setAttribute('height', String(size.h));
    }
  }
};

const getNaturalImageSize = (img: HTMLImageElement): ImageSize => ({
  w: img.naturalWidth,
  h: img.naturalHeight
});

export {
  getImageSize,
  setImageSize,
  getNaturalImageSize
};
