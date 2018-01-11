/**
 * Direction.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Fun } from '@ephox/katamari';
import { Direction } from '@ephox/sugar';

const ltr = {
  isRtl: Fun.constant(false)
};

const rtl = {
  isRtl: Fun.constant(true)
};

// Get the directionality from the position in the content
const directionAt = function (element) {
  const dir = Direction.getDirection(element);
  return dir === 'rtl' ? rtl : ltr;
};

export default {
  directionAt
};