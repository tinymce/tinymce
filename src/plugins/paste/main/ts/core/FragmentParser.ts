/**
 * FragmentParser.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const validContext = /^(p|h[1-6]|li)$/;

const findStartTokenIndex = function (regexp: RegExp, html: string) {
  const matches = regexp.exec(html);
  return matches ? matches.index + matches[0].length : -1;
};

const findEndTokenIndex = function (regexp: RegExp, html: string) {
  const matches = regexp.exec(html);
  return matches ? matches.index : -1;
};

const unwrap = function (startRe: RegExp, endRe: RegExp, html: string) {
  const startIndex = findStartTokenIndex(startRe, html);
  const endIndex = findEndTokenIndex(endRe, html);
  return startIndex !== -1 && endIndex !== -1 ? html.substring(startIndex, endIndex) : html;
};

const parseContext = function (html: string) {
  const matches = /<\/([^>]+)>/g.exec(html);
  return matches ? matches[1].toLowerCase() : 'body';
};

const getFragmentInfo = function (html: string) {
  const startIndex = findStartTokenIndex(/<!--\s*StartFragment\s*-->/g, html);
  const endIndex = findEndTokenIndex(/<!--\s*EndFragment\s*-->/g, html);

  if (startIndex !== -1 && endIndex !== -1) {
    return {
      html: html.substring(startIndex, endIndex),
      context: parseContext(html.substr(endIndex))
    };
  } else {
    return { html, context: 'body' };
  }
};

const unwrapHtml = function (html: string) {
  return unwrap(/<body[^>]*>/gi, /<\/body>/gi,
    unwrap(/<!--\s*StartFragment\s*-->/g, /<!--\s*EndFragment\s*-->/g, html)
  );
};

const getFragmentHtml = function (html: string) {
  const fragmentInfo = getFragmentInfo(html);
  return validContext.test(fragmentInfo.context) ? unwrapHtml(fragmentInfo.html) : unwrapHtml(html);
};

export default {
  getFragmentInfo,
  getFragmentHtml
};