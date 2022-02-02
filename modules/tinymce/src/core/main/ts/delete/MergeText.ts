/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Strings, Unicode } from '@ephox/katamari';
import { PredicateFind, Remove, SugarElement } from '@ephox/sugar';

import CaretPosition from '../caret/CaretPosition';
import * as ElementType from '../dom/ElementType';
import * as Nbsps from '../keyboard/Nbsps';
import { isNbsp, isWhiteSpace } from '../text/CharType';

const normalizeContent = (content: string, isStartOfContent: boolean, isEndOfContent: boolean): string => {
  const result = Arr.foldl(content, (acc, c) => {
    // Are we dealing with a char other than some collapsible whitespace or nbsp? if so then just use it as is
    if (isWhiteSpace(c) || isNbsp(c)) {
      if (acc.previousCharIsSpace || (acc.str === '' && isStartOfContent) || (acc.str.length === content.length - 1 && isEndOfContent)) {
        return { previousCharIsSpace: false, str: acc.str + Unicode.nbsp };
      } else {
        return { previousCharIsSpace: true, str: acc.str + ' ' };
      }
    } else {
      return { previousCharIsSpace: false, str: acc.str + c };
    }
  }, { previousCharIsSpace: false, str: '' });

  return result.str;
};

const normalize = (node: Text, offset: number, count: number): void => {
  if (count === 0) {
    return;
  }
  const elm = SugarElement.fromDom(node);
  const root = PredicateFind.ancestor(elm, ElementType.isBlock).getOr(elm);

  // Get the whitespace
  const whitespace = node.data.slice(offset, offset + count);

  // Determine if we're at the end or start of the content
  const isEndOfContent = offset + count >= node.data.length && Nbsps.needsToBeNbspRight(root, CaretPosition(node, node.data.length));
  const isStartOfContent = offset === 0 && Nbsps.needsToBeNbspLeft(root, CaretPosition(node, 0));

  // Replace the original whitespace with the normalized whitespace content
  node.replaceData(offset, count, normalizeContent(whitespace, isStartOfContent, isEndOfContent));
};

const normalizeWhitespaceAfter = (node: Text, offset: number): void => {
  const content = node.data.slice(offset);
  const whitespaceCount = content.length - Strings.lTrim(content).length;

  normalize(node, offset, whitespaceCount);
};

const normalizeWhitespaceBefore = (node: Text, offset: number): void => {
  const content = node.data.slice(0, offset);
  const whitespaceCount = content.length - Strings.rTrim(content).length;

  normalize(node, offset - whitespaceCount, whitespaceCount);
};

const mergeTextNodes = (prevNode: Text, nextNode: Text, normalizeWhitespace?: boolean, mergeToPrev: boolean = true): Text => {
  const whitespaceOffset = Strings.rTrim(prevNode.data).length;
  const newNode = mergeToPrev ? prevNode : nextNode;
  const removeNode = mergeToPrev ? nextNode : prevNode;

  // Merge the elements
  if (mergeToPrev) {
    newNode.appendData(removeNode.data);
  } else {
    newNode.insertData(0, removeNode.data);
  }
  Remove.remove(SugarElement.fromDom(removeNode));

  // Normalize the whitespace around the merged elements, to ensure it doesn't get lost
  if (normalizeWhitespace) {
    normalizeWhitespaceAfter(newNode, whitespaceOffset);
  }

  return newNode;
};

export {
  normalizeWhitespaceAfter,
  normalizeWhitespaceBefore,
  mergeTextNodes
};
