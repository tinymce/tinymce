/**
 * Api.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import WordCount from '../text/WordCount';

const get = function (editor) {
  const getCount = function () {
    return WordCount.getCount(editor);
  };

  return {
    getCount
  };
};

export default {
  get
};