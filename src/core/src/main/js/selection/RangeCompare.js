/**
 * RangeCompare.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.selection.RangeCompare',
  [
  ],
  function () {
    var isEq = function (rng1, rng2) {
      return rng1 && rng2 &&
        (rng1.startContainer === rng2.startContainer && rng1.startOffset === rng2.startOffset) &&
        (rng1.endContainer === rng2.endContainer && rng1.endOffset === rng2.endOffset);
    };

    return {
      isEq: isEq
    };
  }
);
