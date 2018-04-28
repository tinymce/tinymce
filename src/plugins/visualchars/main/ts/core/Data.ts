/**
 * Data.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
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
  charMapToRegExp,
  charMapToSelector
};