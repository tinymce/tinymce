/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import * as UnicodeData from './UnicodeData';
import { Arr } from '@ephox/katamari';

const SETS = UnicodeData.SETS;
const OTHER = UnicodeData.characterIndices.OTHER;

const getType = (char: string): number => {
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

const memoize = <T extends string | number, U>(func: (v: T) => U) => {
  const cache = {} as Record<T, U>;
  return (char: T): U => {
    if (cache[char]) {
      return cache[char];
    } else {
      const result = func(char);
      cache[char] = result;
      return result;
    }
  };
};

const classify = (str: string) => {
  const memoized = memoize(getType);
  return Arr.map(str.split(''), memoized);
};

export {
  classify
};