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

const evaluateUntil = function (fns, args) {
  for (let i = 0; i < fns.length; i++) {
    const result = fns[i].apply(null, args);
    if (result.isSome()) {
      return result;
    }
  }

  return Option.none();
};

export default {
  evaluateUntil
};