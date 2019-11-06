/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option, Type } from '@ephox/katamari';

const parseToInt = (val: string | number): Option<number> => {
  // if size is a number or '_px', will return the number
  const re = /^[0-9\.]+(|px)$/i;
  if (re.test('' + val)) {
    return Option.some(parseInt('' + val, 10));
  }
  return Option.none();
};

const numToPx = (val: string | number): string => {
  return Type.isNumber(val) ? val + 'px' : val;
};

const calcCappedSize = (size: number, minSize: Option<number>, maxSize: Option<number>): number => {
  const minOverride = minSize.filter((min) => size < min);
  const maxOverride = maxSize.filter((max) => size > max);
  return minOverride.or(maxOverride).getOr(size);
};

export default {
  calcCappedSize,
  parseToInt,
  numToPx
};
