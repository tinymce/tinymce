/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as TextSearch from '../alien/TextSearch';
import DOMUtils from '../api/dom/DOMUtils';
import * as AutocompleteTag from './AutocompleteTag';
import { getText, isValidTextRange, isWhitespace } from './AutocompleteUtils';

export interface AutocompleteContext {
  range: Range;
  text: string;
  triggerChar: string;
}

const stripTriggerChar = (text: string, triggerCh: string) => text.substring(triggerCh.length);

const findChar = (text: string, index: number, ch: string): Optional<number> => {
  // Identify the `char` in, and start the text from that point forward. If there is ever any whitespace, fail
  let i;

  for (i = index - 1; i >= 0; i--) {
    const char = text.charAt(i);
    if (isWhitespace(char)) {
      return Optional.none();
    }

    if (char === ch) {
      break;
    }
  }

  return Optional.some(i);
};

const findStart = (dom: DOMUtils, initRange: Range, ch: string, minChars: number = 0): Optional<AutocompleteContext> => {
  if (!isValidTextRange(initRange)) {
    return Optional.none();
  }

  const findTriggerChIndex = (element: Text, offset: number, text: string) =>
    // Stop searching by just returning the current offset if whitespace was found (eg Optional.none())
    // and we'll handle the final checks below instead
    findChar(text, offset, ch).getOr(offset);

  const root = dom.getParent(initRange.startContainer, dom.isBlock) || dom.getRoot();
  return TextSearch.repeatLeft(dom, initRange.startContainer, initRange.startOffset, findTriggerChIndex, root).bind((spot) => {
    const range = initRange.cloneRange();
    range.setStart(spot.container, spot.offset);
    range.setEnd(initRange.endContainer, initRange.endOffset);

    // If the range is collapsed then we didn't find a match so abort
    if (range.collapsed) {
      return Optional.none();
    }

    const text = getText(range);
    const triggerCharIndex = text.lastIndexOf(ch);

    // If the match doesn't start with the trigger char (eg whitespace found) or the match is less than the minimum number of chars then abort
    if (triggerCharIndex !== 0 || stripTriggerChar(text, ch).length < minChars ) {
      return Optional.none();
    } else {
      return Optional.some({ text: stripTriggerChar(text, ch), range, triggerChar: ch });
    }
  });
};

const getContext = (dom: DOMUtils, initRange: Range, ch: string, minChars: number = 0): Optional<AutocompleteContext> =>
  AutocompleteTag.detect(SugarElement.fromDom(initRange.startContainer)).fold(
    () => findStart(dom, initRange, ch, minChars),
    (elm) => {
      const range = dom.createRng();
      range.selectNode(elm.dom);
      const text = getText(range);
      return Optional.some({ range, text: stripTriggerChar(text, ch), triggerChar: ch });
    }
  );

export {
  findChar, // Exposed for testing.
  getContext
};
