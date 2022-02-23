import { Fun } from '@ephox/katamari';

const internalMimeType = 'x-tinymce/html';
const internalHtmlMime = Fun.constant(internalMimeType);
const internalMark = '<!-- ' + internalMimeType + ' -->';

const mark = (html: string): string =>
  internalMark + html;

const unmark = (html: string): string =>
  html.replace(internalMark, '');

const isMarked = (html: string): boolean =>
  html.indexOf(internalMark) !== -1;

export {
  mark,
  unmark,
  isMarked,
  internalHtmlMime
};
