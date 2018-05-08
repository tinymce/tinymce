/**
 * InternalHtml.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const internalMimeType = 'x-tinymce/html';
const internalMark = '<!-- ' + internalMimeType + ' -->';

const mark = function (html: string) {
  return internalMark + html;
};

const unmark = function (html: string) {
  return html.replace(internalMark, '');
};

const isMarked = function (html: string) {
  return html.indexOf(internalMark) !== -1;
};

export default {
  mark,
  unmark,
  isMarked,
  internalHtmlMime () {
    return internalMimeType;
  }
};