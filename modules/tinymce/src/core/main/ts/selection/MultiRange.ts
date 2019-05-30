/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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