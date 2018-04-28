/**
 * Api.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Actions from '../core/Actions';
import CharMap from '../core/CharMap';

const get = function (editor) {
  const getCharMap = function () {
    return CharMap.getCharMap(editor);
  };

  const insertChar = function (chr) {
    Actions.insertChar(editor, chr);
  };

  return {
    getCharMap,
    insertChar
  };
};

export default {
  get
};