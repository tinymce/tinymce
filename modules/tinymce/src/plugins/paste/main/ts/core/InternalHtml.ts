/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';

const internalMimeType = 'x-tinymce/html';
const internalMark = '<!-- ' + internalMimeType + ' -->';

const mark = (html: string): string =>
  internalMark + html;

const unmark = (html: string): string =>
  html.replace(internalMark, '');

const isMarked = (html: string): boolean =>
  html.indexOf(internalMark) !== -1;

const internalHtmlMime = Fun.constant(internalMimeType);

export {
  mark,
  unmark,
  isMarked,
  internalHtmlMime
};
