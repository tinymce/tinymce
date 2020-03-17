/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

export const charMap = {
  '\u00a0': 'nbsp',
  '\u00ad': 'shy'
};

export const charMapToRegExp = function (charMap, global?) {
  let key; let regExp = '';

  for (key in charMap) {
    regExp += key;
  }

  return new RegExp('[' + regExp + ']', global ? 'g' : '');
};

export const charMapToSelector = function (charMap) {
  let key; let selector = '';

  for (key in charMap) {
    if (selector) {
      selector += ',';
    }
    selector += 'span.mce-' + charMap[key];
  }

  return selector;
};

export const regExp = charMapToRegExp(charMap);
export const regExpGlobal = charMapToRegExp(charMap, true);
export const selector = charMapToSelector(charMap);
export const nbspClass = 'mce-nbsp';
