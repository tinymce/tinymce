import { Gather } from '@ephox/phoenix';
import WordUtil from '../util/WordUtil';

var walkers = Gather.walkers();

var left = walkers.left();
var right = walkers.right();

var breakToLeft = function (text) {
  return WordUtil.leftBreak(text).map(function (index) {
    return [ index + 1, text.length ];
  });
};

var breakToRight = function (text) {
  // Will need to generalise the word breaks.
  return WordUtil.rightBreak(text).map(function (index) {
    return [ 0, index ];
  });
};

export default <any> {
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