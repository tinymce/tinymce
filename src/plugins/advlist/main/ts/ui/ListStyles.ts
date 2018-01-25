/**
 * ListStyles.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';

const styleValueToText = function (styleValue) {
  return styleValue.replace(/\-/g, ' ').replace(/\b\w/g, function (chr) {
    return chr.toUpperCase();
  });
};

const toMenuItems = function (styles) {
  return Tools.map(styles, function (styleValue) {
    const text = styleValueToText(styleValue);
    const data = styleValue === 'default' ? '' : styleValue;

    return { text, data };
  });
};

export default {
  toMenuItems
};