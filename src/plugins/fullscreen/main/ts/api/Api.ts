/**
 * Api.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

var get = function (fullscreenState) {
  return {
    isFullscreen: function () {
      return fullscreenState.get() !== null;
    }
  };
};

export default {
  get: get
};