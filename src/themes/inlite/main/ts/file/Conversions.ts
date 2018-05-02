/**
 * Conversions.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { FileReader } from '@ephox/sand';
import Promise from 'tinymce/core/api/util/Promise';
import { Blob } from '@ephox/dom-globals';

const blobToBase64 = function (blob: Blob) {
  return new Promise<string>(function (resolve) {
    const reader = new FileReader();

    reader.onloadend = function () {
      resolve(reader.result.split(',')[1]);
    };

    reader.readAsDataURL(blob);
  });
};

export default {
  blobToBase64
};