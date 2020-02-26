/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';

const strPrefix = 'tinymce-mobile';

const resolve = function (p) {
  return strPrefix + '-' + p;
};

const prefix = Fun.constant(strPrefix);

export {
  resolve,
  prefix
};
