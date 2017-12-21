/**
 * Api.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import ImportCss from '../core/ImportCss';

var get = function (editor) {
  var convertSelectorToFormat = function (selectorText) {
    return ImportCss.defaultConvertSelectorToFormat(editor, selectorText);
  };

  return {
    convertSelectorToFormat: convertSelectorToFormat
  };
};

export default <any> {
  get: get
};