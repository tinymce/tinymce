/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import SaxParser from '../api/html/SaxParser';
import * as Zwsp from '../text/Zwsp';

const trimHtml = function (tempAttrs, html) {
  const trimContentRegExp = new RegExp([
    '\\s?(' + tempAttrs.join('|') + ')="[^"]+"' // Trim temporaty data-mce prefixed attributes like data-mce-selected
  ].join('|'), 'gi');

  return html.replace(trimContentRegExp, '');
};

const trimInternal = function (serializer, html) {
  let content = html;
  const bogusAllRegExp = /<(\w+) [^>]*data-mce-bogus="all"[^>]*>/g;
  let endTagIndex, index, matchLength, matches;
  const schema = serializer.schema;

  content = trimHtml(serializer.getTempAttrs(), content);
  const shortEndedElements = schema.getShortEndedElements();

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

export {
  trimExternal,
  trimInternal
};
