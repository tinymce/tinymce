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
import { Range } from '@ephox/dom-globals';

const processRanges = (editor, ranges: Range[]): Range[] => {
  return Arr.map(ranges, (range) => {
    const evt = editor.fire('GetSelectionRange', { range });
    return evt.range !== range ? evt.range : range;
  });
};

export default {
  processRanges
};