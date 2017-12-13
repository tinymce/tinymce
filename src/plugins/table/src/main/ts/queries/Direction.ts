/**
 * Direction.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Fun from '@ephox/katamari/lib/main/ts/ephox/katamari/api/Fun';
import { Direction } from '@ephox/sugar';

var ltr = {
  isRtl: Fun.constant(false)
};

var rtl = {
  isRtl: Fun.constant(true)
};

// Get the directionality from the position in the content
var directionAt = function (element) {
  var dir = Direction.getDirection(element);
  return dir === 'rtl' ? rtl : ltr;
};

export default <any> {
  directionAt: directionAt
};