import { Arr, Fun } from '@ephox/katamari';

const boundAt = function (xs, left, right, comparator) {
  const leftIndex = Arr.findIndex(xs, Fun.curry(comparator, left));
  const first = leftIndex.getOr(0);
  const rightIndex = Arr.findIndex(xs, Fun.curry(comparator, right));
  const last = rightIndex.map(function (rIndex) {
    return rIndex + 1;
  }).getOr(xs.length);
  return xs.slice(first, last);
};

export default {
  boundAt
};