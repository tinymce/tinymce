/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Promise from 'tinymce/core/api/util/Promise';
import { Blob, FileReader } from '@ephox/dom-globals';

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