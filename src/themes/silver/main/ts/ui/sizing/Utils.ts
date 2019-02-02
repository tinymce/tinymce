/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Option, Type } from '@ephox/katamari';
import { Css, Element } from '@ephox/sugar';

const parseToInt = (val) => {
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

const aggregateCssValues = (elm: Element, styles: string[]) => {
  return Arr.foldl(styles, (acc, name) => {
    return acc + parseToInt(Css.get(elm, name)).getOr(0);
  }, 0);
};

const normalizeHeight = (elm: Element, height: number) => {
  // If using content-box sizing, then we need to take away the border and padding
  // as those will be added in addition to the height by the browser
  if (Css.get(elm, 'box-sizing') === 'content-box') {
    return height - aggregateCssValues(elm, [ 'padding-top', 'padding-bottom', 'border-top-width', 'border-bottom-width' ]);
  } else {
    return height;
  }
};

const normalizeWidth = (elm: Element, width: number) => {
  // If using content-box sizing, then we need to take away the border and padding
  // as those will be added in addition to the width by the browser
  if (Css.get(elm, 'box-sizing') === 'content-box') {
    return width - aggregateCssValues(elm, [ 'padding-left', 'padding-right', 'border-left-width', 'border-right-width' ]);
  } else {
    return width;
  }
};

export default {
  parseToInt,
  numToPx,
  normalizeHeight,
  normalizeWidth
};