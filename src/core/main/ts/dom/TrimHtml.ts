/**
 * TrimHtml.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import SaxParser from '../api/html/SaxParser';
import Zwsp from '../text/Zwsp';

const trimHtml = function (tempAttrs, html) {
  const trimContentRegExp = new RegExp([
    '\\s?(' + tempAttrs.join('|') + ')="[^"]+"' // Trim temporaty data-mce prefixed attributes like data-mce-selected
  ].join('|'), 'gi');

  return html.replace(trimContentRegExp, '');
};

const trimInternal = function (serializer, html) {
  let content = html;
  const bogusAllRegExp = /<(\w+) [^>]*data-mce-bogus="all"[^>]*>/g;
  let endTagIndex, index, matchLength, matches, shortEndedElements;
  const schema = serializer.schema;

  content = trimHtml(serializer.getTempAttrs(), content);
  shortEndedElements = schema.getShortEndedElements();

  // Remove all bogus elements marked with "all"
  while ((matches = bogusAllRegExp.exec(content))) {
    index = bogusAllRegExp.lastIndex;
    matchLength = matches[0].length;

    if (shortEndedElements[matches[1]]) {
      endTagIndex = index;
    } else {
      endTagIndex = SaxParser.findEndTag(schema, content, index);
    }

    content = content.substring(0, index - matchLength) + content.substring(endTagIndex);
    bogusAllRegExp.lastIndex = index - matchLength;
  }

  return Zwsp.trim(content);
};

// We might need external/internal trimming in the future so lets keep the separation
const trimExternal = trimInternal;

export default {
  trimExternal,
  trimInternal
};