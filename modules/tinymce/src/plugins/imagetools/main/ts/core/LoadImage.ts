/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Promise from 'tinymce/core/api/util/Promise';

const loadImage = (image: HTMLImageElement): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const loaded = () => {
      image.removeEventListener('load', loaded);
      resolve(image);
    };

    if (image.complete) {
      // Need a timeout due to IE 11 not setting the complete state correctly
      setTimeout(() => resolve(image), 0);
    } else {
      image.addEventListener('load', loaded);
    }
  });
};

export {
  loadImage
};
