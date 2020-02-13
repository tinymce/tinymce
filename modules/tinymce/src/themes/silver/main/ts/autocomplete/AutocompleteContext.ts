/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Range, Text } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import { repeatLeft } from '../alien/TextSearch';
import * as AutocompleteTag from './AutocompleteTag';
import { getText, isValidTextRange, isWhitespace } from './AutocompleteUtils';

export interface AutocompleteContext {
  range: Range;
  text: string;
  triggerChar: string;
}

const stripTriggerChar = (text: string, triggerCh: string) => text.substring(triggerCh.length);

const findChar = (text: string, index: number, ch: string): Option<number> => {
  // Identify the `char` in, and start the text from that point forward. If there is ever any whitespace, fail
  let i;

  for (i = index - 1; i >= 0; i--) {
    const char = text.charAt(i);
    if (isWhitespace(char)) {
      return Option.none();
    }

    if (char === ch) {
      break;
    }
  }

  return Option.some(i);
};

const findStart = (dom: DOMUtils, initRange: Range, ch: string, minChars: number = 0): Option<AutocompleteContext> => {
  if (!isValidTextRange(initRange)) {
    return Option.none();
  }

  const findTriggerChIndex = (element: Text, offset: number, text: string) => {
    // Stop searching by just returning the current offset if whitespace was found (eg Option.none())
    // and we'll handle the final checks below instead
    return findChar(text, offset, ch).getOr(offset);
  };

  const root = dom.getParent(initRange.startContainer, dom.isBlock) || dom.getRoot();
  return repeatLeft(dom, initRange.startContainer, initRange.startOffset, findTriggerChIndex, root).bind((spot) => {
    const range = initRange.cloneRange();
    range.setStart(spot.container, spot.offset);
    range.setEnd(initRange.endContainer, initRange.endOffset);

    // If the range is collapsed then we didn't find a match so abort
    if (range.collapsed) {
      return Option.none();
    }

    const text = getText(range);
    const triggerCharIndex = text.lastIndexOf(ch);

    // If the match doesn't start with the trigger char (eg whitespace found) or the match is less than the minimum number of chars then abort
    if (triggerCharIndex !== 0 || stripTriggerChar(text, ch).length < minChars ) {
      return Option.none();
    } else {
      return Option.some({ text: stripTriggerChar(text, ch), range, triggerChar: ch });
    }
  });
};

const getContext = (dom: DOMUtils, initRange: Range, ch: string, minChars: number = 0): Option<AutocompleteContext> => {
  return AutocompleteTag.detect(Element.fromDom(initRange.startContainer)).fold(
    () => findStart(dom, initRange, ch, minChars),
    (elm) => {
      const range = dom.createRng();
      range.selectNode(elm.dom());
      const text = getText(range);
      return Option.some({ range, text: stripTriggerChar(text, ch), triggerChar: ch });
    }
  );
};

export {
  findChar, // Exposed for testing.
  getContext
};
