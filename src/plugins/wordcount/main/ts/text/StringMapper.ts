/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import UnicodeData from './UnicodeData';
import { Arr } from '@ephox/katamari';

const SETS = UnicodeData.SETS;
const OTHER = UnicodeData.characterIndices.OTHER;

const getType = function (char) {
  let j, set, type = OTHER;
  const setsLength = SETS.length;
  for (j = 0; j < setsLength; ++j) {
    set = SETS[j];

    if (set && set.test(char)) {
      type = j;
      break;
    }
  }
  return type;
};

const memoize = function (func) {
  const cache = {};
  return function (char) {
    if (cache[char]) {
      return cache[char];
    } else {
      const result = func(char);
      cache[char] = result;
      return result;
    }
  };
};

const classify = function (string) {
  const memoized = memoize(getType);
  return Arr.map(string.split(''), memoized);
};

export default {
  classify
};