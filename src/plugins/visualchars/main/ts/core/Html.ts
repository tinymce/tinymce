/**
 * Html.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Data from './Data';

const wrapCharWithSpan = function (value) {
  return '<span data-mce-bogus="1" class="mce-' + Data.charMap[value] + '">' + value + '</span>';
};

export default {
  wrapCharWithSpan
};