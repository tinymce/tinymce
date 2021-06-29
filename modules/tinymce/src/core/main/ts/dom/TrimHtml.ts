/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DomSerializer from '../api/dom/Serializer';
import SaxParser from '../api/html/SaxParser';
import * as Zwsp from '../text/Zwsp';

const trimHtml = (tempAttrs: string[], html: string): string => {
  const trimContentRegExp = new RegExp([
    '\\s?(' + tempAttrs.join('|') + ')="[^"]+"' // Trim temporaty data-mce prefixed attributes like data-mce-selected
  ].join('|'), 'gi');

  return html.replace(trimContentRegExp, '');
};

const trimInternal = (serializer: DomSerializer, html: string): string => {
  const bogusAllRegExp = /<(\w+) [^>]*data-mce-bogus="all"[^>]*>/g;
  const schema = serializer.schema;

  let content = trimHtml(serializer.getTempAttrs(), html);
  const shortEndedElements = schema.getShortEndedElements();

  // Remove all bogus elements marked with "all"
  let matches: RegExpExecArray;
  while ((matches = bogusAllRegExp.exec(content))) {
    const index = bogusAllRegExp.lastIndex;
    const matchLength = matches[0].length;

    let endTagIndex: number;
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
