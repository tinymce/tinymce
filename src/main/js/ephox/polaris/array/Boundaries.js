import { Arr } from '@ephox/katamari';
import { Fun } from '@ephox/katamari';

var boundAt = function (xs, left, right, comparator) {
  var leftIndex = Arr.findIndex(xs, Fun.curry(comparator, left));
  var first = leftIndex.getOr(0);
  var rightIndex = Arr.findIndex(xs, Fun.curry(comparator, right));
  var last = rightIndex.map(function (rIndex) {
    return rIndex + 1;
  }).getOr(xs.length);
  return xs.slice(first, last);
};

export default <any> {
  boundAt: boundAt
};