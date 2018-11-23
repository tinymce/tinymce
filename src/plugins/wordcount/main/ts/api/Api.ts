/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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