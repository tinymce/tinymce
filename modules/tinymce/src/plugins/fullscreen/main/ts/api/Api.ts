/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const get = function (fullscreenState) {
  return {
    isFullscreen () {
      return fullscreenState.get() !== null;
    }
  };
};

export default {
  get
};