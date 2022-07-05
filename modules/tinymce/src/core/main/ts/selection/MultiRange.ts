import { Arr } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import * as RangeNodes from './RangeNodes';

const getRanges = (selection: Selection | null): Range[] => {
  const ranges: Range[] = [];

  if (selection) {
    for (let i = 0; i < selection.rangeCount; i++) {
      ranges.push(selection.getRangeAt(i));
    }
  }

  return ranges;
};

const getSelectedNodes = (ranges: Range[]): SugarElement<Node>[] => {
  return Arr.bind(ranges, (range) => {
    const node = RangeNodes.getSelectedNode(range);
    return node ? [ SugarElement.fromDom(node) ] : [];
  });
};

const hasMultipleRanges = (selection: Selection | null): boolean => {
  return getRanges(selection).length > 1;
};

export {
  getRanges,
  getSelectedNodes,
  hasMultipleRanges
};
