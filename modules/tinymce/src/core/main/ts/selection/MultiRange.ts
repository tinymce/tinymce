/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as RangeNodes from './RangeNodes';

const getRanges = (selection) => {
  const ranges = [];

  if (selection) {
    for (let i = 0; i < selection.rangeCount; i++) {
      ranges.push(selection.getRangeAt(i));
    }
  }

  return ranges;
};

const getSelectedNodes = (ranges) => {
  return Arr.bind(ranges, (range) => {
    const node = RangeNodes.getSelectedNode(range);
    return node ? [ SugarElement.fromDom(node) ] : [];
  });
};

const hasMultipleRanges = (selection) => {
  return getRanges(selection).length > 1;
};

export {
  getRanges,
  getSelectedNodes,
  hasMultipleRanges
};
