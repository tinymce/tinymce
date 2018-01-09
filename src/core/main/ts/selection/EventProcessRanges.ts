/**
 * EventProcessRanges.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr } from '@ephox/katamari';

var processRanges = function (editor, ranges) {
  return Arr.map(ranges, function (range) {
    var evt = editor.fire('GetSelectionRange', { range: range });
    return evt.range !== range ? evt.range : range;
  });
};

export default {
  processRanges: processRanges
};