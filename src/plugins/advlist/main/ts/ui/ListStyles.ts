/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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