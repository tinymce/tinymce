import { Optional } from '@ephox/katamari';
import { Direction, Gather } from '@ephox/phoenix';
import * as WordUtil from '../util/WordUtil';

export interface WordWalking extends Direction {
  slicer: (text: string) => Optional<[number, number]>;
}

const walkers = Gather.walkers();

const left = walkers.left();
const right = walkers.right();

const breakToLeft = function (text: string): Optional<[number, number]> {
  return WordUtil.leftBreak(text).map(function (index) {
    return [ index + 1, text.length ];
  });
};

const breakToRight = function (text: string): Optional<[number, number]> {
  // Will need to generalise the word breaks.
  return WordUtil.rightBreak(text).map(function (index) {
    return [ 0, index ];
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
