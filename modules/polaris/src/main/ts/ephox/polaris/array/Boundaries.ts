import { Arr, Fun } from '@ephox/katamari';

const boundAt = <T, T2>(xs: T[], left: T2, right: T2, comparator: (a: T2, b: T) => boolean): T[] => {
  const leftIndex = Arr.findIndex(xs, Fun.curry(comparator, left));
  const first = leftIndex.getOr(0);
  const rightIndex = Arr.findIndex(xs, Fun.curry(comparator, right));
  const last = rightIndex.map((rIndex) => {
    return rIndex + 1;
  }).getOr(xs.length);
  return xs.slice(first, last);
};

export {
  boundAt
};
