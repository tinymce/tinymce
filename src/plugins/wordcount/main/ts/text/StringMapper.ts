/**
 * StringMapper.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import UnicodeData from './UnicodeData';
import Arr from '../alien/Arr';

var SETS = UnicodeData.SETS;
var OTHER = UnicodeData.characterIndices.OTHER;

var getType = function (char) {
  var j, set, type = OTHER;
  var setsLength = SETS.length;
  for (j = 0; j < setsLength; ++j) {
    set = SETS[j];

    if (set && set.test(char)) {
      type = j;
      break;
    }
  }
  return type;
};

var memoize = function (func) {
  var cache = {};
  return function (char) {
    if (cache[char]) {
      return cache[char];
    } else {
      var result = func(char);
      cache[char] = result;
      return result;
    }
  };
};

var classify = function (string) {
  var memoized = memoize(getType);
  return Arr.map(string.split(''), memoized);
};

export default {
  classify: classify
};