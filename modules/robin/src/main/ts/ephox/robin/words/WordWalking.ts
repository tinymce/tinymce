import { Option } from '@ephox/katamari';
import { Direction, Gather } from '@ephox/phoenix';
import WordUtil from '../util/WordUtil';

export interface WordWalking extends Direction {
  slicer: (text: string) => Option<[number, number]>;
}

const walkers = Gather.walkers();

const left = walkers.left();
const right = walkers.right();

const breakToLeft = function (text: string) {
  return WordUtil.leftBreak(text).map(function (index) {
    return [ index + 1, text.length ] as [number, number];
  });
};

const breakToRight = function (text: string) {
  // Will need to generalise the word breaks.
  return WordUtil.rightBreak(text).map(function (index) {
    return [ 0, index ] as [number, number];
  });
};

export const WordWalking = {
  left: {
    sibling: left.sibling,
    first: left.first,
    slicer: breakToLeft
  },
  right: {
    sibling: right.sibling,
    first: right.first,
    slicer: breakToRight
  }
};