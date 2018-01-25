/**
 * Protect.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/api/util/Tools';

declare const escape: any;
declare const unescape: any;

const protectHtml = function (protect, html) {
  Tools.each(protect, function (pattern) {
    html = html.replace(pattern, function (str) {
      return '<!--mce:protected ' + escape(str) + '-->';
    });
  });

  return html;
};

const unprotectHtml = function (html) {
  return html.replace(/<!--mce:protected ([\s\S]*?)-->/g, function (a, m) {
    return unescape(m);
  });
};

export default {
  protectHtml,
  unprotectHtml
};