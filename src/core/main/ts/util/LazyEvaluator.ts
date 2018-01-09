/**
 * LazyEvaluator.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Option } from '@ephox/katamari';

var evaluateUntil = function (fns, args) {
  for (var i = 0; i < fns.length; i++) {
    var result = fns[i].apply(null, args);
    if (result.isSome()) {
      return result;
    }
  }

  return Option.none();
};

export default {
  evaluateUntil: evaluateUntil
};