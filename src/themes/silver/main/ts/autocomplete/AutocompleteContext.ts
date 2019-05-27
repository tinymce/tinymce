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
import { Phase, repeatLeft } from '../alien/TextSearch';
import * as AutocompleteTag from './AutocompleteTag';

export interface AutocompleteContext {
  range: Range;
  text: string;
  triggerChar: string;
}

const isValidTextRange = (rng: Range): boolean => {
  return rng.collapsed && rng.startContainer.nodeType === 3;
};

const whiteSpace = /[\u00a0 \t\r\n]/;

const parse = (text: string, index: number, ch: string, minChars: number): Option<string> => {
  // Identify the `char` in, and start the text from that point forward. If there is ever any whitespace, fail
  let i;

  for (i = index - 1; i >= 0; i--) {
    const char = text.charAt(i);
    if (whiteSpace.test(char)) {
      return Option.none();
    }

    if (char === ch) {
      break;
    }
  }

  if (i === -1 || index - i < minChars) {
    return Option.none();
  }

  return Option.some(text.substring(i + 1, index));
};

const getText = (rng: Range, ch: string) => {
  // Get the range text minus the trigger char.
  const text = rng.toString().substring(ch.length);
  // Normalize the text by replacing non-breaking spaces with regular spaces and stripping zero-width spaces (fake carets).
  return text.replace(/\u00A0/g, ' ').replace(/\uFEFF/g, '');
};

const findStart = (dom: DOMUtils, initRange: Range, ch: string, minChars: number = 0): Option<AutocompleteContext> => {
  if (!isValidTextRange(initRange)) {
    return Option.none();
  }

  const findTriggerCh = (phase: Phase<AutocompleteContext>, element: Text, text: string, optOffset: Option<number>) => {
    const index = optOffset.getOr(text.length);
    return parse(text, index, ch, 1).fold(
      () => {
        // Abort if we find whitespace, otherwise continue searching
        return text.match(whiteSpace) ? phase.abort() : phase.kontinue();
      },
      (newText) => {
        const range = initRange.cloneRange();
        range.setStart(element, index - newText.length - 1);
        range.setEnd(initRange.endContainer, initRange.endOffset);

        // If the match is less than the minimum number of chars, then abort
        return text.length < minChars ? phase.abort() : phase.finish({ text: getText(range, ch), range, triggerChar: ch });
      }
    );
  };

  return repeatLeft(dom, initRange.startContainer, initRange.startOffset, findTriggerCh).fold(Option.none, Option.none, Option.some);
};

const getContext = (dom: DOMUtils, initRange: Range, ch: string, minChars: number = 0): Option<AutocompleteContext> => {
  return AutocompleteTag.detect(Element.fromDom(initRange.startContainer)).fold(
    () => findStart(dom, initRange, ch, minChars),
    (elm) => {
      const range = dom.createRng();
      range.selectNode(elm.dom());
      return Option.some({ range, text: getText(range, ch), triggerChar: ch });
    }
  );
};

export {
  parse, // Exposed for testing.
  getContext
};