/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const removePxSuffix = function (size: string) {
  return size ? size.replace(/px$/, '') : '';
};

const addSizeSuffix = function (size: string) {
  if (/^[0-9]+$/.test(size)) {
    size += 'px';
  }
  return size;
};

export { addSizeSuffix, removePxSuffix };
