/**
 * MultiRange.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Arr } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import * as RangeNodes from './RangeNodes';

const getRanges = function (selection) {
  const ranges = [];

  if (selection) {
    for (let i = 0; i < selection.rangeCount; i++) {
      ranges.push(selection.getRangeAt(i));
    }
  }

  return ranges;
};

const getSelectedNodes = function (ranges) {
  return Arr.bind(ranges, function (range) {
    const node = RangeNodes.getSelectedNode(range);
    return node ? [ Element.fromDom(node) ] : [];
  });
};

const hasMultipleRanges = function (selection) {
  return getRanges(selection).length > 1;
};

export default {
  getRanges,
  getSelectedNodes,
  hasMultipleRanges
};