/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Range, Text } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import { Phase, repeatLeft } from '../../alien/TextSearch';

// TODO: Obviously, move out of UI

const isValidTextRange = (rng: Range): boolean => {
  return rng.collapsed && rng.startContainer.nodeType === 3;
};

const whiteSpace = /[\u00a0 \t\r\n]/;

const parse = (text: string, index: number, ch: string, minChars: number): Option<string> => {
  // Identify the `char` in, and start the text from that point forward. If there is ever any whitespace, fail
  let i;

  for (i = index - 1; i >= 0; i--) {
    if (whiteSpace.test(text.charAt(i))) {
      return Option.none();
    }

    if (text.charAt(i) === ch) {
      break;
    }
  }

  if (i === -1 || index - i < minChars) {
    return Option.none();
  }

  return Option.some(text.substring(i + 1, index));
};

const getContext = (dom: DOMUtils, initRange: Range, ch: string, minChars: number = 0): Option<{ rng: Range, text: string }> => {
  if (!isValidTextRange(initRange)) {
    return Option.none();
  }

  const findTriggerCh = (phase: Phase<{ rng: Range, text: string }>, element: Text, text: string, optOffset: Option<number>) => {
    const index = optOffset.getOr(text.length);
    return parse(text, index, ch, 1).fold(
      () => {
        // Abort if we find whitespace, otherwise continue searching
        return text.match(whiteSpace) ? phase.abort() : phase.kontinue();
      },
      (newText) => {
        const rng = initRange.cloneRange();
        rng.setStart(element, index - newText.length - 1);
        rng.setEnd(initRange.endContainer, initRange.endOffset);

        const text = rng.toString().substring(ch.length);

        // If the match is less than the minimum number of chars, then abort
        return text.length < minChars ? phase.abort() : phase.finish({ text, rng });
      }
    );
  };

  return repeatLeft(dom, initRange.startContainer, initRange.startOffset, findTriggerCh).fold(Option.none, Option.none, Option.some);
};

export {
  parse, // Exposed for testing.
  getContext
};