/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const charMap = {
  '\u00a0': 'nbsp',
  '\u00ad': 'shy'
};

const charMapToRegExp = function (charMap, global?) {
  let key, regExp = '';

  for (key in charMap) {
    regExp += key;
  }

  return new RegExp('[' + regExp + ']', global ? 'g' : '');
};

const charMapToSelector = function (charMap) {
  let key, selector = '';

  for (key in charMap) {
    if (selector) {
      selector += ',';
    }
    selector += 'span.mce-' + charMap[key];
  }

  return selector;
};

export default {
  charMap,
  regExp: charMapToRegExp(charMap),
  regExpGlobal: charMapToRegExp(charMap, true),
  selector: charMapToSelector(charMap),
  nbspClass: 'mce-nbsp',
  charMapToRegExp,
  charMapToSelector
};