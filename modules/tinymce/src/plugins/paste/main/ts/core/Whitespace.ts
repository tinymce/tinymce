/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';

// Don't compare other unicode spaces here, as we're only concerned about whitespace the browser would collapse
const isCollapsibleWhitespace = (c: string): boolean => ' \f\t\v'.indexOf(c) !== -1;
const isNewLineChar = (c: string): boolean => c === '\n' || c === '\r';
const isNewline = (text: string, idx: number): boolean => (idx < text.length && idx >= 0) ? isNewLineChar(text[idx]) : false;

// Converts duplicate whitespace to alternating space/nbsps
const normalizeWhitespace = (text: string): string => {
  const result = Arr.foldl(text, (acc, c) => {
    // Are we dealing with a char other than some collapsible whitespace or nbsp? if so then just use it as is
    if (isCollapsibleWhitespace(c) || c === '\u00a0') {
      // If the previous char is a space, we are at the start or end, or if the next char is a new line char, then we need
      // to convert the space to a nbsp
      if (acc.pcIsSpace || acc.str === '' || acc.str.length === text.length - 1 || isNewline(text, acc.str.length + 1)) {
        return { pcIsSpace: false, str: acc.str + '\u00a0' };
      } else {
        return { pcIsSpace: true, str: acc.str + ' ' };
      }
    } else {
      // Treat newlines as being a space, since we'll need to convert any leading spaces to nsbps
      return { pcIsSpace: isNewLineChar(c), str: acc.str + c };
    }
  }, { pcIsSpace: false, str: '' });

  return result.str;
};

export {
  isCollapsibleWhitespace,
  isNewLineChar,
  normalizeWhitespace
};
