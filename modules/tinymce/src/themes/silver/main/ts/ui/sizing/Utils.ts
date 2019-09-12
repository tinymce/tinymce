/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option, Type } from '@ephox/katamari';

const parseToInt = (val): Option<number> => {
  // if size is a number or '_px', will return the number
  const re = /^[0-9\.]+(|px)$/i;
  if (re.test('' + val)) {
    return Option.some(parseInt(val, 10));
  }
  return Option.none();
};

const numToPx = (val) => {
  return Type.isNumber(val) ? val + 'px' : val;
};

export default {
  parseToInt,
  numToPx
};
