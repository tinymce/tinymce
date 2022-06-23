import { Obj, Strings, Type } from '@ephox/katamari';

import DomSerializer from '../api/dom/Serializer';
import Schema from '../api/html/Schema';
import * as Zwsp from '../text/Zwsp';

const isConditionalComment = (html: string, startIndex: number) => /^\s*\[if [\w\W]+\]>.*<!\[endif\](--!?)?>/.test(html.substr(startIndex));

const findCommentEndIndex = (html: string, isBogus: boolean, startIndex: number = 0) => {
  const lcHtml = html.toLowerCase();
  if (lcHtml.indexOf('[if ', startIndex) !== -1 && isConditionalComment(lcHtml, startIndex)) {
    const endIfIndex = lcHtml.indexOf('[endif]', startIndex);
    return lcHtml.indexOf('>', endIfIndex);
  } else {
    if (isBogus) {
      const endIndex = lcHtml.indexOf('>', startIndex);
      return endIndex !== -1 ? endIndex : lcHtml.length;
    } else {
      const endCommentRegexp = /--!?>/g;
      endCommentRegexp.lastIndex = startIndex;
      const match = endCommentRegexp.exec(html);
      return match ? match.index + match[0].length : lcHtml.length;
    }
  }
};

/*
 * Returns the index of the matching end tag for a specific start tag. This can
 * be used to skip all children of a parent element from being processed.
 */
const findMatchingEndTagIndex = (schema: Schema, html: string, startIndex: number): number => {
  // TODO: TINY-7658: this regex does not support CDATA
  const startTagRegExp = /<([!?\/])?([A-Za-z0-9\-_:.]+)/g;
  const endTagRegExp = /(?:\s(?:[^'">]+(?:"[^"]*"|'[^']*'))*[^"'>]*(?:"[^">]*|'[^'>]*)?|\s*|\/)>/g;
  const voidElements = schema.getVoidElements();
  let count = 1, index = startIndex;

  // keep finding HTML tags (opening, closing, or neither like comments or <br>s)
  while (count !== 0) {
    startTagRegExp.lastIndex = index;

    // ideally, we only want to run through this the once - but sometimes the startTagRegExp will give us false positives (things that begin
    // like tags, but don't end like them) and so we might need to bump up its lastIndex and try again.
    while (true) {
      const startMatch = startTagRegExp.exec(html);
      if (startMatch === null) {
        // doesn't matter what count is, we've run out of HTML tags
        return index;
      } else if (startMatch[1] === '!') {
        // TODO: TINY-7658 add CDATA support here
        if (Strings.startsWith(startMatch[2], '--')) {
          index = findCommentEndIndex(html, false, startMatch.index + '!--'.length);
        } else {
          index = findCommentEndIndex(html, true, startMatch.index + 1);
        }
        break;
      } else { // it's an element
        endTagRegExp.lastIndex = startTagRegExp.lastIndex;
        const endMatch = endTagRegExp.exec(html);
        // TODO: once we don't need IE, make the regex sticky (will be faster than looking at .index afterwards and throwing out bad matches)
        if (Type.isNull(endMatch) || endMatch.index !== startTagRegExp.lastIndex) {
          // We can skip through to the end of startMatch only because there's no way a "<" could appear halfway through "<name-of-tag"
          continue;
        }

        if (startMatch[1] === '/') { // end of element
          count -= 1;
        } else if (!Obj.has(voidElements, startMatch[2])) { // start of element, specifically not a void element like <br>
          count += 1;
        }

        index = startTagRegExp.lastIndex + endMatch[0].length;
        break;
      }
    }
  }

  return index;
};

const trimHtml = (tempAttrs: string[], html: string): string => {
  const trimContentRegExp = new RegExp([
    '\\s?(' + tempAttrs.join('|') + ')="[^"]+"' // Trim temporary data-mce prefixed attributes like data-mce-selected
  ].join('|'), 'gi');

  return html.replace(trimContentRegExp, '');
};

const trimInternal = (serializer: DomSerializer, html: string): string => {
  const bogusAllRegExp = /<(\w+) [^>]*data-mce-bogus="all"[^>]*>/g;
  const schema = serializer.schema;

  let content = trimHtml(serializer.getTempAttrs(), html);
  const voidElements = schema.getVoidElements();

  // Remove all bogus elements marked with "all"
  let matches: RegExpExecArray | null;
  while ((matches = bogusAllRegExp.exec(content))) {
    const index = bogusAllRegExp.lastIndex;
    const matchLength = matches[0].length;

    let endTagIndex: number;
    if (voidElements[matches[1]]) {
      endTagIndex = index;
    } else {
      endTagIndex = findMatchingEndTagIndex(schema, content, index);
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
  trimInternal,

  // Exported for testing purposes only
  findMatchingEndTagIndex
};
