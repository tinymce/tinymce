/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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