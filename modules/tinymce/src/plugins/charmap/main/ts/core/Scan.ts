/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Strings } from '@ephox/katamari';
import { CharMap } from './CharMap';

export interface CharItem {
  value: string;
  icon: string;
  text: string;
}

// Extract codepoint a la ES2015 String.fromCodePoint
// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint
// Unwrapped the polyfill into a local function. typescript and lint.
function stringfromCodePoint(_): string {
  const codeUnits = [];
  let codeLen = 0;
  let result = '';
  for (let index = 0, len = arguments.length; index !== len; ++index) {
    let codePoint = +arguments[index];
    // correctly handles all cases including `NaN`, `-Infinity`, `+Infinity`
    // The surrounding `!(...)` is required to correctly handle `NaN` cases
    // The (codePoint>>>0) === codePoint clause handles decimals and negatives
    if (!(codePoint < 0x10FFFF && (codePoint >>> 0) === codePoint)) {
      throw RangeError('Invalid code point: ' + codePoint);
    }
    if (codePoint <= 0xFFFF) { // BMP code point
      codeLen = codeUnits.push(codePoint);
    } else { // Astral code point; split in surrogate halves
      // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      codePoint -= 0x10000;
      codeLen = codeUnits.push(
        (codePoint >> 10) + 0xD800,  // highSurrogate
        (codePoint % 0x400) + 0xDC00 // lowSurrogate
      );
    }
    if (codeLen >= 0x3fff) {
      result += String.fromCharCode.apply(null, codeUnits);
      codeUnits.length = 0;
    }
  }
  return result + String.fromCharCode.apply(null, codeUnits);
}

const charMatches = (charCode: number, name: string, lowerCasePattern: string): boolean => {
  if (Strings.contains(stringfromCodePoint(charCode).toLowerCase(), lowerCasePattern)) {
    return true;
  } else {
    return Strings.contains(name.toLowerCase(), lowerCasePattern) || Strings.contains(name.toLowerCase().replace(/\s+/g, ''), lowerCasePattern);
  }
};

const scan = (group: CharMap, pattern: string): CharItem[] => {
  const matches: [number, string][] = [];
  const lowerCasePattern = pattern.toLowerCase();
  Arr.each(group.characters, (g) => {
    if (charMatches(g[0], g[1], lowerCasePattern)) {
      matches.push(g);
    }
  });

  return Arr.map(matches, (m) => {
    return {
      text: m[1],
      value: stringfromCodePoint(m[0]),
      icon: stringfromCodePoint(m[0])
    };
  });
};

export {
  scan
};
