/**
 * Api.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const get = function (toggleState) {
  const isEnabled = function () {
    return toggleState.get();
  };

  return {
    isEnabled
  };
};

export default {
  get
};