/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Strings } from '@ephox/katamari';
import { Text } from '@ephox/dom-globals';
import { Element, Remove } from '@ephox/sugar';

// Don't compare other unicode spaces here, as we're only concerned about whitespace the browser would collapse
const isCollapsibleWhitespace = (c: string): boolean => ' \f\n\r\t\v'.indexOf(c) !== -1;

const normalizeContent = (content: string, isStartOfContent: boolean, isEndOfContent: boolean): string => {
  const result = Arr.foldl(content.split(''), (acc, c) => {
    // Are we dealing with a char other than some collapsible whitespace or nbsp? if so then just use it as is
    if (isCollapsibleWhitespace(c) || c === '\u00a0') {
      if (acc.previousCharIsSpace || (acc.str === '' && isStartOfContent) || (acc.str.length === content.length - 1 && isEndOfContent)) {
        return { previousCharIsSpace: false, str: acc.str + '\u00a0' };
      } else {
        return { previousCharIsSpace: true, str: acc.str + ' ' };
      }
    } else {
      return { previousCharIsSpace: false, str: acc.str + c };
    }
  }, { previousCharIsSpace: false, str: '' });

  return result.str;
};

const normalize = (node: Text, offset: number, count: number) => {
  if (count === 0) {
    return;
  }

  // Get the whitespace
  const whitespace = node.data.slice(offset, offset + count);

  // Determine if we're at the end of start of the content
  const isEndOfContent = offset + count >= node.data.length;
  const isStartOfContent = offset === 0;

  // Replace the original whitespace with the normalized whitespace content
  node.replaceData(offset, count, normalizeContent(whitespace, isStartOfContent, isEndOfContent));
};

const normalizeWhitespaceAfter = (node: Text, offset: number) => {
  const content = node.data.slice(offset);
  const whitespaceCount = content.length - Strings.lTrim(content).length;

  return normalize(node, offset, whitespaceCount);
};

const normalizeWhitespaceBefore = (node: Text, offset: number) => {
  const content = node.data.slice(0, offset);
  const whitespaceCount = content.length - Strings.rTrim(content).length;

  return normalize(node, offset - whitespaceCount, whitespaceCount);
};

const mergeTextNodes = (prevNode: Text, nextNode: Text, normalizeWhitespace?: boolean): Text => {
  const whitespaceOffset = Strings.rTrim(prevNode.data).length;
  // Merge the elements
  prevNode.appendData(nextNode.data);
  Remove.remove(Element.fromDom(nextNode));

  // Normalize the whitespace around the merged elements, to ensure it doesn't get lost
  if (normalizeWhitespace) {
    normalizeWhitespaceAfter(prevNode, whitespaceOffset);
  }

  return prevNode;
};

export {
  normalizeWhitespaceAfter,
  normalizeWhitespaceBefore,
  mergeTextNodes
};