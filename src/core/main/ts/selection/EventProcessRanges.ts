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

const processRanges = function (editor, ranges) {
  return Arr.map(ranges, function (range) {
    const evt = editor.fire('GetSelectionRange', { range });
    return evt.range !== range ? evt.range : range;
  });
};

export default {
  processRanges
};