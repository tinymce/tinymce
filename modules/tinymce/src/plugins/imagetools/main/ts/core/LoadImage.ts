/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Promise from 'tinymce/core/api/util/Promise';

const loadImage = function (image) {
  return new Promise(function (resolve) {
    const loaded = function () {
      image.removeEventListener('load', loaded);
      resolve(image);
    };

    if (image.complete) {
      resolve(image);
    } else {
      image.addEventListener('load', loaded);
    }
  });
};

export {
  loadImage
};
