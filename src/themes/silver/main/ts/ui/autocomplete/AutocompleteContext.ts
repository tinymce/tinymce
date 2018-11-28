/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Range } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';

// TODO: Obviously, move out of UI

const isValidTextRange = (rng: Range): boolean => {
  return rng.collapsed && rng.startContainer.nodeType === 3;
};

const whiteSpace = /[\u00a0 \t\r\n]/;

const parse = (text: string, index: number, ch: string, minChars): Option<string> => {
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

const getContext = (initRange: Range, ch: string, text: string, index: number, minChars: number = 0 ): Option<{ rng: Range, text: string }> => {
  if (!isValidTextRange(initRange)) {
    return Option.none();
  }

  return parse(text, index, ch, minChars).map((newText) => {
    const rng = initRange.cloneRange();
    rng.setStart(initRange.startContainer, initRange.startOffset - newText.length - 1);
    rng.setEnd(initRange.startContainer, initRange.startOffset);

    return {
      text: newText,
      rng
    };
  });
};

export {
  parse, // Exposed for testing.
  getContext
};