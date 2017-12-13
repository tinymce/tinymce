/**
 * Protect.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/util/Tools';

var protectHtml = function (protect, html) {
  Tools.each(protect, function (pattern) {
    html = html.replace(pattern, function (str) {
      return '<!--mce:protected ' + escape(str) + '-->';
    });
  });

  return html;
};

var unprotectHtml = function (html) {
  return html.replace(/<!--mce:protected ([\s\S]*?)-->/g, function (a, m) {
    return unescape(m);
  });
};

export default <any> {
  protectHtml: protectHtml,
  unprotectHtml: unprotectHtml
};